# backend/app/api/v1/endpoints/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import traceback

from app.crud import crud_user
from app.schemas.user import Token, UserCreate, UserInDB
from app.core.security import create_access_token, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES
from app.api.v1.dependencies import get_db

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Endpoint de inicio de sesión para obtener un token de acceso.
    """
    try:
        user = crud_user.get_by_username(db, username=form_data.username)

        if not user or not verify_password(form_data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # --- INICIO DE LA CORRECCIÓN DE SEGURIDAD ---
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario está inactivo y no puede iniciar sesión.",
            )
        # --- FIN DE LA CORRECCIÓN DE SEGURIDAD ---

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        traceback.print_exc()
        raise e

@router.post("/register", response_model=UserInDB)
def register_new_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint para que un nuevo usuario se registre.
    """
    db_user = crud_user.get_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
    
    return crud_user.create_public_user(db=db, obj_in=user)
