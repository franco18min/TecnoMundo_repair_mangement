# backend/app/schemas/customer.py

from pydantic import BaseModel
from typing import Optional

# Schema para la creación de un cliente
class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    dni: str

# --- INICIO DE LA MODIFICACIÓN ---
# Nuevo Schema para actualizar un cliente. Todos los campos son opcionales.
class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    dni: Optional[str] = None
# --- FIN DE LA MODIFICACIÓN ---

# Schema para mostrar la información de un cliente (ya existente)
class Customer(BaseModel):
    id: int
    first_name: str
    last_name: str
    dni: str | None
    phone_number: str | None

    class Config:
        from_attributes = True