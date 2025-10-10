# backend/app/schemas/branch.py

from pydantic import BaseModel
from typing import Optional

class Branch(BaseModel):
    id: int
    branch_name: str
    company_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    icon_name: Optional[str] = 'Building'

    class Config:
        from_attributes = True

class BranchCreate(BaseModel):
    branch_name: str
    company_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    icon_name: Optional[str] = 'Building'

class BranchUpdate(BaseModel):
    branch_name: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    icon_name: Optional[str] = None
