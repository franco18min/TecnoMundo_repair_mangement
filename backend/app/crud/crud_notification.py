from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.notification import Notification

def get_notifications_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 20) -> List[Notification]:
    """
    Obtiene el historial de notificaciones para un usuario específico.
    """
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

def create_notification(db: Session, user_id: int, message: str, link_to: Optional[str] = None) -> Notification:
    """
    Crea una nueva notificación para un usuario.
    """
    db_notification = Notification(
        user_id=user_id,
        message=message,
        link_to=link_to
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
    """
    Marca una notificación como leída, asegurándose de que pertenece al usuario.
    """
    db_notification = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if db_notification:
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
        return db_notification
    return None