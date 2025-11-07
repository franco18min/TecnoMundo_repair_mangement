# backend/app/crud/crud_email_subscription.py

from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.email_subscription import EmailSubscription

def subscribe(db: Session, order_id: int, email: str) -> EmailSubscription:
    existing = db.query(EmailSubscription).filter(
        EmailSubscription.order_id == order_id,
        EmailSubscription.email == email
    ).first()
    if existing:
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing
    sub = EmailSubscription(order_id=order_id, email=email, is_active=True)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

def unsubscribe(db: Session, order_id: int, email: str) -> bool:
    existing = db.query(EmailSubscription).filter(
        EmailSubscription.order_id == order_id,
        EmailSubscription.email == email
    ).first()
    if existing:
        existing.is_active = False
        db.commit()
        return True
    return False

def get_active_emails_by_order(db: Session, order_id: int) -> List[str]:
    rows = db.query(EmailSubscription).filter(
        EmailSubscription.order_id == order_id,
        EmailSubscription.is_active == True
    ).all()
    return [row.email for row in rows]

def is_subscribed(db: Session, order_id: int, email: str) -> bool:
    return db.query(EmailSubscription).filter(
        EmailSubscription.order_id == order_id,
        EmailSubscription.email == email,
        EmailSubscription.is_active == True
    ).first() is not None