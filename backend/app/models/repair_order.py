# backend/app/models/repair_order.py

from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Float
from sqlalchemy.orm import relationship
from .base_class import Base

class RepairOrder(Base):
    __tablename__ = "repair_order"
    __table_args__ = {'schema': 'customer'}

    id = Column(Integer, primary_key=True, index=True)
    device_model = Column(String)
    serial_number = Column(String)
    problem_description = Column(String)
    technician_diagnosis = Column(String)
    repair_notes = Column(String)
    parts_used = Column(String)
    total_cost = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
    delivered_at = Column(DateTime)
    accesories = Column(String)
    observations = Column(String)
    password_or_pattern = Column(String)
    deposit = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    completed_at = Column(DateTime)

    # --- Foreign Keys ---
    status_id = Column(Integer, ForeignKey("customer.status_order.id"))
    customer_id = Column(Integer, ForeignKey("customer.customer.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("system.user.id"))
    device_type_id = Column(Integer, ForeignKey("customer.device_type.id"))

    # --- Relaciones de SQLAlchemy ---
    customer = relationship("Customer", back_populates="repair_orders")
    technician = relationship("User", back_populates="repair_orders")
    status = relationship("StatusOrder", back_populates="repair_orders")
    device_type = relationship("DeviceType", back_populates="repair_orders")
    device_conditions = relationship("DeviceCondition", back_populates="order", cascade="all, delete-orphan")