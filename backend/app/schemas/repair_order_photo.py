# backend/app/schemas/repair_order_photo.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RepairOrderPhotoBase(BaseModel):
    photo: str  # Base64 encoded image or URL
    note: Optional[str] = None


class RepairOrderPhotoCreate(RepairOrderPhotoBase):
    order_id: int


class RepairOrderPhotoUpdate(BaseModel):
    note: Optional[str] = None


class RepairOrderPhoto(RepairOrderPhotoBase):
    id: int
    order_id: int
    created_at: datetime

    class Config:
        from_attributes = True