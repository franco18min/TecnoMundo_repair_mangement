from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import json
from fastapi import BackgroundTasks

from app.core.websockets import manager
from app.crud import crud_customer, crud_notification, crud_user
from app.models.repair_order import RepairOrder as RepairOrderModel
from app.models.device_condition import DeviceCondition as DeviceConditionModel
from app.models.user import User as UserModel
from app.schemas.repair_order import RepairOrderCreate, RepairOrderUpdate, RepairOrder as RepairOrderSchema
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
        link = f"/orders/{order.id}"
        for tech in technicians:
            db_notification = crud_notification.create_notification(db, user_id=tech.id, message=message, link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION", "payload": NotificationSchema.from_orm(db_notification).dict()}
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
        admins_receptionists = crud_user.get_users_by_role(db, "Administrator") + crud_user.get_users_by_role(db, "Receptionist")
        if not admins_receptionists: return
        message = f"El técnico {technician.username} ha tomado la orden #{order.id}."
        link = f"/orders/{order.id}"
        for user in admins_receptionists:
            db_notification = crud_notification.create_notification(db, user_id=user.id, message=message, link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION", "payload": NotificationSchema.from_orm(db_notification).dict()}
            await manager.send_to_user(json.dumps(notification_event, default=str), user.id)

async def send_order_updated_notification(order_id: int):
    with SessionLocal() as db:
        order = get_repair_order(db, order_id=order_id)
        if not order: return
        event_payload = {"event": "ORDER_UPDATED", "payload": RepairOrderSchema.from_orm(order).dict()}
        all_users = db.query(UserModel).all()
        await manager.broadcast_to_users(json.dumps(event_payload, default=str), [user.id for user in all_users])
        admins_receptionists = crud_user.get_users_by_role(db, "Administrator") + crud_user.get_users_by_role(db, "Receptionist")
        if not admins_receptionists: return
        message = f"La orden #{order.id} ha sido completada por el técnico."
        link = f"/orders/{order.id}"
        for user in admins_receptionists:
            db_notification = crud_notification.create_notification(db, user_id=user.id, message=message, link_to=link)
            notification_event = {"event": "NEW_NOTIFICATION", "payload": NotificationSchema.from_orm(db_notification).dict()}
            await manager.send_to_user(json.dumps(notification_event, default=str), user.id)

async def send_order_deleted_notification(order_id: int):
    with SessionLocal() as db:
        event_payload = {"event": "ORDER_DELETED", "payload": {"id": order_id}}
        all_users = db.query(UserModel).all()
        await manager.broadcast_to_users(json.dumps(event_payload), [user.id for user in all_users])

def get_repair_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RepairOrderModel).options(joinedload(RepairOrderModel.customer), joinedload(RepairOrderModel.technician), joinedload(RepairOrderModel.status), joinedload(RepairOrderModel.device_type), joinedload(RepairOrderModel.device_conditions)).order_by(RepairOrderModel.created_at.desc()).offset(skip).limit(limit).all()

def get_repair_order(db: Session, order_id: int):
    return db.query(RepairOrderModel).options(joinedload(RepairOrderModel.customer), joinedload(RepairOrderModel.technician), joinedload(RepairOrderModel.status), joinedload(RepairOrderModel.device_type), joinedload(RepairOrderModel.device_conditions)).filter(RepairOrderModel.id == order_id).first()

def create_repair_order(db: Session, order: RepairOrderCreate, background_tasks: BackgroundTasks, technician_id: int | None = None):
    customer_id = order.customer_id
    if not customer_id and order.customer:
        db_customer = crud_customer.get_customer_by_dni(db, dni=order.customer.dni)
        if db_customer: customer_id = db_customer.id
        else:
            new_customer = crud_customer.create_customer(db, customer=order.customer)
            customer_id = new_customer.id
    if not customer_id: raise ValueError("Se requiere información del cliente para crear una orden.")
    status_id = 6 if order.is_spare_part_ordered else 1
    order_data = order.dict(exclude={"checklist", "customer", "is_spare_part_ordered", "customer_id"})
    db_order = RepairOrderModel(**order_data, customer_id=customer_id, technician_id=technician_id, status_id=status_id)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    background_tasks.add_task(send_technician_notifications, order_id=db_order.id)
    return db_order

def update_repair_order(db: Session, order_id: int, order_update: RepairOrderUpdate, background_tasks: BackgroundTasks):
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
    db.commit()
    db.refresh(db_order)
    background_tasks.add_task(send_order_updated_notification, order_id=db_order.id)
    return db_order

def assign_technician_and_start_process(db: Session, order_id: int, technician_id: int, background_tasks: BackgroundTasks):
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