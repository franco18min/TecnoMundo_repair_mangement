# backend/app/schemas/role.py

from pydantic import BaseModel

class Role(BaseModel):
    id: int
    role_name: str

    class Config:
        from_attributes = True
