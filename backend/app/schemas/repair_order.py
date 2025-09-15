# backend/app/schemas/repair_order.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

from .customer import Customer, CustomerCreate, CustomerUpdate
from .user import User
from .status_order import StatusOrder
from .device_type import DeviceType
from .device_condition import DeviceCondition, DeviceConditionCreate, DeviceConditionUpdate


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
    total_cost: Optional[float] = 0.0
    deposit: Optional[float] = 0.0
    checklist: List[DeviceConditionCreate] = []

    class Config:
        from_attributes = True


# Schema para que el TÉCNICO complete su trabajo
class RepairOrderUpdate(BaseModel):
    technician_diagnosis: Optional[str] = None
    repair_notes: Optional[str] = None
    parts_used: Optional[str] = None
    total_cost: Optional[float] = None
    deposit: Optional[float] = None
    status_id: Optional[int] = Field(None, ge=1, le=6)
    checklist: Optional[List[DeviceConditionUpdate]] = None


# --- NUEVO SCHEMA AÑADIDO ---
# Para que ADMIN/RECEPCIONISTA modifiquen detalles
class RepairOrderDetailsUpdate(BaseModel):
    customer: Optional[CustomerUpdate] = None # Permitir actualizar datos del cliente
    device_type_id: Optional[int] = None
    device_model: Optional[str] = None
    serial_number: Optional[str] = None
    accesories: Optional[str] = None
    problem_description: Optional[str] = None
    password_or_pattern: Optional[str] = None
    observations: Optional[str] = None
    total_cost: Optional[float] = None
    deposit: Optional[float] = None
    parts_used: Optional[str] = None
    status_id: Optional[int] = Field(None, ge=1, le=6) # Permitir cambio de estado manual
    checklist: Optional[List[DeviceConditionUpdate]] = None # Permitir la actualización del checklist
