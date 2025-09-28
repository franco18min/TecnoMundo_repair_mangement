# backend/app/schemas/branch.py

from pydantic import BaseModel
from typing import Optional

class Branch(BaseModel):
    id: int
    branch_name: str

    class Config:
        from_attributes = True

class BranchCreate(BaseModel):
    branch_name: str

class BranchUpdate(BaseModel):
    branch_name: Optional[str] = None
