# backend/app/crud/crud_repair_order.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import json
from fastapi import BackgroundTasks

from app.core.websockets import manager
from app.crud import crud_customer, crud_notification, crud_user
from app.models.repair_order import RepairOrder as RepairOrderModel
from app.models.device_condition import DeviceCondition as DeviceConditionModel
from app.models.user import User as UserModel
from app.schemas.repair_order import RepairOrderCreate, RepairOrderUpdate, RepairOrder as RepairOrderSchema, RepairOrderDetailsUpdate
from app.schemas.notification import Notification as NotificationSchema
from app.db.session import SessionLocal


async def send_technician_notifications(order_id: int):
    with SessionLocal() as db:
        order = get_repair_order(db, order_id=order_id)
        if not order: return
        event_payload = {"event": "ORDER_CREATED", "payload": RepairOrderSchema.from_orm(order).dict()}
        all_users = db.query(UserModel).all()
        await manager.broadcast_to_users(json.dumps(event_payload, default=str), [user.id for user in all_users])
        technicians = crud_user.get_users_by_role(db, role_name="Technical")
        if not technicians: return
        message = f"Nueva orden #{order.id} ({order.device_model}) ha sido creada."
        # --- MODIFICADO ---
        link = f"order:{order.id}"
        # --- FIN DE LA MODIFICACIÓN ---
        for tech in technicians:
            db_notification = crud_notification.create_notification(db, user_id=tech.id, message=message, link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION",
                                  "payload": NotificationSchema.from_orm(db_notification).dict()}
            await manager.send_to_user(json.dumps(notification_event, default=str), tech.id)


async def send_order_taken_notification(order_id: int, technician_id: int):
    with SessionLocal() as db:
        order = get_repair_order(db, order_id=order_id)
        if not order: return
        event_payload = {"event": "ORDER_UPDATED", "payload": RepairOrderSchema.from_orm(order).dict()}
        all_users = db.query(UserModel).all()
        await manager.broadcast_to_users(json.dumps(event_payload, default=str), [user.id for user in all_users])
        technician = db.query(UserModel).filter(UserModel.id == technician_id).first()
        if not technician: return
        admins_receptionists = crud_user.get_users_by_role(db, "Administrator") + crud_user.get_users_by_role(db,
                                                                                                              "Receptionist")
        if not admins_receptionists: return
        message = f"El técnico {technician.username} ha tomado la orden #{order.id}."
        # --- MODIFICADO ---
        link = f"order:{order.id}"
        # --- FIN DE LA MODIFICACIÓN ---
        for user in admins_receptionists:
            db_notification = crud_notification.create_notification(db, user_id=user.id, message=message, link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION",
                                  "payload": NotificationSchema.from_orm(db_notification).dict()}
            await manager.send_to_user(json.dumps(notification_event, default=str), user.id)


async def send_order_updated_notification(order_id: int):
    with SessionLocal() as db:
        order = get_repair_order(db, order_id=order_id)
        if not order: return
        event_payload = {"event": "ORDER_UPDATED", "payload": RepairOrderSchema.from_orm(order).dict()}
        all_users = db.query(UserModel).all()
        await manager.broadcast_to_users(json.dumps(event_payload, default=str), [user.id for user in all_users])
        admins_receptionists = crud_user.get_users_by_role(db, "Administrator") + crud_user.get_users_by_role(db,
                                                                                                              "Receptionist")
        if not admins_receptionists: return
        message = f"La orden #{order.id} ha sido completada por el técnico."
        # --- MODIFICADO ---
        link = f"order:{order.id}"
        # --- FIN DE LA MODIFICACIÓN ---
        for user in admins_receptionists:
            db_notification = crud_notification.create_notification(db, user_id=user.id, message=message, link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION",
                                  "payload": NotificationSchema.from_orm(db_notification).dict()}
            await manager.send_to_user(json.dumps(notification_event, default=str), user.id)


async def send_order_deleted_notification(order_id: int):
    with SessionLocal() as db:
        event_payload = {"event": "ORDER_DELETED", "payload": {"id": order_id}}
        all_users = db.query(UserModel).all()
        await manager.broadcast_to_users(json.dumps(event_payload), [user.id for user in all_users])


async def send_order_reopened_notification(order_id: int):
    """
    Emite un evento ORDER_UPDATED y notifica al técnico asignado que la orden fue reabierta.
    """
    with SessionLocal() as db:
        order = get_repair_order(db, order_id=order_id)
        if not order: return

        # 1. Notificar a TODOS los usuarios para que actualicen la orden en su tabla
        event_payload = {"event": "ORDER_UPDATED", "payload": RepairOrderSchema.from_orm(order).dict()}
        all_users = db.query(UserModel).all()
        await manager.broadcast_to_users(json.dumps(event_payload, default=str), [user.id for user in all_users])

        # 2. Enviar notificación de CAMPANA solo al técnico asignado
        if order.technician_id:
            message = f"La orden #{order.id} ({order.device_model}) ha sido reabierta y requiere tu atención."
            # --- MODIFICADO ---
            link = f"order:{order.id}"
            # --- FIN DE LA MODIFICACIÓN ---
            db_notification = crud_notification.create_notification(db, user_id=order.technician_id, message=message,
                                                                    link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION",
                                  "payload": NotificationSchema.from_orm(db_notification).dict()}
            await manager.send_to_user(json.dumps(notification_event, default=str), order.technician_id)


def get_repair_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RepairOrderModel).options(joinedload(RepairOrderModel.customer),
                                              joinedload(RepairOrderModel.technician),
                                              joinedload(RepairOrderModel.status),
                                              joinedload(RepairOrderModel.device_type),
                                              joinedload(RepairOrderModel.device_conditions)).order_by(
        RepairOrderModel.created_at.desc()).offset(skip).limit(limit).all()


def get_repair_order(db: Session, order_id: int):
    return db.query(RepairOrderModel).options(joinedload(RepairOrderModel.customer),
                                              joinedload(RepairOrderModel.technician),
                                              joinedload(RepairOrderModel.status),
                                              joinedload(RepairOrderModel.device_type),
                                              joinedload(RepairOrderModel.device_conditions)).filter(
        RepairOrderModel.id == order_id).first()


def create_repair_order(db: Session, order: RepairOrderCreate, background_tasks: BackgroundTasks,
                        technician_id: int | None = None):
    customer_id = order.customer_id
    if not customer_id and order.customer:
        db_customer = crud_customer.get_customer_by_dni(db, dni=order.customer.dni)
        if db_customer:
            customer_id = db_customer.id
        else:
            new_customer = crud_customer.create_customer(db, customer=order.customer)
            customer_id = new_customer.id
    if not customer_id: raise ValueError("Se requiere información del cliente para crear una orden.")

    status_id = 6 if order.is_spare_part_ordered else 1

    # 1. Separamos los datos del checklist del resto del payload.
    checklist_data = order.checklist
    order_data = order.dict(exclude={"checklist", "customer", "is_spare_part_ordered", "customer_id"})

    # 2. Creamos la orden principal.
    db_order = RepairOrderModel(**order_data, customer_id=customer_id, technician_id=technician_id, status_id=status_id)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # 3. Si hay datos en el checklist, los recorremos y guardamos en la base de datos.
    if checklist_data:
        for item_data in checklist_data:
            db_condition = DeviceConditionModel(
                **item_data.dict(),
                order_id=db_order.id  # <-- Aquí asociamos cada ítem a la orden creada.
            )
            db.add(db_condition)
        db.commit()
        db.refresh(db_order)

    background_tasks.add_task(send_technician_notifications, order_id=db_order.id)
    return db_order


# --- FIN DE LA FUNCIÓN MODIFICADA ---


def complete_technician_work(db: Session, order_id: int, order_update: RepairOrderUpdate,
                             background_tasks: BackgroundTasks):
    db_order = get_repair_order(db, order_id)
    if not db_order: return None

    update_data = order_update.dict(exclude_unset=True, exclude={'checklist'})
    for key, value in update_data.items(): setattr(db_order, key, value)

    if order_update.checklist is not None:
        existing_conditions = {c.check_description: c for c in db_order.device_conditions}
        for item_update in order_update.checklist:
            if item_update.check_description in existing_conditions:
                condition_to_update = existing_conditions[item_update.check_description]
                item_data = item_update.dict(exclude_unset=True)
                for key, value in item_data.items(): setattr(condition_to_update, key, value)

    db_order.status_id = 3  # Cambia el estado a "Completado"
    db_order.completed_at = func.now()
    db_order.updated_at = func.now()

    db.commit()
    db.refresh(db_order)

    message = f"La orden #{db_order.id} ha sido completada por el técnico."
    background_tasks.add_task(send_order_updated_notification, order_id=db_order.id, message=message)
    return db_order


# --- NUEVA FUNCIÓN ---
def update_order_details(db: Session, order_id: int, order_update: RepairOrderDetailsUpdate,
                         background_tasks: BackgroundTasks):
    db_order = get_repair_order(db, order_id)
    if not db_order:
        return None

    customer_update_data = order_update.customer
    # Excluimos 'customer' y ahora también 'checklist' del diccionario principal
    order_update_data = order_update.dict(exclude_unset=True, exclude={'customer', 'checklist'})

    for key, value in order_update_data.items():
        setattr(db_order, key, value)

    if customer_update_data and db_order.customer:
        for key, value in customer_update_data.dict(exclude_unset=True).items():
            setattr(db_order.customer, key, value)

    # V--- BLOQUE DE CÓDIGO AÑADIDO PARA MANEJAR EL CHECKLIST ---V
    if order_update.checklist is not None:
        # Creamos un diccionario para acceder fácilmente a las condiciones existentes por su descripción
        existing_conditions = {cond.check_description: cond for cond in db_order.device_conditions}

        for item_update in order_update.checklist:
            # Si el ítem ya existe en la BD, lo actualizamos
            if item_update.check_description in existing_conditions:
                condition_to_update = existing_conditions[item_update.check_description]
                item_data = item_update.dict(exclude_unset=True)
                for key, value in item_data.items():
                    setattr(condition_to_update, key, value)
            # Si el ítem NO existe, es nuevo y debemos crearlo
            else:
                new_condition = DeviceConditionModel(
                    **item_update.dict(),
                    order_id=db_order.id  # Lo asociamos a la orden actual
                )
                db.add(new_condition)
    # ^--- FIN DEL BLOQUE AÑADIDO ---^

    db_order.updated_at = func.now()

    db.commit()
    db.refresh(db_order)

    # El sistema de notificaciones ya está preparado para este cambio.
    message = f"Los detalles de la orden #{db_order.id} han sido modificados."
    background_tasks.add_task(send_order_updated_notification, order_id=db_order.id)
    return db_order
# --- FIN DE LA MODIFICACIÓN ---

def assign_technician_and_start_process(db: Session, order_id: int, technician_id: int,
                                        background_tasks: BackgroundTasks):
    db_order = get_repair_order(db, order_id)
    if not db_order: return None
    if db_order.technician_id is None and db_order.status_id in [1, 6]:
        db_order.technician_id = technician_id
        db_order.status_id = 2
        db_order.updated_at = func.now()
        db.commit()
        db.refresh(db_order)
        background_tasks.add_task(send_order_taken_notification, order_id=order_id, technician_id=technician_id)
        return db_order
    return None


def delete_repair_order(db: Session, order_id: int, background_tasks: BackgroundTasks) -> bool:
    db_order = db.query(RepairOrderModel).filter(RepairOrderModel.id == order_id).first()
    if db_order:
        db.delete(db_order)
        db.commit()
        background_tasks.add_task(send_order_deleted_notification, order_id=order_id)
        return True
    return False


def reopen_order(db: Session, order_id: int, background_tasks: BackgroundTasks):
    """
    Reabre una orden que estaba completada, la devuelve a "En Proceso".
    """
    db_order = get_repair_order(db, order_id)
    if not db_order:
        return None

    # Solo se pueden reabrir órdenes completadas (status 3)
    if db_order.status_id == 3:
        db_order.status_id = 2  # 2 = In Process
        db_order.completed_at = None  # Limpiamos la fecha de completado

        # Opcional: añadir una nota automática
        note_prefix = "\n--- ORDEN REABIERTA ---"
        db_order.repair_notes = f"{db_order.repair_notes or ''}{note_prefix}"

        db.commit()
        db.refresh(db_order)

        # Añadimos la tarea de notificación
        background_tasks.add_task(send_order_reopened_notification, order_id=order_id)

        return db_order
    return None  # No se puede reabrir si no está completada