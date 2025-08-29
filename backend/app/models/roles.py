from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base_class import Base

class Role(Base):
    __tablename__ = "roles"
    # --- CAMBIO DE SCHEMA ---
    __table_args__ = {'schema': 'system'}

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String, unique=True, index=True, nullable=False)

    users = relationship("User", back_populates="role")