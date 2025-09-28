# backend/app/api/v1/endpoints/roles.py

from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models
from app.crud import crud_role
from app.schemas.role import Role
from app.api.v1 import dependencies as deps

router = APIRouter()

@router.get("/", response_model=List[Role])
def read_roles(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
):
    """
    Obtiene una lista de todos los roles.
    """
    # Esta es una implementación simple. En una app real, podrías querer paginación.
    roles = db.query(models.roles.Role).all()
    return roles
