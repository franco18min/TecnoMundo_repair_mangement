# backend/app/api/v1/endpoints/branches.py
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Branch])
def read_branches(
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
        # Se elimina la dependencia de usuario para que sea accesible públicamente si es necesario,
        # o se puede añadir `current_user: models.User = Depends(deps.get_current_user)` si se requiere autenticación.
        # Por ahora, se asume que la lista de sucursales puede ser pública.
):
    """
    Recupera la lista de sucursales.
    """
    branches = crud.branch.get_multi(db, skip=skip, limit=limit)
    return branches


# --- INICIO DE LA MODIFICACIÓN ---

@router.post("/", response_model=schemas.Branch)
def create_branch(
        *,
        db: Session = Depends(deps.get_db),
        branch_in: schemas.BranchCreate,
        current_user: models.User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Crea una nueva sucursal (solo para administradores).
    """
    branch = crud.branch.create(db, obj_in=branch_in)
    return branch


@router.put("/{branch_id}", response_model=schemas.Branch)
def update_branch(
        *,
        db: Session = Depends(deps.get_db),
        branch_id: int,
        branch_in: schemas.BranchUpdate,
        current_user: models.User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Actualiza una sucursal (solo para administradores).
    """
    branch = crud.branch.get(db, id=branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")

    branch = crud.branch.update(db, db_obj=branch, obj_in=branch_in)
    return branch

# --- FIN DE LA MODIFICACIÓN ---