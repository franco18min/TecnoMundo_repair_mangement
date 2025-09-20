# backend/app/crud/crud_branch.py

from sqlalchemy.orm import Session
from app.models.branch import Branch as BranchModel

def get_branches(db: Session):
    """
    Obtiene todas las sucursales de la base de datos.
    """
    return db.query(BranchModel).order_by(BranchModel.branch_name).all()