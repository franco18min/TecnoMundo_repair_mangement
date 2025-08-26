# backend/app/schemas/user.py
from pydantic import BaseModel
from typing import Optional

# Esquema para mostrar la información pública de un usuario (ej. un técnico)
class User(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

# --- Esquemas para Usuarios ---
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# --- Esquemas para Autenticación ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None