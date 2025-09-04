# backend/app/schemas/device_condition.py

from pydantic import BaseModel
from typing import Optional

class DeviceConditionBase(BaseModel):
    check_description: str
    client_answer: Optional[bool] = None
    technician_finding: Optional[bool] = None
    technician_notes: Optional[str] = None

class DeviceConditionCreate(DeviceConditionBase):
    pass

# --- NUEVO SCHEMA PARA ACTUALIZACIÓN ---
class DeviceConditionUpdate(DeviceConditionBase):
    # Hacemos la descripción opcional porque ya existe
    check_description: Optional[str] = None

class DeviceCondition(DeviceConditionBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True