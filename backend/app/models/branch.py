# backend/app/models/branch.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base_class import Base

class Branch(Base):
    __tablename__ = "branch"
    __table_args__ = {'schema': 'system'}

    id = Column(Integer, primary_key=True, index=True)
    branch_name = Column(String, unique=True, index=True, nullable=False)

    # Relaciones inversas: una sucursal puede tener muchos usuarios y órdenes
    users = relationship("User", back_populates="branch")
    repair_orders = relationship("RepairOrder", back_populates="branch")