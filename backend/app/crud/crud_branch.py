# backend/app/crud/crud_branch.py

from sqlalchemy.orm import Session
from app.models.branch import Branch
from app.schemas.branch import BranchCreate, BranchUpdate
from typing import List, Optional

def get(db: Session, id: int) -> Optional[Branch]:
    """
    Obtiene una sucursal por su ID.
    """
    return db.query(Branch).filter(Branch.id == id).first()

def get_branch(db: Session, branch_id: int) -> Optional[Branch]:
    """
    Obtiene una sucursal por su ID (alias para compatibilidad).
    """
    return get(db, id=branch_id)

def get_multi(db: Session, *, skip: int = 0, limit: int = 100) -> List[Branch]:
    """
    Obtiene una lista de sucursales.
    """
    return db.query(Branch).offset(skip).limit(limit).all()

def create(db: Session, *, obj_in: BranchCreate) -> Branch:
    """
    Crea una nueva sucursal.
    """
    db_obj = Branch(
        branch_name=obj_in.branch_name,
        company_name=obj_in.company_name,
        address=obj_in.address,
        phone=obj_in.phone,
        email=obj_in.email,
        icon_name=obj_in.icon_name or 'Building'
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, *, db_obj: Branch, obj_in: BranchUpdate) -> Branch:
    """
    Actualiza una sucursal.
    """
    update_data = obj_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
