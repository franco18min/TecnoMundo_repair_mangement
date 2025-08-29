from pydantic import BaseModel
from datetime import datetime
from .customer import Customer
from .user import User
from .status_order import StatusOrder  # ¡Importa el nuevo esquema!

class RepairOrder(BaseModel):
    id: int
    device_type: str | None
    device_model: str | None
    created_at: datetime

    # Datos anidados
    customer: Customer
    technician: User | None
    status: StatusOrder | None  # ¡Usa el nuevo esquema!

    class Config:
        from_attributes = True