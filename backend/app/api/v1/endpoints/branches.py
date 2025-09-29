# backend/app/api/v1/endpoints/branches.py

from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.crud import crud_branch
from app.schemas.branch import Branch, BranchCreate, BranchUpdate
from app.api.v1 import dependencies as deps

router = APIRouter()

@router.get("/", response_model=List[Branch])
def read_branches(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.user.User = Depends(deps.get_current_active_user), # <-- Guardia actualizado
):
    """
    Recupera una lista de sucursales. Solo para usuarios activos.
    """
    branches = crud_branch.get_multi(db, skip=skip, limit=limit)
    return branches

@router.post("/", response_model=Branch)
def create_branch(
    *,
    db: Session = Depends(deps.get_db),
    branch_in: BranchCreate,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
):
    """
    Crea una nueva sucursal (solo para administradores).
    """
    branch = crud_branch.create(db, obj_in=branch_in)
    return branch

@router.put("/{branch_id}", response_model=Branch)
def update_branch(
    *,
    db: Session = Depends(deps.get_db),
    branch_id: int,
    branch_in: BranchUpdate,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
):
    """
    Actualiza una sucursal (solo para administradores).
    """
    branch = crud_branch.get(db, id=branch_id)
    if not branch:
        raise HTTPException(
            status_code=404,
            detail="The branch with this ID does not exist in the system.",
        )
    branch = crud_branch.update(db, db_obj=branch, obj_in=branch_in)
    return branch
