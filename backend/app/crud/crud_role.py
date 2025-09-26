# backend/app/crud/crud_role.py
from app.crud.base import CRUDBase
from app.models.roles import Roles
from app.schemas.role import Role, RoleCreate

class CRUDRole(CRUDBase[Roles, RoleCreate, Role]):
    pass

role = CRUDRole(Roles)