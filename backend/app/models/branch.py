# backend/app/models/branch.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base_class import Base

class Branch(Base):
    __tablename__ = "branch"
    __table_args__ = {'schema': 'system'}

    id = Column(Integer, primary_key=True, index=True)
    branch_name = Column(String, unique=True, index=True, nullable=False)
    
    # Campos para personalización de tickets
    company_name = Column(String, nullable=True)  # Nombre de la empresa para el ticket
    address = Column(String, nullable=True)       # Dirección del local
    phone = Column(String, nullable=True)         # Número de teléfono
    email = Column(String, nullable=True)         # Correo electrónico
    icon_name = Column(String, default='Building', nullable=True)  # Nombre del icono
    
    # Configuración de estilos y contenidos de tickets
    client_header_style = Column(String, default='{}', nullable=True)    # Estilos de cabecera para tickets de cliente
    workshop_header_style = Column(String, default='{}', nullable=True)  # Estilos de cabecera para tickets de taller
    client_body_content = Column(String, default='', nullable=True)      # Contenido del cuerpo para tickets de cliente
    workshop_body_content = Column(String, default='', nullable=True)    # Contenido del cuerpo para tickets de taller
    client_body_style = Column(String, default='{}', nullable=True)      # Estilos del cuerpo para tickets de cliente
    workshop_body_style = Column(String, default='{}', nullable=True)    # Estilos del cuerpo para tickets de taller

    # Relaciones inversas: una sucursal puede tener muchos usuarios y órdenes
    users = relationship("User", back_populates="branch")
    repair_orders = relationship("RepairOrder", back_populates="branch")