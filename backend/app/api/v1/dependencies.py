# backend/app/api/v1/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.security import SECRET_KEY, ALGORITHM
from app.db.session import SessionLocal
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_from_token(db: Session, token: str) -> Optional[User]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
    except JWTError:
        return None
    user = db.query(User).options(joinedload(User.role), joinedload(User.branch)).filter(User.username == username).first()
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user = get_user_from_token(db=db, token=token)
    if user is None:
        raise credentials_exception
    return user

# --- CAPA 2: EL GUARDIA ESTÁNDAR ---
def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Obtiene el usuario actual y verifica que esté activo.
    Este es el nuevo estándar de seguridad para todos los endpoints operativos.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="El usuario está inactivo y no tiene permisos.")
    return current_user

# --- CAPA 3: GUARDIAS ESPECIALIZADOS (POR ROL) ---
def get_current_active_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Verifica que el usuario actual sea un administrador activo.
    """
    if not current_user.role or current_user.role.role_name != "Administrator":
        raise HTTPException(status_code=403, detail="No tiene los permisos suficientes para realizar esta acción.")
    return current_user

def get_current_active_admin_or_receptionist(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Verifica que el usuario actual sea un administrador o recepcionista activo.
    Acepta variantes comunes del nombre del rol para robustez.
    """
    role_name = (current_user.role.role_name if current_user.role else "").lower()
    allowed = {"administrator", "receptionist", "recepcionist", "recepcionista"}
    if role_name not in allowed:
        raise HTTPException(status_code=403, detail="No tiene los permisos suficientes para realizar esta acción.")
    return current_user

# --- INICIO DE LA CORRECCIÓN ---
def get_current_active_technician_or_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Verifica que el usuario actual sea un técnico o administrador activo.
    """
    if not current_user.role or current_user.role.role_name not in ["Administrator", "Technical"]:
        raise HTTPException(status_code=403, detail="Solo un técnico o administrador puede realizar esta acción.")
    return current_user
# --- FIN DE LA CORRECCIÓN ---
