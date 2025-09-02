# backend/app/schemas/customer.py

from pydantic import BaseModel

# Schema para la creación de un cliente
class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    dni: str

# Schema para mostrar la información de un cliente (ya existente)
class Customer(BaseModel):
    id: int
    first_name: str
    last_name: str
    dni: str | None
    phone_number: str | None

    class Config:
        from_attributes = True