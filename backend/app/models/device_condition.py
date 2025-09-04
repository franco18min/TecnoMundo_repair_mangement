# backend/app/models/device_condition.py

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base_class import Base


class DeviceCondition(Base):
    __tablename__ = "device_condition"
    __table_args__ = {'schema': 'customer'}

    id = Column(Integer, primary_key=True, index=True)
    check_description = Column(String, nullable=False)

    # --- INICIO DE LA CORRECCIÓN ---
    client_answer = Column(Boolean)
    technician_finding = Column(Boolean)  # Aseguramos que esta columna sea de tipo Boolean
    # --- FIN DE LA CORRECCIÓN ---

    technician_notes = Column(String)
    order_id = Column(Integer, ForeignKey("customer.repair_order.id"), nullable=False)
    order = relationship("RepairOrder", back_populates="device_conditions")