from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# --- CORRECCIÓN AQUÍ ---
# Importamos los módulos específicos en lugar de los paquetes completos
from backend.app.schemas import repair_order as schemas_repair_order
from backend.app.crud import crud_repair_order
# --- FIN DE LA CORRECCIÓN ---

from backend.app.db.session import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- CORRECCIÓN AQUÍ ---
# Usamos el alias para referirnos al esquema de forma no ambigua
@router.get("/", response_model=List[schemas_repair_order.RepairOrder])
def read_repair_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Recupera una lista de órdenes de reparación.
    """
    # Usamos la importación directa del crud
    orders = crud_repair_order.get_repair_orders(db, skip=skip, limit=limit)
    return orders