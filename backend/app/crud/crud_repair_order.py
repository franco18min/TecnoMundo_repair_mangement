# backend/app/crud/crud_repair_order.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import json  # Importamos json para formatear el mensaje

# Importaciones para notificaciones
from app.core.websockets import manager
from app.crud import crud_customer, crud_notification, crud_user

from app.models.repair_order import RepairOrder as RepairOrderModel
from app.models.device_condition import DeviceCondition as DeviceConditionModel
from app.schemas.repair_order import RepairOrderCreate, RepairOrderUpdate


def get_repair_orders(db: Session, skip: int = 0, limit: int = 100):
    """
    Obtiene una lista de órdenes de reparación con sus relaciones cargadas.
    """
    # (Esta función no necesita cambios, la dejamos como está)
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
    # (Esta función no necesita cambios, la dejamos como está)
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


# --- INICIO DE LA MODIFICACIÓN ---
async def create_repair_order(db: Session, order: RepairOrderCreate, technician_id: int | None = None):
    # Convertimos la función a asíncrona con 'async def'
    """
    Crea una nueva orden de reparación, gestionando el cliente, el checklist y ENVIANDO UNA NOTIFICACIÓN.
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
    db_order = RepairOrderModel(**order_data, customer_id=customer_id, technician_id=technician_id, status_id=status_id)

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    if checklist_data:
        for item_data in checklist_data:
            db_condition = DeviceConditionModel(**item_data.dict(), order_id=db_order.id)
            db.add(db_condition)
        db.commit()
        db.refresh(db_order)

    # --- LÓGICA DE NOTIFICACIÓN ---
    # 1. Obtenemos todos los técnicos
    technicians = crud_user.get_users_by_role(db, role_name="Technical")
    technician_ids = [tech.id for tech in technicians]

    # 2. Creamos el mensaje y el enlace
    message = f"Nueva orden #{db_order.id} ({db_order.device_model}) ha sido creada."
    link = f"/orders/{db_order.id}"  # Asumiendo una futura ruta de detalle

    # 3. Guardamos la notificación en la BD para cada técnico
    for tech_id in technician_ids:
        crud_notification.create_notification(db, user_id=tech_id, message=message, link_to=link)

    # 4. Creamos un payload JSON para enviar por WebSocket
    notification_payload = json.dumps({"message": message, "link_to": link})

    # 5. Usamos el manager para enviar la notificación en tiempo real a los técnicos conectados
    await manager.broadcast_to_users(notification_payload, technician_ids)

    return db_order


# --- FIN DE LA MODIFICACIÓN ---


def update_repair_order(db: Session, order_id: int, order_update: RepairOrderUpdate):
    # (Esta función no necesita cambios por ahora, la dejamos como está)
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
    # (Esta función no necesita cambios por ahora, la dejamos como está)
    db_order = get_repair_order(db, order_id)
    if not db_order:
        return None

    if db_order.technician_id is None and db_order.status_id in [1, 6]:
        db_order.technician_id = technician_id
        db_order.status_id = 2
        db.commit()
        db.refresh(db_order)
        return db_order
    return None