# backend/app/api/v1/endpoints/branches.py

from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.crud import crud_branch
from app.schemas.branch import Branch, BranchCreate, BranchUpdate
from pydantic import BaseModel
from app.api.v1 import dependencies as deps

router = APIRouter()

# Schema específico para configuración de tickets
class TicketConfigUpdate(BaseModel):
    client_header_style: str = None
    workshop_header_style: str = None
    client_body_content: str = None
    workshop_body_content: str = None
    client_body_style: str = None
    workshop_body_style: str = None

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

@router.put("/{branch_id}/ticket-config", response_model=Branch)
def update_branch_ticket_config(
    *,
    db: Session = Depends(deps.get_db),
    branch_id: int,
    config_in: TicketConfigUpdate,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
):
    """
    Actualiza la configuración de tickets de una sucursal (solo para administradores).
    """
    branch = crud_branch.get(db, id=branch_id)
    if not branch:
        raise HTTPException(
            status_code=404,
            detail="The branch with this ID does not exist in the system.",
        )
    
    # Convertir el modelo Pydantic a diccionario y filtrar valores None
    update_data = {k: v for k, v in config_in.dict().items() if v is not None}
    
    # Crear un objeto BranchUpdate con solo los campos de configuración de tickets
    branch_update = BranchUpdate(**update_data)
    
    branch = crud_branch.update(db, db_obj=branch, obj_in=branch_update)
    return branch

@router.get("/{branch_id}/ticket-config")
def get_branch_ticket_config(
    *,
    db: Session = Depends(deps.get_db),
    branch_id: int,
    current_user: models.user.User = Depends(deps.get_current_active_user),
):
    """
    Obtiene la configuración de tickets de una sucursal específica.
    """
    branch = crud_branch.get(db, id=branch_id)
    if not branch:
        raise HTTPException(
            status_code=404,
            detail="The branch with this ID does not exist in the system.",
        )
    
    return {
        "branch_id": branch.id,
        "branch_name": branch.branch_name,
        "client_header_style": branch.client_header_style or '{}',
        "workshop_header_style": branch.workshop_header_style or '{}',
        "client_body_content": branch.client_body_content or '',
        "workshop_body_content": branch.workshop_body_content or '',
        "client_body_style": branch.client_body_style or '{}',
        "workshop_body_style": branch.workshop_body_style or '{}'
    }
