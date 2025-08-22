from sqlalchemy.orm import Session
from backend.app.models.repair_order import RepairOrder as RepairOrderModel
from backend.app.schemas.repair_order import RepairOrderCreate

def get_repair_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RepairOrderModel).offset(skip).limit(limit).all()