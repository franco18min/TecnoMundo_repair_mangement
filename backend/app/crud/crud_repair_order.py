# backend/app/crud/crud_repair_order.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.repair_order import RepairOrder as RepairOrderModel
from app.models.device_condition import DeviceCondition as DeviceConditionModel
from app.schemas.repair_order import RepairOrderCreate, RepairOrderUpdate
from app.crud import crud_customer


def get_repair_orders(db: Session, skip: int = 0, limit: int = 100):
    """
    Obtiene una lista de órdenes de reparación con sus relaciones cargadas.
    """
    return (
        db.query(RepairOrderModel)
        .options(
            joinedload(RepairOrderModel.customer),
            joinedload(RepairOrderModel.technician),
            joinedload(RepairOrderModel.status),
            joinedload(RepairOrderModel.device_type),
            joinedload(RepairOrderModel.device_conditions)
        )
        .order_by(RepairOrderModel.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_repair_order(db: Session, order_id: int):
    """
    Obtiene una orden de reparación específica por su ID, cargando todas sus relaciones.
    """
    return (
        db.query(RepairOrderModel)
        .options(
            joinedload(RepairOrderModel.customer),
            joinedload(RepairOrderModel.technician),
            joinedload(RepairOrderModel.status),
            joinedload(RepairOrderModel.device_type),
            joinedload(RepairOrderModel.device_conditions)
        )
        .filter(RepairOrderModel.id == order_id)
        .first()
    )


def create_repair_order(db: Session, order: RepairOrderCreate, technician_id: int | None = None):
    """
    Crea una nueva orden de reparación, gestionando el cliente y el checklist.
    """
    customer_id = order.customer_id

    if not customer_id and order.customer:
        db_customer = crud_customer.get_customer_by_dni(db, dni=order.customer.dni)
        if db_customer:
            customer_id = db_customer.id
        else:
            new_customer = crud_customer.create_customer(db, customer=order.customer)
            customer_id = new_customer.id

    if not customer_id:
        raise ValueError("Se requiere información del cliente para crear una orden.")

    status_id = 6 if order.is_spare_part_ordered else 1

    checklist_data = order.checklist

    order_data = order.dict(exclude={"checklist", "customer", "is_spare_part_ordered", "customer_id"})

    db_order = RepairOrderModel(
        **order_data,
        customer_id=customer_id,
        technician_id=technician_id,
        status_id=status_id
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    if checklist_data:
        for item_data in checklist_data:
            db_condition = DeviceConditionModel(
                **item_data.dict(),
                order_id=db_order.id
            )
            db.add(db_condition)
        db.commit()
        db.refresh(db_order)

    return db_order


def update_repair_order(db: Session, order_id: int, order_update: RepairOrderUpdate):
    """
    Actualiza una orden de reparación existente y la marca como completada.
    """
    db_order = get_repair_order(db, order_id)
    if not db_order:
        return None

    update_data = order_update.dict(exclude_unset=True, exclude={'checklist'})
    for key, value in update_data.items():
        setattr(db_order, key, value)

    if order_update.checklist is not None:
        existing_conditions = {cond.check_description: cond for cond in db_order.device_conditions}
        for item_update in order_update.checklist:
            if item_update.check_description in existing_conditions:
                condition_to_update = existing_conditions[item_update.check_description]
                item_data = item_update.dict(exclude_unset=True)
                for key, value in item_data.items():
                    setattr(condition_to_update, key, value)

    db_order.status_id = 3
    db_order.completed_at = func.now()

    db.commit()
    db.refresh(db_order)
    return db_order


def assign_technician_and_start_process(db: Session, order_id: int, technician_id: int):
    """
    Asigna un técnico a una orden y la cambia al estado "En Proceso".
    """
    db_order = get_repair_order(db, order_id)
    if not db_order:
        return None

    # --- INICIO DE LA MODIFICACIÓN ---
    # Permite tomar la orden si el estado es 1 (Pendiente) o 6 (Esperando repuesto).
    if db_order.technician_id is None and db_order.status_id in [1, 6]:
        # --- FIN DE LA MODIFICACIÓN ---
        db_order.technician_id = technician_id
        db_order.status_id = 2  # 2 = In Process
        db.commit()
        db.refresh(db_order)
        return db_order
    return None