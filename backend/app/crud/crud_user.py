# backend/app/crud/crud_user.py

from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserCreateByAdmin, UserUpdateByAdmin
import logging  # <-- IMPORTAMOS LOGGING

# Configuración básica de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


class CRUDUser(CRUDBase[User, UserCreateByAdmin, UserUpdateByAdmin]):
    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    # --- INICIO DE LA MODIFICACIÓN ---

    def create(self, db: Session, *, obj_in: UserCreateByAdmin) -> User:
        db_obj = User(
            username=obj_in.username,
            email=obj_in.email,
            password=get_password_hash(obj_in.password),
            role_id=obj_in.role_id,
            branch_id=obj_in.branch_id,
            is_active=True  # Por defecto los usuarios se crean activos
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi(
            self, db: Session, *, skip: int = 0, limit: int = 100, status: str = "all"
    ) -> List[User]:
        query = db.query(self.model)
        if status == "active":
            query = query.filter(User.is_active == True)
        elif status == "inactive":
            query = query.filter(User.is_active == False)

        return query.offset(skip).limit(limit).all()

    def update(
            self, db: Session, *, db_obj: User, obj_in: Union[UserUpdateByAdmin, Dict[str, Any]], admin_user: User
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        # Auditoría para el cambio de is_active
        if 'is_active' in update_data and db_obj.is_active != update_data['is_active']:
            logging.info(
                f"AUDIT - Admin '{admin_user.username}' changed status for user '{db_obj.username}' to '{'active' if update_data['is_active'] else 'inactive'}'"
            )

        return super().update(db, db_obj=db_obj, obj_in=update_data)

    # --- FIN DE LA MODIFICACIÓN ---


user = CRUDUser(User)