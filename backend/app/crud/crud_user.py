# backend/app/crud/crud_user.py

from sqlalchemy.orm import Session
from app.models.user import User
from app.models.roles import Role
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
    """
    hashed_password = get_password_hash(obj_in.password)
    db_obj = User(
        username=obj_in.username,
        email=obj_in.email,
        password=hashed_password,
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

    if 'is_active' in update_data and db_obj.is_active != update_data['is_active']:
        logging.info(f"Admin '{admin_user.username}' cambió el estado de is_active del usuario '{db_obj.username}' a '{update_data['is_active']}'")

    for field, value in update_data.items():
        setattr(db_obj, field, value)

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# --- INICIO DE LA CORRECCIÓN TÉCNICA ---
def get_users_by_role(db: Session, *, role_name: str) -> List[User]:
    """
    Busca todos los usuarios que pertenecen a un rol específico (globalmente).
    """
    # Se utiliza el join a través de la relación definida en el modelo para mayor robustez.
    return db.query(User).join(User.role).filter(Role.role_name == role_name).all()

def get_users_by_role_and_branch(db: Session, *, role_name: str, branch_id: int) -> List[User]:
    """
    Busca todos los usuarios que pertenecen a un rol y una sucursal específicos.
    """
    # Se utiliza el join a través de la relación definida en el modelo para mayor robustez.
    return db.query(User).join(User.role).filter(
        Role.role_name == role_name,
        User.branch_id == branch_id
    ).all()

def get_users_by_branch(db: Session, *, branch_id: int) -> List[User]:
    """
    Busca todos los usuarios activos que pertenecen a una sucursal específica.
    """
    return db.query(User).filter(
        User.branch_id == branch_id,
        User.is_active == True
    ).all()
# --- FIN DE LA CORRECCIÓN TÉCNICA ---
