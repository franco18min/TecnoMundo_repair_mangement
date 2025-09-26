# backend/app/schemas/user.py

from pydantic import BaseModel
from typing import Optional
from .branch import Branch

class Role(BaseModel):
    role_name: str
    class Config:
        from_attributes = True

class UserWithRole(BaseModel):
    id: int
    username: str
    email: str
    role: Role
    branch: Optional[Branch] = None
    is_active: bool  # Añadimos el estado para el frontend

    class Config:
        from_attributes = True

class User(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

# --- INICIO DE LA MODIFICACIÓN ---
class UserCreateByAdmin(UserCreate):
    role_id: int
    branch_id: int

class UserUpdateByAdmin(BaseModel):
    email: Optional[str] = None
    role_id: Optional[int] = None
    branch_id: Optional[int] = None
    is_active: Optional[bool] = None
# --- FIN DE LA MODIFICACIÓN ---

class UserInDB(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None