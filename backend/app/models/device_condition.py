# backend/app/models/device_condition.py

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base_class import Base


class DeviceCondition(Base):
    __tablename__ = "device_condition"
    __table_args__ = {'schema': 'customer'}

    id = Column(Integer, primary_key=True, index=True)
    check_description = Column(String, nullable=False)
    client_answer = Column(Boolean)
    technician_finding = Column(String)
    technician_notes = Column(String)

    # Esta es la columna CORRECTA y NECESARIA.
    # Es la clave foránea que conecta cada 'condition' a su 'order'.
    order_id = Column(Integer, ForeignKey("customer.repair_order.id"), nullable=False)

    # Esta es la relación de "vuelta" que SQLAlchemy necesita para resolver el error.
    # Se llama 'order' y se vincula con 'device_conditions' en el modelo RepairOrder.
    order = relationship("RepairOrder", back_populates="device_conditions")