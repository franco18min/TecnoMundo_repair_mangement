from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .base_class import Base

class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {'schema': 'system'}

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    link_to = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relación con el usuario
    user_id = Column(Integer, ForeignKey("system.user.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User") # No requiere back_populates si no hay una lista de notificaciones en el modelo User