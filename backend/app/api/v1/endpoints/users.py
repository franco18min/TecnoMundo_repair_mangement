# backend/app/api/v1/endpoints/users.py

from fastapi import APIRouter, Depends
from app.schemas.user import UserWithRole
from app.models.user import User
from app.api.v1.dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserWithRole)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Obtiene los datos del usuario actualmente autenticado, incluyendo su rol.
    """
    return current_user