# backend/app/schemas/repair_order.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

from .customer import Customer, CustomerCreate  # Asegúrate de tener CustomerCreate
from .user import User
from .status_order import StatusOrder
from .device_type import DeviceType
from .device_condition import DeviceCondition, DeviceConditionCreate  # Asegúrate de tener DeviceConditionCreate


# Esquema para la respuesta de una orden de reparación (lectura)
class RepairOrder(BaseModel):
    id: int
    device_model: Optional[str] = None
    created_at: datetime
    customer: Customer
    technician: Optional[User] = None
    status: Optional[StatusOrder] = None
    device_type: Optional[DeviceType] = None

    class Config:
        from_attributes = True


# Esquema para la creación de una orden de reparación (escritura)
class RepairOrderCreate(BaseModel):
    # --- CAMBIO AQUÍ ---
    # Añadimos el campo que vendrá desde el frontend
    is_spare_part_ordered: bool = False

    # Datos del cliente (puede ser ID o un objeto para crear uno nuevo)
    customer_id: Optional[int] = None
    customer: Optional[CustomerCreate] = None

    # Datos del dispositivo
    device_type_id: int
    device_model: str
    serial_number: Optional[str] = None
    accesories: Optional[str] = None
    problem_description: str
    password_or_pattern: Optional[str] = None
    observations: Optional[str] = None

    # Datos financieros
    deposit: Optional[float] = 0.0

    # Checklist
    checklist: List[DeviceConditionCreate] = []

    class Config:
        from_attributes = True