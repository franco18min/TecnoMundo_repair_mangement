# backend/app/schemas/customer.py

from pydantic import BaseModel
from typing import Optional

class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    dni: str
    email: Optional[str] = None
    is_subscribed: Optional[bool] = False

class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    dni: Optional[str] = None
    email: Optional[str] = None
    is_subscribed: Optional[bool] = None

class Customer(BaseModel):
    id: int
    first_name: str
    last_name: str
    dni: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    is_subscribed: Optional[bool] = False
    # El frontend espera este nombre de campo
    repair_orders_count: int = 0

    class Config:
        from_attributes = True