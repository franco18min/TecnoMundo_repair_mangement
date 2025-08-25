# CORRECCIÓN: Se cambió 'backend.app' por 'app'
from app.db.session import engine
from app.models.repair_order import Base # Importa Base desde el archivo de modelos.

def init_db():
    # Crea las tablas en la base de datos si no existen
    Base.metadata.create_all(bind=engine)