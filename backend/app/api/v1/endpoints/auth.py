# backend/app/api/v1/endpoints/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import traceback  # Importamos la librería para trazar errores

from app.crud import crud_user
from app.schemas.user import Token, UserCreate, UserInDB
from app.core.security import create_access_token, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db.session import SessionLocal

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login", response_model=Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    print("\n=====================================================")
    print(f"--- 🕵️‍♂️ Petición de login recibida para el usuario: {form_data.username} ---")

    try:
        user = crud_user.get_user_by_username(db, username=form_data.username)
        print(f"--- ✅ Usuario encontrado en la BD: {'Sí' if user else 'No'} ---")

        if not user or not verify_password(form_data.password, user.password):
            print("--- ❌ Credenciales incorrectas. ---")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        print("--- ✅ Credenciales verificadas correctamente. Creando token... ---")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        print("--- ✨ Token creado. Enviando respuesta. ---")
        print("=====================================================\n")
        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        # --- ¡ESTE BLOQUE ATRAPARÁ Y MOSTRARÁ CUALQUIER ERROR! ---
        print("\n\n--- 🚨 ¡HA OCURRIDO UN ERROR INESPERADO EN EL BACKEND! 🚨 ---")
        traceback.print_exc()  # Imprime el error completo en la consola
        print("============================================\n\n")
        raise e  # Vuelve a lanzar el error para que FastAPI responda con un 500


# El endpoint de registro no se modifica
@router.post("/register", response_model=UserInDB)
def register_new_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
    return crud_user.create_user(db=db, user=user)