# backend/app/models/device_condition.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base_class import Base


class DeviceCondition(Base):
    __tablename__ = "device_condition"
    __table_args__ = {'schema': 'customer'}

    id = Column(Integer, primary_key=True, index=True)
    check_description = Column(String, nullable=False)
    client_answer = Column(Boolean, nullable=True)  # Almacenará Sí (True), No (False) o sin respuesta (NULL)

    order_id = Column(Integer, ForeignKey("customer.repair_order.id"))

    repair_order = relationship("RepairOrder", back_populates="device_conditions")