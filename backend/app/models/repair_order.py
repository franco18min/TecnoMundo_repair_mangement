from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Float
from sqlalchemy.orm import relationship
from .base_class import Base

class RepairOrder(Base):
    __tablename__ = "repair_order"
    # --- CAMBIO DE SCHEMA ---
    __table_args__ = {'schema': 'customer'}

    id = Column(Integer, primary_key=True, index=True)
    device_type = Column(String)
    device_model = Column(String)
    serial_number = Column(String)
    problem_description = Column(String)
    technician_diagnosis = Column(String)
    repair_notes = Column(String)
    parts_used = Column(String)
    total_cost = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    delivered_at = Column(DateTime)
    device_condition_id = Column(Integer)
    accesories = Column(String)
    observations = Column(String)
    password_or_pattern = Column(String)
    deposit = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    completed_at = Column(DateTime)

    # --- CAMBIO DE SCHEMA EN LAS CLAVES FORÁNEAS ---
    status_id = Column(Integer, ForeignKey("customer.status_order.id"))
    customer_id = Column(Integer, ForeignKey("customer.customer.id"))
    technician_id = Column(Integer, ForeignKey("system.user.id"))

    # Relaciones para SQLAlchemy
    customer = relationship("Customer", back_populates="repair_orders")
    technician = relationship("User", back_populates="repair_orders")
    status = relationship("StatusOrder", back_populates="repair_orders")