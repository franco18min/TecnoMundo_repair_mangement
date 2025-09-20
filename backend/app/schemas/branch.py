# backend/app/schemas/branch.py

from pydantic import BaseModel

class Branch(BaseModel):
    id: int
    branch_name: str

    class Config:
        from_attributes = True