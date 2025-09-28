# backend/app/crud/crud_user.py

from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserCreateByAdmin, UserUpdateByAdmin
from app.core.security import get_password_hash
import logging
from typing import Optional, List

def get_by_username(db: Session, *, username: str) -> Optional[User]:
    """
    Busca un usuario por su nombre de usuario.
    """
    return db.query(User).filter(User.username == username).first()

def get_multi(db: Session, *, skip: int = 0, limit: int = 100, status: str = 'all') -> List[User]:
    """
    Recupera múltiples usuarios con filtrado por estado (activo/inactivo).
    """
    if status == 'active':
        return db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()
    elif status == 'inactive':
        return db.query(User).filter(User.is_active == False).offset(skip).limit(limit).all()
    else:
        return db.query(User).offset(skip).limit(limit).all()

def create_public_user(db: Session, *, obj_in: UserCreate) -> User:
    """
    Crea un nuevo usuario público (ej. desde un formulario de registro).
    A este usuario se le asignará un rol y sucursal por defecto si es necesario.
    """
    hashed_password = get_password_hash(obj_in.password)
    db_obj = User(
        username=obj_in.username,
        email=obj_in.email,
        password=hashed_password,
        # Aquí podrías asignar un role_id y branch_id por defecto si tu lógica lo requiere
        # role_id=default_role_id,
        # branch_id=default_branch_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def create(db: Session, *, obj_in: UserCreateByAdmin) -> User:
    """
    Crea un nuevo usuario con rol y sucursal especificados por un administrador.
    """
    hashed_password = get_password_hash(obj_in.password)
    db_obj = User(
        username=obj_in.username,
        email=obj_in.email,
        password=hashed_password,
        role_id=obj_in.role_id,
        branch_id=obj_in.branch_id,
        is_active=obj_in.is_active
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, *, db_obj: User, obj_in: UserUpdateByAdmin, admin_user: User) -> User:
    """
    Actualiza un usuario. Incluye lógica de auditoría para cambios de estado.
    """
    update_data = obj_in.dict(exclude_unset=True)

    # Lógica de auditoría
    if 'is_active' in update_data and db_obj.is_active != update_data['is_active']:
        logging.info(f"Admin '{admin_user.username}' cambió el estado de is_active del usuario '{db_obj.username}' a '{update_data['is_active']}'")

    for field, value in update_data.items():
        setattr(db_obj, field, value)

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
