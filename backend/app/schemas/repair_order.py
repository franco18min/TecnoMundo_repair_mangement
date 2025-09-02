# backend/app/schemas/repair_order.py

from pydantic import BaseModel, Field
from datetime import datetime
from .customer import Customer, CustomerCreate
from .user import User
from .status_order import StatusOrder
from .device_type import DeviceType
from .device_condition import DeviceConditionCreate, DeviceCondition


class RepairOrder(BaseModel):
    id: int
    device_model: str | None
    created_at: datetime
    parts_used: str | None

    device_type: DeviceType | None
    customer: Customer
    technician: User | None
    status: StatusOrder | None
    device_conditions: list[DeviceCondition] = []  # Para poder ver el checklist al obtener una orden

    class Config:
        from_attributes = True


class RepairOrderCreate(BaseModel):
    customer: CustomerCreate | None = None
    customer_id: int | None = None
    device_type_id: int
    device_model: str
    serial_number: str | None = None
    problem_description: str
    accesories: str | None = None
    observations: str | None = None
    parts_used: str | None = None
    total_cost: float = Field(default=0.0)
    deposit: float = Field(default=0.0)
    balance: float = Field(default=0.0)
    password_or_pattern: str | None = None
    is_spare_part_ordered: bool = False

    # --- CAMPO AÑADIDO PARA EL CHECKLIST ---
    checklist: list[DeviceConditionCreate] | None = []