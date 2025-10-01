# backend/app/schemas/user.py

from pydantic import BaseModel, validator
from typing import Optional
import re
from .branch import Branch
from .role import Role

# Nuevo schema para devolver el usuario completo con su rol
class UserWithRole(BaseModel):
    id: int
    username: str
    email: str
    role: Role
    branch: Optional[Branch] = None
    is_active: bool  # <-- CAMPO AÑADIDO

    class Config:
        from_attributes = True

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
    class Config:
        from_attributes = True

# --- Esquemas para Autenticación ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Schemas para la gestión de usuarios por un administrador
class UserCreateByAdmin(BaseModel):
    username: str
    email: str
    password: str
    role_id: int
    branch_id: Optional[int] = None
    is_active: bool = True

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('La contraseña debe contener al menos una letra')
        if not re.search(r'\d', v):
            raise ValueError('La contraseña debe contener al menos un número')
        return v

class UserUpdateByAdmin(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None  # Campo para cambio de contraseña
    role_id: Optional[int] = None
    branch_id: Optional[int] = None
    is_active: Optional[bool] = None

    @validator('password')
    def validate_password(cls, v):
        if v is not None and v.strip():  # Solo validar si se proporciona una contraseña
            if len(v) < 8:
                raise ValueError('La contraseña debe tener al menos 8 caracteres')
            if not re.search(r'[A-Za-z]', v):
                raise ValueError('La contraseña debe contener al menos una letra')
            if not re.search(r'\d', v):
                raise ValueError('La contraseña debe contener al menos un número')
        return v
