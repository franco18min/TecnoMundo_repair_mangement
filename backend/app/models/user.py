# backend/app/models/user.py

from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from .base_class import Base


class User(Base):
    __tablename__ = "user"
    __table_args__ = {'schema': 'system'}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    role_id = Column(Integer, ForeignKey("system.roles.id"))

    # --- INICIO DE LA MODIFICACIÓN ---
    branch_id = Column(Integer, ForeignKey("system.branch.id"))
    # --- FIN DE LA MODIFICACIÓN ---

    # Relaciones para SQLAlchemy
    role = relationship("Role", back_populates="users")
    repair_orders = relationship("RepairOrder", back_populates="technician")

    # --- INICIO DE LA MODIFICACIÓN ---
    branch = relationship("Branch", back_populates="users")
    # --- FIN DE LA MODIFICACIÓN ---