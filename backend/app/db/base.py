from backend.app.db.session import engine, SessionLocal
from backend.app.models.repair_order import RepairOrder, Base # Importa Base desde el archivo de modelos.

def init_db():
    Base.metadata.create_all(bind=engine)