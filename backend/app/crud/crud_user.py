# backend/app/crud/crud_user.py

from sqlalchemy.orm import Session
from app.models.user import User as UserModel
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
from app.models.roles import Role
from typing import List

def get_user_by_username(db: Session, username: str):
    """Busca un usuario por su nombre de usuario."""
    return db.query(UserModel).filter(UserModel.username == username).first()

def create_user(db: Session, user: UserCreate):
    """Crea un nuevo usuario en la base de datos."""
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        username=user.username,
        email=user.email,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users_by_role(db: Session, role_name: str) -> List[UserModel]:
    """Busca todos los usuarios que pertenecen a un rol específico."""
    return db.query(UserModel).join(Role).filter(Role.role_name == role_name).all()

# --- INICIO DE LA MODIFICACIÓN ---
def get_users_by_role_and_branch(db: Session, role_name: str, branch_id: int) -> List[UserModel]:
    """
    Busca todos los usuarios que pertenecen a un rol y una sucursal específicos.
    """
    return db.query(UserModel).join(Role).filter(
        Role.role_name == role_name,
        UserModel.branch_id == branch_id
    ).all()
# --- FIN DE LA MODIFICACIÓN ---