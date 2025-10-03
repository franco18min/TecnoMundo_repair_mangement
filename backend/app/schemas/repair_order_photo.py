# backend/app/schemas/repair_order_photo.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class MarkerData(BaseModel):
    """Esquema para un marcador individual"""
    x: float  # Posición X en porcentaje (0-100)
    y: float  # Posición Y en porcentaje (0-100)
    color: str  # Color del marcador (hex)


class DrawingData(BaseModel):
    """Esquema para un dibujo libre individual"""
    path: str  # Path SVG del dibujo
    color: str  # Color del dibujo (hex)
    strokeWidth: Optional[float] = 2.0  # Grosor del trazo


class RepairOrderPhotoBase(BaseModel):
    photo: str  # Base64 encoded image or URL
    note: Optional[str] = None
    markers: Optional[List[MarkerData]] = []
    drawings: Optional[List[DrawingData]] = []


class RepairOrderPhotoCreate(RepairOrderPhotoBase):
    order_id: int


class RepairOrderPhotoUpdate(BaseModel):
    note: Optional[str] = None
    markers: Optional[List[MarkerData]] = None
    drawings: Optional[List[DrawingData]] = None


class RepairOrderPhoto(RepairOrderPhotoBase):
    id: int
    order_id: int
    created_at: datetime

    class Config:
        from_attributes = True