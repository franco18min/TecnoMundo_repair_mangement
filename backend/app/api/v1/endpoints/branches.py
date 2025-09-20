# backend/app/api/v1/endpoints/branches.py

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud import crud_branch
from app.schemas import branch as schemas_branch
from app.api.v1.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[schemas_branch.Branch], dependencies=[Depends(get_current_user)])
def read_branches(db: Session = Depends(get_db)):
    """
    Endpoint para obtener la lista de todas las sucursales.
    """
    branches = crud_branch.get_branches(db)
    return branches