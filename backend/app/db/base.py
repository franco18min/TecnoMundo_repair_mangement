from app.db.session import Base, engine, SessionLocal
from app.models.repair_order import RepairOrder

def init_db():
    Base.metadata.create_all(bind=engine)