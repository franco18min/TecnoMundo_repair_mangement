# backend/app/models/device_type.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base_class import Base

class DeviceType(Base):
    __tablename__ = "device_type"
    __table_args__ = {'schema': 'customer'}

    id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String, unique=True, index=True, nullable=False)

    # Relación inversa: Un tipo de dispositivo puede estar en muchas órdenes
    repair_orders = relationship("RepairOrder", back_populates="device_type")