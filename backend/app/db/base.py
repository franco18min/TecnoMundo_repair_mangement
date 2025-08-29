# backend/app/db/base.py

from app.db.session import engine
from app.models.base_class import Base

# Importamos todos los modelos para que SQLAlchemy los reconozca
from app.models.user import User
from app.models.roles import Role
from app.models.customer import Customer
from app.models.repair_order import RepairOrder
from app.models.status_order import StatusOrder

def init_db():
    """
    Esta función está desactivada.
    No se crearán tablas automáticamente. La aplicación asumirá que ya existen.
    """
    # print("--- Creando todas las tablas en la base de datos... ---")
    # Base.metadata.create_all(bind=engine)
    # print("--- Tablas creadas correctamente. ---")
    pass