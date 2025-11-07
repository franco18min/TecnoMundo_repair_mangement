# backend/app/models/email_subscription.py

from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base_class import Base

class EmailSubscription(Base):
    __tablename__ = "email_subscription"
    __table_args__ = {'schema': 'customer'}

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("customer.repair_order.id"), nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    order = relationship("RepairOrder")