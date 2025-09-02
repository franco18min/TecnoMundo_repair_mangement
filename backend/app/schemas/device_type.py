# backend/app/schemas/device_type.py

from pydantic import BaseModel

class DeviceType(BaseModel):
    id: int
    type_name: str

    class Config:
        from_attributes = True