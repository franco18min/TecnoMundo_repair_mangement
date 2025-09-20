# backend/app/api/v1/endpoints/repair_orders.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response, status
from sqlalchemy.orm import Session
import traceback

from app.schemas import repair_order as schemas_repair_order
from app.crud import crud_repair_order
from app.models.user import User
from app.api.v1.dependencies import get_current_user, get_current_admin_user, get_current_admin_or_receptionist_user
from app.db.session import SessionLocal # Importamos SessionLocal para el get_db

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas_repair_order.RepairOrder])
def read_repair_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # Obtenemos el usuario actual
    skip: int = 0,
    limit: int = 100
):
    """
    Obtiene las órdenes de reparación filtradas por la sucursal del usuario.
    Los administradores ven todas las órdenes.
    """
    try:
        # Pasamos el objeto 'current_user' a la función CRUD para que aplique la lógica de filtrado
        orders = crud_repair_order.get_repair_orders(db, user=current_user, skip=skip, limit=limit)
        return orders
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ocurrió un error en el servidor al consultar las órdenes.")

@router.get("/{order_id}", response_model=schemas_repair_order.RepairOrder, dependencies=[Depends(get_current_user)])
def read_repair_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud_repair_order.get_repair_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return db_order

@router.post("/", response_model=schemas_repair_order.RepairOrder)
def create_new_repair_order(
        order: schemas_repair_order.RepairOrderCreate,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
        # Obtenemos el usuario que está creando la orden
        current_user: User = Depends(get_current_admin_or_receptionist_user)
):
    try:
        # Pasamos el ID del usuario a la función CRUD para la asignación automática de sucursal
        new_order = crud_repair_order.create_repair_order(db=db, order=order, background_tasks=background_tasks, user_id=current_user.id)
        return new_order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ocurrió un error interno al crear la orden.")

@router.patch("/{order_id}/take", response_model=schemas_repair_order.RepairOrder, dependencies=[Depends(get_current_user)])
def take_order(
        order_id: int,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    technician_id = current_user.id
    updated_order = crud_repair_order.assign_technician_and_start_process(
        db=db, order_id=order_id, technician_id=technician_id, background_tasks=background_tasks
    )
    if updated_order is None:
        raise HTTPException(status_code=400, detail="La orden no se puede tomar (ya asignada o no está pendiente).")
    return updated_order

@router.put("/{order_id}/complete", response_model=schemas_repair_order.RepairOrder, dependencies=[Depends(get_current_user)])
def complete_order(
    order_id: int,
    order_update: schemas_repair_order.RepairOrderUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    updated_order = crud_repair_order.complete_technician_work(
        db=db, order_id=order_id, order_update=order_update, background_tasks=background_tasks
    )
    if updated_order is None:
        raise HTTPException(status_code=404, detail="Orden no encontrada para completar.")
    return updated_order

@router.patch("/{order_id}/details", response_model=schemas_repair_order.RepairOrder, dependencies=[Depends(get_current_admin_or_receptionist_user)])
def update_order_details_endpoint(
    order_id: int,
    order_update: schemas_repair_order.RepairOrderDetailsUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    # --- INICIO DE LA MODIFICACIÓN ---
    # Obtenemos el usuario actual para saber quién realiza la acción
    current_user: User = Depends(get_current_admin_or_receptionist_user)
    # --- FIN DE LA MODIFICACIÓN ---
):
    updated_order = crud_repair_order.update_order_details(
        db=db,
        order_id=order_id,
        order_update=order_update,
        background_tasks=background_tasks,
        # --- INICIO DE LA MODIFICACIÓN ---
        # Pasamos el ID del usuario que modifica a la función crud
        user_id=current_user.id
        # --- FIN DE LA MODIFICACIÓN ---
    )
    if updated_order is None:
        raise HTTPException(status_code=404, detail="Orden no encontrada para actualizar.")
    return updated_order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin_user)])
def delete_order(
        order_id: int,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
):
    success = crud_repair_order.delete_repair_order(db=db, order_id=order_id, background_tasks=background_tasks)
    if not success:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.patch("/{order_id}/reopen", response_model=schemas_repair_order.RepairOrder, dependencies=[Depends(get_current_admin_or_receptionist_user)])
def reopen_order_endpoint(
    order_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    reopened_order = crud_repair_order.reopen_order(db=db, order_id=order_id, background_tasks=background_tasks)
    if reopened_order is None:
        raise HTTPException(status_code=400, detail="La orden no se puede reabrir (puede que no esté completada).")
    return reopened_order