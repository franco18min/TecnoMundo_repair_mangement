# backend/app/api/v1/endpoints/users.py
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps  # <-- deps YA INCLUYE get_current_user Y get_current_admin_user

router = APIRouter()


# --- ENDPOINTS DE GESTIÓN (PARA ADMINS) ---

@router.get("/", response_model=List[schemas.UserWithRole])
def read_users(
        db: Session = Depends(deps.get_db),
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = "all",
        current_user: models.User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Recupera la lista de usuarios con opción de filtrado por estado.
    """
    users = crud.user.get_multi(db, skip=skip, limit=limit, status=status)
    return users


@router.post("/", response_model=schemas.UserWithRole)
def create_user(
        *,
        db: Session = Depends(deps.get_db),
        user_in: schemas.UserCreateByAdmin,
        current_user: models.User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Crea un nuevo usuario (solo para administradores).
    """
    user = crud.user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un usuario con este nombre de usuario.",
        )

    role = crud.role.get(db, id=user_in.role_id)
    if not role:
        raise HTTPException(status_code=404, detail=f"Rol con id {user_in.role_id} no encontrado")

    branch = crud.branch.get(db, id=user_in.branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail=f"Sucursal con id {user_in.branch_id} no encontrada")

    user = crud.user.create(db, obj_in=user_in)
    return user


@router.put("/{user_id}", response_model=schemas.UserWithRole)
def update_user(
        *,
        db: Session = Depends(deps.get_db),
        user_id: int,
        user_in: schemas.UserUpdateByAdmin,
        current_admin_user: models.User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Actualiza un usuario (solo para administradores).
    """
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="El usuario no existe en el sistema",
        )

    if user_in.role_id:
        role = crud.role.get(db, id=user_in.role_id)
        if not role:
            raise HTTPException(status_code=404, detail=f"Rol con id {user_in.role_id} no encontrado")

    if user_in.branch_id:
        branch = crud.branch.get(db, id=user_in.branch_id)
        if not branch:
            raise HTTPException(status_code=404, detail=f"Sucursal con id {user_in.branch_id} no encontrada")

    user = crud.user.update(db, db_obj=user, obj_in=user_in, admin_user=current_admin_user)
    return user


# --- INICIO DE LA CORRECCIÓN ---
# --- ENDPOINT PARA EL PROPIO USUARIO ---

@router.get("/me", response_model=schemas.UserWithRole)
def read_user_me(
        current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Obtiene los datos del usuario actualmente autenticado.
    """
    return current_user
# --- FIN DE LA CORRECCIÓN ---