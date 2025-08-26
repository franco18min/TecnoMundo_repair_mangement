from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Float
from sqlalchemy.orm import relationship
from .base_class import Base

class RepairOrder(Base):
    __tablename__ = "repair_order"
    __table_args__ = {'schema': 'customer_users'}

    id = Column(Integer, primary_key=True, index=True)
    device_type = Column(String)
    device_model = Column(String)
    problem_description = Column(String)
    status = Column(String, default="Pendiente")
    total_cost = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())

    # Claves Foráneas y Relaciones
    customer_id = Column(Integer, ForeignKey("customer_users.customer.id"))
    technician_id = Column(Integer, ForeignKey("system_users.user.id"))

    customer = relationship("Customer", back_populates="repair_orders")
    technician = relationship("User", back_populates="repair_orders")