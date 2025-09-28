# backend/app/crud/crud_role.py

from sqlalchemy.orm import Session
from app.models.roles import Role
from typing import Optional

def get(db: Session, id: int) -> Optional[Role]:
    """
    Obtiene un rol por su ID.
    """
    return db.query(Role).filter(Role.id == id).first()
