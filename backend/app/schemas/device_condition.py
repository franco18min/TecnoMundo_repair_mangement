# backend/app/schemas/device_condition.py

from pydantic import BaseModel

class DeviceConditionBase(BaseModel):
    check_description: str
    client_answer: bool | None = None

class DeviceConditionCreate(DeviceConditionBase):
    pass

class DeviceCondition(DeviceConditionBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True