# backend/app/models/repair_order_photo.py

from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base_class import Base


class RepairOrderPhoto(Base):
    __tablename__ = "repair_order_photo"
    __table_args__ = {'schema': 'customer'}

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("customer.repair_order.id", ondelete="CASCADE"), nullable=False)
    photo = Column(Text, nullable=False)  # Base64 encoded image or URL
    note = Column(Text)  # Optional note for the photo
    created_at = Column(DateTime, server_default=func.now())

    # Relación con RepairOrder
    repair_order = relationship("RepairOrder", back_populates="photos")