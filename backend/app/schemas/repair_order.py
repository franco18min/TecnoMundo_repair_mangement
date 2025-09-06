# backend/app/schemas/repair_order.py

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

from .customer import Customer, CustomerCreate
from .user import User
from .status_order import StatusOrder
from .device_type import DeviceType
from .device_condition import DeviceCondition, DeviceConditionCreate, \
    DeviceConditionUpdate


# Esquema para la respuesta de una orden de reparación (lectura)
class RepairOrder(BaseModel):
    id: int
    device_model: Optional[str] = None
    created_at: datetime
    customer: Customer
    technician: Optional[User] = None
    status: Optional[StatusOrder] = None
    device_type: Optional[DeviceType] = None
    problem_description: str
    accesories: Optional[str] = None
    observations: Optional[str] = None
    password_or_pattern: Optional[str] = None
    deposit: Optional[float] = None
    total_cost: Optional[float] = None
    balance: Optional[float] = None
    parts_used: Optional[str] = None
    technician_diagnosis: Optional[str] = None
    repair_notes: Optional[str] = None
    device_conditions: List[DeviceCondition] = []

    class Config:
        from_attributes = True


# Esquema para la creación de una orden de reparación (escritura)
class RepairOrderCreate(BaseModel):
    is_spare_part_ordered: bool = False
    customer_id: Optional[int] = None
    customer: Optional[CustomerCreate] = None
    device_type_id: int
    device_model: str
    serial_number: Optional[str] = None
    accesories: Optional[str] = None
    problem_description: str
    password_or_pattern: Optional[str] = None
    observations: Optional[str] = None
    # --- INICIO DE LA MODIFICACIÓN ---
    total_cost: Optional[float] = 0.0 # Añadimos el costo total
    deposit: Optional[float] = 0.0
    # --- FIN DE LA MODIFICACIÓN ---
    checklist: List[DeviceConditionCreate] = []

    class Config:
        from_attributes = True


# --- NUEVO SCHEMA PARA ACTUALIZACIÓN ---
class RepairOrderUpdate(BaseModel):
    technician_diagnosis: Optional[str] = None
    repair_notes: Optional[str] = None
    parts_used: Optional[str] = None
    total_cost: Optional[float] = None
    deposit: Optional[float] = None
    status_id: Optional[int] = None
    checklist: Optional[List[DeviceConditionUpdate]] = None