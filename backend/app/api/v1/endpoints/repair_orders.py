# backend/app/api/v1/endpoints/repair_orders.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response, status
from sqlalchemy.orm import Session
import traceback

from app.schemas import repair_order as schemas_repair_order
from app.crud import crud_repair_order
from app.models.user import User
from app.api.v1 import dependencies as deps

router = APIRouter()

@router.get("/", response_model=List[schemas_repair_order.RepairOrder])
def read_repair_orders(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    try:
        orders = crud_repair_order.get_repair_orders(db, user=current_user, skip=skip, limit=limit)
        return orders
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ocurrió un error en el servidor al consultar las órdenes.")

@router.get("/{order_id}", response_model=schemas_repair_order.RepairOrder)
def read_repair_order(order_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_active_user)):
    db_order = crud_repair_order.get_repair_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return db_order

@router.post("/", response_model=schemas_repair_order.RepairOrder)
def create_new_repair_order(
        order: schemas_repair_order.RepairOrderCreate,
        background_tasks: BackgroundTasks,
        db: Session = Depends(deps.get_db),
        current_user: User = Depends(deps.get_current_active_admin_or_receptionist)
):
    try:
        new_order = crud_repair_order.create_repair_order(db=db, order=order, background_tasks=background_tasks, user_id=current_user.id)
        return new_order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ocurrió un error interno al crear la orden.")

@router.patch("/{order_id}/take", response_model=schemas_repair_order.RepairOrder)
def take_order(
        order_id: int,
        background_tasks: BackgroundTasks,
        db: Session = Depends(deps.get_db),
        current_user: User = Depends(deps.get_current_active_technician_or_admin)
):
    technician_id = current_user.id
    updated_order = crud_repair_order.assign_technician_and_start_process(
        db=db, order_id=order_id, technician_id=technician_id, background_tasks=background_tasks
    )
    if updated_order is None:
        raise HTTPException(status_code=400, detail="La orden no se puede tomar (ya asignada o no está pendiente).")
    return updated_order

@router.put("/{order_id}/complete", response_model=schemas_repair_order.RepairOrder)
def complete_order(
    order_id: int,
    order_update: schemas_repair_order.RepairOrderUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_technician_or_admin)
):
    updated_order = crud_repair_order.complete_technician_work(
        db=db, order_id=order_id, order_update=order_update, background_tasks=background_tasks
    )
    if updated_order is None:
        raise HTTPException(status_code=404, detail="Orden no encontrada para completar.")
    return updated_order

@router.patch("/{order_id}/details", response_model=schemas_repair_order.RepairOrder)
def update_order_details_endpoint(
    order_id: int,
    order_update: schemas_repair_order.RepairOrderDetailsUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin_or_receptionist)
):
    updated_order = crud_repair_order.update_order_details(
        db=db,
        order_id=order_id,
        order_update=order_update,
        background_tasks=background_tasks,
        user_id=current_user.id
    )
    if updated_order is None:
        raise HTTPException(status_code=404, detail="Orden no encontrada para actualizar.")
    return updated_order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
        order_id: int,
        background_tasks: BackgroundTasks,
        db: Session = Depends(deps.get_db),
        current_user: User = Depends(deps.get_current_active_admin)
):
    success = crud_repair_order.delete_repair_order(db=db, order_id=order_id, background_tasks=background_tasks)
    if not success:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.patch("/{order_id}/reopen", response_model=schemas_repair_order.RepairOrder)
def reopen_order_endpoint(
    order_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin_or_receptionist)
):
    reopened_order = crud_repair_order.reopen_order(db=db, order_id=order_id, background_tasks=background_tasks)
    if reopened_order is None:
        raise HTTPException(status_code=400, detail="La orden no se puede reabrir (puede que no esté completada).")
    return reopened_order

@router.patch("/{order_id}/deliver", response_model=schemas_repair_order.RepairOrder)
def deliver_order(
    order_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin_or_receptionist)
):
    """
    Marca una orden como 'Entregada'.
    Solo accesible para Administradores y Recepcionistas.
    La orden debe estar en estado 'Completado'.
    """
    try:
        # --- INICIO DE LA CORRECCIÓN ---
        delivered_order = crud_repair_order.mark_as_delivered(db=db, order_id=order_id, background_tasks=background_tasks, user_id=current_user.id)
        # --- FIN DE LA CORRECCIÓN ---
        return delivered_order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if "not found" in str(e).lower():
             raise HTTPException(status_code=404, detail=str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ocurrió un error interno al entregar la orden.")

@router.patch("/{order_id}/transfer", response_model=schemas_repair_order.RepairOrder)
def transfer_order(
    order_id: int,
    transfer_data: schemas_repair_order.RepairOrderTransfer,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin)
):
    """
    Transfiere una orden de reparación a otra sucursal.
    Solo accesible para Administradores.
    Si la orden está en proceso, se resetea el técnico y se pone en estado pendiente.
    """
    try:
        transferred_order = crud_repair_order.transfer_order(
            db=db, 
            order_id=order_id, 
            target_branch_id=transfer_data.target_branch_id,
            background_tasks=background_tasks,
            user_id=current_user.id
        )
        return transferred_order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ocurrió un error interno al transferir la orden.")
