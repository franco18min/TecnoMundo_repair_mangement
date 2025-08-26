from app.db.session import engine
# --- IMPORTA EL NUEVO MODELO DE USUARIO ---
from app.models.user import Base as UserBase
from app.models.repair_order import Base as RepairOrderBase

def init_db():
    # Crea todas las tablas si no existen
    UserBase.metadata.create_all(bind=engine)
    RepairOrderBase.metadata.create_all(bind=engine)