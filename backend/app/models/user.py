# backend/app/models/user.py

from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base_class import Base
from .branch import Branch # <-- IMPORTAMOS EL MODELO BRANCH

class User(Base):
    __tablename__ = "user"
    __table_args__ = {'schema': 'system'}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone_number = Column(String(30), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    is_active = Column(Boolean, default=True) # <-- AÑADIMOS LA COLUMNA IS_ACTIVE

    role_id = Column(Integer, ForeignKey("system.roles.id"))
    branch_id = Column(Integer, ForeignKey("system.branch.id"))

    # Relaciones para SQLAlchemy
    role = relationship("Role", back_populates="users")
    repair_orders = relationship("RepairOrder", back_populates="technician")
    branch = relationship("Branch", back_populates="users")
