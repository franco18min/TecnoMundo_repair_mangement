# backend/app/api/v1/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session, joinedload

from app.core.security import SECRET_KEY, ALGORITHM
from app.db.session import SessionLocal
from app.crud import crud_user
from app.models.user import User

# Esta es la URL a la que el frontend enviará el usuario y contraseña
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
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

    # Usamos joinedload para traer también la información del rol
    user = db.query(User).options(joinedload(User.role)).filter(User.username == username).first()

    if user is None:
        raise credentials_exception
    return user