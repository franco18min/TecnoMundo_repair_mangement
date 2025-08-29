from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from .base_class import Base


class User(Base):
    __tablename__ = "user"
    # --- CAMBIO DE SCHEMA ---
    __table_args__ = {'schema': 'system'}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # --- CAMBIO DE SCHEMA EN LA CLAVE FORÁNEA ---
    role_id = Column(Integer, ForeignKey("system.roles.id"))

    # Relaciones para SQLAlchemy
    role = relationship("Role", back_populates="users")
    repair_orders = relationship("RepairOrder", back_populates="technician")