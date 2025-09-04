# backend/app/schemas/user.py

from pydantic import BaseModel
from typing import Optional

# --- INICIO DE LA MODIFICACIÓN ---
# Nuevo schema para representar el rol
class Role(BaseModel):
    role_name: str
    class Config:
        from_attributes = True

# Nuevo schema para devolver el usuario completo con su rol
class UserWithRole(BaseModel):
    id: int
    username: str
    email: str
    role: Role

    class Config:
        from_attributes = True
# --- FIN DE LA MODIFICACIÓN ---


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
    # En tu modelo User no tienes 'is_active', así que lo comentamos o eliminamos
    # is_active: bool

    class Config:
        from_attributes = True

# --- Esquemas para Autenticación ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None