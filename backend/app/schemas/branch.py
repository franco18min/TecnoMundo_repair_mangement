# backend/app/schemas/branch.py

from pydantic import BaseModel
from typing import Optional

# --- INICIO DE LA MODIFICACIÓN ---
class BranchBase(BaseModel):
    branch_name: str

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    branch_name: Optional[str] = None

class Branch(BranchBase):
# --- FIN DE LA MODIFICACIÓN ---
    id: int
    branch_name: str

    class Config:
        from_attributes = True