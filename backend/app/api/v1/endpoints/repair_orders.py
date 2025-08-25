from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# CORRECCIÓN: Se cambió 'backend.app' por 'app'
from app.schemas import repair_order as schemas_repair_order
from app.crud import crud_repair_order
from app.db.session import SessionLocal

router = APIRouter()

# --- Dependencia para obtener la sesión de la base de datos ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas_repair_order.RepairOrder])
def read_repair_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Recupera una lista de órdenes de reparación desde la base de datos.
    """
    orders = crud_repair_order.get_repair_orders(db, skip=skip, limit=limit)
    return orders