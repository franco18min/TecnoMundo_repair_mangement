from pydantic import BaseModel
from datetime import datetime
from .customer import Customer  # Importa el esquema de Cliente
from .user import User  # Importa el esquema de Usuario


class RepairOrder(BaseModel):
    id: int
    device_type: str | None
    device_model: str | None
    status: str | None
    created_at: datetime

    # Datos anidados del cliente y el técnico
    customer: Customer
    technician: User | None  # Puede que una orden aún no tenga técnico

    class Config:
        from_attributes = True