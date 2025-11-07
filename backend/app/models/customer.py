from sqlalchemy import Column, Integer, String, DateTime, func, Boolean
from sqlalchemy.orm import relationship
from .base_class import Base

class Customer(Base):
    __tablename__ = "customer"
    # --- CAMBIO DE SCHEMA ---
    __table_args__ = {'schema': 'customer'}

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone_number = Column(String)
    # Nuevo: Email del cliente para notificaciones
    email = Column(String, nullable=True)
    # Nuevo: Suscripción del cliente a notificaciones por email
    is_subscribed = Column(Boolean, default=False)
    dni = Column(String, unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relación: Un cliente puede tener muchas órdenes de reparación
    repair_orders = relationship("RepairOrder", back_populates="customer")