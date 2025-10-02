# backend/app/crud/crud_repair_order.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import json
from fastapi import BackgroundTasks
import logging # <--- Añadido para diagnóstico

from app.core.websockets import manager
from app.crud import crud_customer, crud_notification, crud_user
from app.models.repair_order import RepairOrder as RepairOrderModel
from app.models.device_condition import DeviceCondition as DeviceConditionModel
from app.models.user import User as UserModel
from app.schemas.repair_order import RepairOrderCreate, RepairOrderUpdate, RepairOrder as RepairOrderSchema, \
    RepairOrderDetailsUpdate
from app.schemas.notification import Notification as NotificationSchema
from app.db.session import SessionLocal


async def send_technician_notifications(order_id: int):
    with SessionLocal() as db:
        order = get_repair_order(db, order_id=order_id)
        if not order or not order.branch_id: return

        event_payload = {"event": "ORDER_CREATED", "payload": RepairOrderSchema.from_orm(order).dict()}
        await manager.broadcast_to_all(json.dumps(event_payload, default=str))

        technicians = crud_user.get_users_by_role_and_branch(db, role_name="Technical", branch_id=order.branch_id)
        if not technicians: return

        message = f"Nueva orden #{order.id} ({order.device_model}) ha sido creada."
        link = f"order:{order.id}"
        for tech in technicians:
            db_notification = crud_notification.create_notification(db, user_id=tech.id, message=message, link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION",
                                  "payload": NotificationSchema.from_orm(db_notification).dict()}
            await manager.send_to_user(json.dumps(notification_event, default=str), tech.id)


async def send_order_taken_notification(order_id: int, technician_id: int):
    with SessionLocal() as db:
        logging.info("\n--- [DIAGNÓSTICO DE NOTIFICACIÓN: ORDEN TOMADA] ---")
        order = get_repair_order(db, order_id=order_id)
        if not order or not order.branch_id:
            logging.warning("-> Orden no encontrada o sin sucursal. Abortando.")
            return
        logging.info(f"-> Orden ID: {order.id}, Sucursal ID: {order.branch_id}")

        technician = db.query(UserModel).filter(UserModel.id == technician_id).first()
        if not technician: 
            logging.warning("-> Técnico actor no encontrado. Abortando.")
            return

        event_payload = {"event": "ORDER_UPDATED", "payload": RepairOrderSchema.from_orm(order).dict()}
        await manager.broadcast_to_all(json.dumps(event_payload, default=str))

        admins = crud_user.get_users_by_role_and_branch(db, role_name="Administrator", branch_id=order.branch_id)
        receptionists = crud_user.get_users_by_role_and_branch(db, role_name="Receptionist", branch_id=order.branch_id)
        logging.info(f"-> Admins encontrados para sucursal {order.branch_id}: {[u.username for u in admins]}")
        logging.info(f"-> Recepcionistas encontrados para sucursal {order.branch_id}: {[u.username for u in receptionists]}")

        recipients = admins + receptionists
        if not recipients:
            logging.warning("-> No se encontraron destinatarios. Abortando.")
            return
        
        final_recipients = {user.id: user for user in recipients}.values()
        logging.info(f"-> Lista final de destinatarios (sin duplicados): {[u.username for u in final_recipients]}")

        message = f"El técnico {technician.username} ha tomado la orden #{order.id}."
        link = f"order:{order.id}"
        for user in final_recipients:
            logging.info(f"--> Creando notificación para: {user.username} (ID: {user.id})")
            db_notification = crud_notification.create_notification(db, user_id=user.id, message=message, link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION", "payload": NotificationSchema.from_orm(db_notification).dict()}
            await manager.send_to_user(json.dumps(notification_event, default=str), user.id)
        logging.info("--- [FIN DEL DIAGNÓSTico] ---\n")

async def send_order_details_updated_notification(order_id: int, actor_user_id: int):
    # ... (código sin cambios)
    pass

async def send_order_updated_notification(order_id: int):
    with SessionLocal() as db:
        logging.info("\n--- [DIAGNÓSTICO DE NOTIFICACIÓN: ORDEN COMPLETADA] ---")
        order = get_repair_order(db, order_id=order_id)
        if not order or not order.branch_id:
            logging.warning("-> Orden no encontrada o sin sucursal. Abortando.")
            return
        logging.info(f"-> Orden ID: {order.id}, Sucursal ID: {order.branch_id}")

        event_payload = {"event": "ORDER_UPDATED", "payload": RepairOrderSchema.from_orm(order).dict()}
        await manager.broadcast_to_all(json.dumps(event_payload, default=str))

        admins = crud_user.get_users_by_role_and_branch(db, role_name="Administrator", branch_id=order.branch_id)
        receptionists = crud_user.get_users_by_role_and_branch(db, role_name="Receptionist", branch_id=order.branch_id)
        logging.info(f"-> Admins encontrados para sucursal {order.branch_id}: {[u.username for u in admins]}")
        logging.info(f"-> Recepcionistas encontrados para sucursal {order.branch_id}: {[u.username for u in receptionists]}")

        recipients = admins + receptionists
        if not recipients:
            logging.warning("-> No se encontraron destinatarios. Abortando.")
            return

        final_recipients = {user.id: user for user in recipients}.values()
        logging.info(f"-> Lista final de destinatarios (sin duplicados): {[u.username for u in final_recipients]}")

        technician_name = order.technician.username if order.technician else "un técnico"
        message = f"La orden #{order.id} ha sido completada por {technician_name}."
        link = f"order:{order.id}"
        for user in final_recipients:
            logging.info(f"--> Creando notificación para: {user.username} (ID: {user.id})")
            db_notification = crud_notification.create_notification(db, user_id=user.id, message=message, link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION", "payload": NotificationSchema.from_orm(db_notification).dict()}
            await manager.send_to_user(json.dumps(notification_event, default=str), user.id)
        logging.info("--- [FIN DEL DIAGNÓSTICO] ---\n")

# ... (resto del código sin cambios)

# (Se omite el resto del código para brevedad, ya que no se modifica)

async def send_order_deleted_notification(order_id: int, branch_id: int):
    event_payload = {"event": "ORDER_DELETED", "payload": {"id": order_id}}
    await manager.broadcast_to_all(json.dumps(event_payload))


async def send_order_reopened_notification(order_id: int):
    with SessionLocal() as db:
        order = get_repair_order(db, order_id=order_id)
        if not order or not order.branch_id: return
        event_payload = {"event": "ORDER_UPDATED", "payload": RepairOrderSchema.from_orm(order).dict()}
        await manager.broadcast_to_all(json.dumps(event_payload, default=str))
        if order.technician_id:
            message = f"La orden #{order.id} ({order.device_model}) ha sido reabierta y requiere tu atención."
            link = f"order:{order.id}"
            db_notification = crud_notification.create_notification(db, user_id=order.technician_id, message=message,
                                                                    link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION",
                                  "payload": NotificationSchema.from_orm(db_notification).dict()}
            await manager.send_to_user(json.dumps(notification_event, default=str), order.technician_id)

def get_repair_orders(db: Session, user: UserModel, skip: int = 0, limit: int = 100):
    query = db.query(RepairOrderModel).options(
        joinedload(RepairOrderModel.customer),
        joinedload(RepairOrderModel.technician),
        joinedload(RepairOrderModel.status),
        joinedload(RepairOrderModel.device_type),
        joinedload(RepairOrderModel.device_conditions),
        joinedload(RepairOrderModel.photos),
        joinedload(RepairOrderModel.branch)
    )
    if user.role.role_name != "Administrator" and user.branch_id:
        query = query.filter(RepairOrderModel.branch_id == user.branch_id)
    return query.order_by(RepairOrderModel.created_at.desc()).offset(skip).limit(limit).all()

def get_repair_order(db: Session, order_id: int):
    return db.query(RepairOrderModel).options(
        joinedload(RepairOrderModel.customer),
        joinedload(RepairOrderModel.technician),
        joinedload(RepairOrderModel.status),
        joinedload(RepairOrderModel.device_type),
        joinedload(RepairOrderModel.device_conditions),
        joinedload(RepairOrderModel.photos),
        joinedload(RepairOrderModel.branch)
    ).filter(RepairOrderModel.id == order_id).first()

def create_repair_order(db: Session, order: RepairOrderCreate, background_tasks: BackgroundTasks, user_id: int):
    creating_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not creating_user or not creating_user.branch_id:
        raise ValueError("El usuario no tiene una sucursal asignada y no puede crear órdenes.")
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
    checklist_data = order.checklist
    order_data = order.dict(exclude={"checklist", "customer", "is_spare_part_ordered", "customer_id"})
    db_order = RepairOrderModel(
        **order_data,
        customer_id=customer_id,
        status_id=status_id,
        branch_id=creating_user.branch_id
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    if checklist_data:
        for item_data in checklist_data:
            db_condition = DeviceConditionModel(**item_data.dict(), order_id=db_order.id)
            db.add(db_condition)
        db.commit()
        db.refresh(db_order)
    background_tasks.add_task(send_technician_notifications, order_id=db_order.id)
    return db_order

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
    db_order.status_id = 3
    db_order.completed_at = func.now()
    db_order.updated_at = func.now()
    db.commit()
    db.refresh(db_order)
    background_tasks.add_task(send_order_updated_notification, order_id=db_order.id)
    return db_order

def update_order_details(db: Session, order_id: int, order_update: RepairOrderDetailsUpdate,
                         background_tasks: BackgroundTasks, user_id: int):
    db_order = get_repair_order(db, order_id)
    if not db_order: return None
    customer_update_data = order_update.customer
    order_update_data = order_update.dict(exclude_unset=True, exclude={'customer', 'checklist'})
    for key, value in order_update_data.items():
        setattr(db_order, key, value)
    if customer_update_data and db_order.customer:
        for key, value in customer_update_data.dict(exclude_unset=True).items():
            setattr(db_order.customer, key, value)
    if order_update.checklist is not None:
        existing_conditions = {cond.check_description: cond for cond in db_order.device_conditions}
        for item_update in order_update.checklist:
            if item_update.check_description in existing_conditions:
                condition_to_update = existing_conditions[item_update.check_description]
                item_data = item_update.dict(exclude_unset=True)
                for key, value in item_data.items():
                    setattr(condition_to_update, key, value)
            else:
                new_condition = DeviceConditionModel(**item_update.dict(), order_id=db_order.id)
                db.add(new_condition)
    db_order.updated_at = func.now()
    db.commit()
    db.refresh(db_order)
    background_tasks.add_task(send_order_details_updated_notification, order_id=db_order.id, actor_user_id=user_id)
    return db_order

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
        branch_id = db_order.branch_id
        db.delete(db_order)
        db.commit()
        if branch_id:
            background_tasks.add_task(send_order_deleted_notification, order_id=order_id, branch_id=branch_id)
        return True
    return False

def reopen_order(db: Session, order_id: int, background_tasks: BackgroundTasks):
    db_order = get_repair_order(db, order_id)
    if not db_order: return None
    # Permitir reabrir órdenes completadas (3) o entregadas (5)
    if db_order.status_id in [3, 5]:
        db_order.status_id = 2  # Cambiar a "In Process"
        db_order.completed_at = None
        db_order.delivered_at = None  # Limpiar fecha de entrega si existe
        note_prefix = "\n--- ORDEN REABIERTA ---"
        db_order.repair_notes = f"{db_order.repair_notes or ''}{note_prefix}"
        db.commit()
        db.refresh(db_order)
        background_tasks.add_task(send_order_reopened_notification, order_id=order_id)
        return db_order
    return None

def get_repair_orders_by_customer(db: Session, customer_id: int):
    return (
        db.query(RepairOrderModel)
        .options(
            joinedload(RepairOrderModel.technician),
            joinedload(RepairOrderModel.status),
            joinedload(RepairOrderModel.device_type)
        )
        .filter(RepairOrderModel.customer_id == customer_id)
        .order_by(RepairOrderModel.created_at.desc())
        .all()
    )

async def send_order_delivered_notification(order_id: int, actor_user_id: int):
    with SessionLocal() as db:
        order = get_repair_order(db, order_id=order_id)
        if not order or not order.branch_id: return

        event_payload = {"event": "ORDER_UPDATED", "payload": RepairOrderSchema.from_orm(order).dict()}
        await manager.broadcast_to_all(json.dumps(event_payload, default=str))

        actor = db.query(UserModel).filter(UserModel.id == actor_user_id).first()
        actor_name = actor.username if actor else "un usuario"
        message = f"La orden #{order.id} ha sido entregada por {actor_name}."

        recipients = []
        admins = crud_user.get_users_by_role_and_branch(db, role_name="Administrator", branch_id=order.branch_id)
        receptionists = crud_user.get_users_by_role_and_branch(db, role_name="Receptionist", branch_id=order.branch_id)
        recipients.extend(admins)
        recipients.extend(receptionists)

        final_recipients = {user.id: user for user in recipients}.values()
        link = f"order:{order.id}"

        for user in final_recipients:
            if user.id != actor_user_id:
                db_notification = crud_notification.create_notification(db, user_id=user.id, message=message, link_to=link)
                notification_event = {"event": "NEW_NOTIFICATION", "payload": NotificationSchema.from_orm(db_notification).dict()}
                await manager.send_to_user(json.dumps(notification_event, default=str), user.id)

def mark_as_delivered(db: Session, order_id: int, background_tasks: BackgroundTasks, user_id: int):
    db_order = get_repair_order(db, order_id=order_id)

    if not db_order:
        raise ValueError("Orden no encontrada.")

    if db_order.status_id != 3:
        raise ValueError("La orden no puede ser entregada si no está en estado 'Completado'.")

    db_order.status_id = 5
    db_order.updated_at = func.now()
    db.commit()
    db.refresh(db_order)

    background_tasks.add_task(send_order_delivered_notification, order_id=db_order.id, actor_user_id=user_id)

    return db_order

async def send_order_transferred_notification(order_id: int, origin_branch_id: int, target_branch_id: int, actor_user_id: int):
    """Envía notificaciones sobre la transferencia tanto a la sucursal origen como destino."""
    with SessionLocal() as db:
        logging.info(f"\n--- [NOTIFICACIÓN DE TRANSFERENCIA] ---")
        order = get_repair_order(db, order_id=order_id)
        if not order:
            logging.warning("-> Orden no encontrada. Abortando.")
            return
        
        # Obtener información del usuario que realizó la transferencia
        actor_user = db.query(UserModel).filter(UserModel.id == actor_user_id).first()
        actor_name = actor_user.username if actor_user else "un usuario"
        
        # Obtener información de las sucursales
        from app.crud import crud_branch
        origin_branch = crud_branch.get_branch(db, branch_id=origin_branch_id)
        target_branch = crud_branch.get_branch(db, branch_id=target_branch_id)
        
        origin_branch_name = origin_branch.branch_name if origin_branch else "sucursal origen"
        target_branch_name = target_branch.branch_name if target_branch else "sucursal destino"
        
        # 1. Notificar a usuarios de la sucursal DESTINO
        target_users = crud_user.get_users_by_branch(db, branch_id=target_branch_id)
        if target_users:
            target_message = f"Orden #{order.id} ({order.device_model}) ha sido transferida a su sucursal desde {origin_branch_name} por {actor_name}."
            link = f"order:{order.id}"
            
            for user in target_users:
                if user.id != actor_user_id and user.is_active:
                    db_notification = crud_notification.create_notification(
                        db, user_id=user.id, message=target_message, link_to=link
                    )
                    notification_event = {
                        "event": "NEW_NOTIFICATION", 
                        "payload": NotificationSchema.from_orm(db_notification).dict()
                    }
                    await manager.send_to_user(json.dumps(notification_event, default=str), user.id)
            
            logging.info(f"-> Notificaciones enviadas a {len(target_users)} usuarios de la sucursal destino {target_branch_name}")
        
        # 2. Notificar a usuarios de la sucursal ORIGEN (excluyendo al actor)
        origin_users = crud_user.get_users_by_branch(db, branch_id=origin_branch_id)
        if origin_users:
            origin_message = f"Orden #{order.id} ({order.device_model}) ha sido transferida desde su sucursal hacia {target_branch_name} por {actor_name}."
            link = f"order:{order.id}"
            
            for user in origin_users:
                if user.id != actor_user_id and user.is_active:
                    db_notification = crud_notification.create_notification(
                        db, user_id=user.id, message=origin_message, link_to=link
                    )
                    notification_event = {
                        "event": "NEW_NOTIFICATION", 
                        "payload": NotificationSchema.from_orm(db_notification).dict()
                    }
                    await manager.send_to_user(json.dumps(notification_event, default=str), user.id)
            
            logging.info(f"-> Notificaciones enviadas a {len(origin_users)} usuarios de la sucursal origen {origin_branch_name}")
        
        logging.info("--- [FIN DE NOTIFICACIÓN DE TRANSFERENCIA] ---\n")

def transfer_order(db: Session, order_id: int, target_branch_id: int, background_tasks: BackgroundTasks, user_id: int):
    """
    Transfiere una orden de reparación a otra sucursal.
    Si la orden está en proceso (status_id=2), se resetea el técnico y se pone en pendiente (status_id=1).
    """
    # Verificar que la orden existe
    db_order = get_repair_order(db, order_id=order_id)
    if not db_order:
        raise ValueError("Orden no encontrada.")
    
    # Guardar la sucursal origen antes de actualizar
    origin_branch_id = db_order.branch_id
    
    # Verificar que la sucursal destino existe
    from app.crud import crud_branch
    target_branch = crud_branch.get_branch(db, branch_id=target_branch_id)
    if not target_branch:
        raise ValueError("Sucursal destino no encontrada.")
    
    # Verificar que no se esté transfiriendo a la misma sucursal
    if origin_branch_id == target_branch_id:
        raise ValueError("No se puede transferir una orden a la misma sucursal.")
    
    # Si la orden está en proceso (status_id=2), resetear técnico y poner en pendiente
    if db_order.status_id == 2:  # En proceso
        db_order.technician_id = None
        db_order.status_id = 1  # Pendiente
    
    # Actualizar la sucursal
    db_order.branch_id = target_branch_id
    db_order.updated_at = func.now()
    
    db.commit()
    db.refresh(db_order)
    
    # Enviar evento WebSocket para actualizar la lista en tiempo real
    event_payload = {"event": "ORDER_UPDATED", "payload": RepairOrderSchema.from_orm(db_order).dict()}
    background_tasks.add_task(manager.broadcast_to_all, json.dumps(event_payload, default=str))
    
    # Enviar notificaciones a ambas sucursales
    background_tasks.add_task(
        send_order_transferred_notification, 
        order_id=db_order.id, 
        origin_branch_id=origin_branch_id,
        target_branch_id=target_branch_id,
        actor_user_id=user_id
    )
    
    return db_order
