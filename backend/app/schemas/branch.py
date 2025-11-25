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
    
    # Configuración de tickets
    client_header_style: Optional[str] = '{}'
    workshop_header_style: Optional[str] = '{}'
    client_body_content: Optional[str] = ''
    workshop_body_content: Optional[str] = ''
    client_body_style: Optional[str] = '{}'
    workshop_body_style: Optional[str] = '{}'

    class Config:
        from_attributes = True

class BranchPublic(BaseModel):
    id: int
    branch_name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True

class BranchCreate(BaseModel):
    branch_name: str
    company_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    icon_name: Optional[str] = 'Building'
    
    # Configuración de tickets
    client_header_style: Optional[str] = '{}'
    workshop_header_style: Optional[str] = '{}'
    client_body_content: Optional[str] = ''
    workshop_body_content: Optional[str] = ''
    client_body_style: Optional[str] = '{}'
    workshop_body_style: Optional[str] = '{}'

class BranchUpdate(BaseModel):
    branch_name: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    icon_name: Optional[str] = None
    
    # Configuración de tickets
    client_header_style: Optional[str] = None
    workshop_header_style: Optional[str] = None
    client_body_content: Optional[str] = None
    workshop_body_content: Optional[str] = None
    client_body_style: Optional[str] = None
    workshop_body_style: Optional[str] = None
