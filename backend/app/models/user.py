from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from .base_class import Base

class User(Base):
    __tablename__ = "user"
    __table_args__ = {'schema': 'system_users'}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(String(50), default='user')
    created_at = Column(DateTime, server_default=func.now())

    # Relación: Un técnico (usuario) puede tener muchas órdenes de reparación
    repair_orders = relationship("RepairOrder", back_populates="technician")