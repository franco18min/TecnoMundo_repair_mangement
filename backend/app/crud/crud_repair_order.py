from sqlalchemy.orm import Session
# CORRECCIÓN: Se cambió 'backend.app' por 'app'
from app.models.repair_order import RepairOrder as RepairOrderModel
from app.schemas.repair_order import RepairOrderCreate

def get_repair_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RepairOrderModel).offset(skip).limit(limit).all()

# Aquí puedes añadir más funciones CRUD en el futuro (crear, actualizar, eliminar)