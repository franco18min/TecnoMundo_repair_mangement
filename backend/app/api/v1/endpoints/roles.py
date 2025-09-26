# backend/app/api/v1/endpoints/roles.py

from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Role])
def read_roles(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user), # <-- Protegido para cualquier usuario autenticado
) -> Any:
    """
    Recupera la lista de roles del sistema.
    """
    roles = crud.role.get_multi(db, skip=skip, limit=limit)
    return roles