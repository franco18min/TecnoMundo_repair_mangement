# backend/app/api/v1/endpoints/repair_orders.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
import traceback

from app.schemas import repair_order as schemas_repair_order
from app.crud import crud_repair_order
from app.db.session import SessionLocal
from app.models.user import User
from app.api.v1.dependencies import get_current_user

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

@router.get("/{order_id}", response_model=schemas_repair_order.RepairOrder)
def read_repair_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud_repair_order.get_repair_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return db_order

@router.post("/", response_model=schemas_repair_order.RepairOrder)
async def create_new_repair_order(
        order: schemas_repair_order.RepairOrderCreate,
        db: Session = Depends(get_db)
):
    print("\n✅ [DEBUG] Petición a /repair-orders (POST) recibida.")
    try:
        new_order = crud_repair_order.create_repair_order(db=db, order=order)
        print(f"✨ [DEBUG] Orden creada exitosamente con ID: {new_order.id}")
        return new_order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("--- 🚨 ERROR AL CREAR LA ORDEN DE REPARACIÓN 🚨 ---")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ocurrió un error interno al crear la orden.")


@router.patch("/{order_id}/take", response_model=schemas_repair_order.RepairOrder)
def take_order(
        order_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    technician_id = current_user.id
    updated_order = crud_repair_order.assign_technician_and_start_process(
        db=db, order_id=order_id, technician_id=technician_id
    )
    if updated_order is None:
        raise HTTPException(status_code=400, detail="La orden no se puede tomar (ya asignada o no está pendiente).")
    return updated_order

@router.put("/{order_id}", response_model=schemas_repair_order.RepairOrder)
def update_order(
    order_id: int,
    order_update: schemas_repair_order.RepairOrderUpdate,
    db: Session = Depends(get_db)
):
    updated_order = crud_repair_order.update_repair_order(
        db=db, order_id=order_id, order_update=order_update
    )
    if updated_order is None:
        raise HTTPException(status_code=404, detail="Orden no encontrada para actualizar.")
    return updated_order