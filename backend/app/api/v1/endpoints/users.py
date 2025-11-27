# backend/app/api/v1/endpoints/users.py

from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud import crud_user, crud_role, crud_branch
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.api.v1 import dependencies as deps
from app.schemas.user import UserWithRole, UserCreateByAdmin, UserUpdateByAdmin

router = APIRouter()

@router.get("/me", response_model=UserWithRole)
def read_current_user(current_user: User = Depends(deps.get_current_active_user)):
    """
    Obtiene los datos del usuario actualmente autenticado.
    Ahora protegido para asegurar que el usuario esté activo.
    """
    return current_user

@router.get("/", response_model=List[UserWithRole])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: str = 'all',
    current_user: User = Depends(deps.get_current_active_admin),
):
    """
    Recupera una lista de usuarios.
    - `status`: 'all', 'active', 'inactive'.
    """
    users = crud_user.get_multi(db, skip=skip, limit=limit, status=status)
    return users

@router.post("/", response_model=UserWithRole)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreateByAdmin,
    current_user: User = Depends(deps.get_current_active_admin),
):
    """
    Crea un nuevo usuario (solo para administradores).
    """
    user = crud_user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    email_taken = crud_user.get_by_email(db, email=user_in.email)
    if email_taken:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    role = crud_role.get(db, id=user_in.role_id)
    if not role:
        raise HTTPException(
            status_code=404,
            detail=f"The role with id {user_in.role_id} does not exist.",
        )
    if user_in.branch_id:
        branch = crud_branch.get(db, id=user_in.branch_id)
        if not branch:
            raise HTTPException(
                status_code=404,
                detail=f"The branch with id {user_in.branch_id} does not exist.",
            )
    try:
        user = crud_user.create(db, obj_in=user_in)
        return user
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Duplicate value violates unique constraint (username/email)")

@router.put("/{user_id}", response_model=UserWithRole)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdateByAdmin,
    current_user: User = Depends(deps.get_current_active_admin),
):
    """
    Actualiza un usuario (solo para administradores).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    if user_in.role_id:
        role = crud_role.get(db, id=user_in.role_id)
        if not role:
            raise HTTPException(
                status_code=404,
                detail=f"The role with id {user_in.role_id} does not exist.",
            )
    if user_in.email:
        email_taken = crud_user.get_by_email(db, email=user_in.email)
        if email_taken and email_taken.id != user_id:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
    if user_in.branch_id:
        branch = crud_branch.get(db, id=user_in.branch_id)
        if not branch:
            raise HTTPException(
                status_code=404,
                detail=f"The branch with id {user_in.branch_id} does not exist.",
            )
    try:
        user = crud_user.update(db, db_obj=user, obj_in=user_in, admin_user=current_user)
        return user
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Duplicate value violates unique constraint (username/email)")
