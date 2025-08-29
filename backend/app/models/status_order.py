from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base_class import Base

class StatusOrder(Base):
    __tablename__ = "status_order"
    # --- CAMBIO DE SCHEMA ---
    __table_args__ = {'schema': 'customer'}

    id = Column(Integer, primary_key=True, index=True)
    status_name = Column(String, unique=True, index=True, nullable=False)

    repair_orders = relationship("RepairOrder", back_populates="status")