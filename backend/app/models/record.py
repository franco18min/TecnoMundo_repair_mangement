from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .base_class import Base

class Record(Base):
    __tablename__ = "record"
    __table_args__ = {'schema': 'system'}

    id = Column(Integer, primary_key=True, index=True)
    id_even_type = Column(Integer, ForeignKey("system.type_record.id", ondelete="RESTRICT"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("customer.repair_order.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_user_id = Column(Integer, ForeignKey("system.user.id", ondelete="SET NULL"), nullable=True, index=True)
    origin_branch_id = Column(Integer, ForeignKey("system.branch.id", ondelete="SET NULL"), nullable=True, index=True)
    target_branch_id = Column(Integer, ForeignKey("system.branch.id", ondelete="SET NULL"), nullable=True, index=True)
    prev_status_id = Column(Integer, ForeignKey("customer.status_order.id", ondelete="SET NULL"), nullable=True)
    new_status_id = Column(Integer, ForeignKey("customer.status_order.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=True)
    meta = Column("metadata", JSONB, default=lambda: {})
    created_at = Column(DateTime, server_default=func.now())

    order = relationship("RepairOrder", back_populates="records")
    type_record = relationship("TypeRecord", back_populates="records")

    @property
    def event_type(self) -> str:
        return self.type_record.type_name if self.type_record else ""
