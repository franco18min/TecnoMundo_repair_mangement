# backend/app/api/v1/dependencies.py

from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.core.security import SECRET_KEY, ALGORITHM
from app.db.session import SessionLocal
from app.crud import crud_user
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- INICIO DE LA MODIFICACIÓN ---
async def get_current_user_from_token(
        token: Optional[str] = Query(None),
        db: Session = Depends(get_db)
) -> Optional[User]:
    if token is None:
        return None

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).options(joinedload(User.role)).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


# --- FIN DE LA MODIFICACIÓN ---


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    # ... (esta función no cambia)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).options(joinedload(User.role)).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user