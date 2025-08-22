from pydantic import BaseModel
from datetime import date
from typing import Optional

class RepairOrderBase(BaseModel):
    order_id_str: str
    customer_name: str
    device_type: Optional[str] = None
    device_model: Optional[str] = None
    issue_description: Optional[str] = None
    status: Optional[str] = "Pendiente"
    technician_name: Optional[str] = None
    technician_avatar_url: Optional[str] = None
    date_received: Optional[date] = None

class RepairOrderCreate(RepairOrderBase):
    pass

class RepairOrder(RepairOrderBase):
    id: int

    class Config:
        orm_mode = True