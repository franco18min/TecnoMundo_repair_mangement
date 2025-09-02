# backend/app/api/v1/endpoints/repair_orders.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import traceback

from app.schemas import repair_order as schemas_repair_order
from app.crud import crud_repair_order
from app.db.session import SessionLocal

# El modelo User ya no es necesario aquí
# from app.models.user import User

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=List[schemas_repair_order.RepairOrder])
def read_repair_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        orders = crud_repair_order.get_repair_orders(db, skip=skip, limit=limit)
        return orders
    except Exception as e:
        print("--- 🚨 ERROR AL OBTENER LAS ÓRDENES DE REPARACIÓN 🚨 ---")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Ocurrió un error en el servidor al consultar las órdenes."
        )


# --- ENDPOINT MODIFICADO ---
@router.post("/", response_model=schemas_repair_order.RepairOrder)
def create_new_repair_order(
        order: schemas_repair_order.RepairOrderCreate,
        db: Session = Depends(get_db)
):
    print("\n✅ [DEBUG] Petición a /repair-orders (POST) recibida. Creando orden sin técnico asignado...")

    try:
        # --- LÓGICA DE ASIGNACIÓN ELIMINADA ---
        # Ahora llamamos a la función sin pasar un technician_id.
        # Por defecto, será None.
        new_order = crud_repair_order.create_repair_order(db=db, order=order)

        print(f"✨ [DEBUG] Orden creada exitosamente con ID: {new_order.id} sin técnico.")
        return new_order

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("--- 🚨 ERROR AL CREAR LA ORDEN DE REPARACIÓN 🚨 ---")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ocurrió un error interno al crear la orden.")