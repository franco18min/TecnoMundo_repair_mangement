# backend/app/crud/crud_branch.py
from app.crud.base import CRUDBase
from app.models.branch import Branch
from app.schemas.branch import BranchCreate, BranchUpdate

class CRUDBranch(CRUDBase[Branch, BranchCreate, BranchUpdate]):
    pass

branch = CRUDBranch(Branch)