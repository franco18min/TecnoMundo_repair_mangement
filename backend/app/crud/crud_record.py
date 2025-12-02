from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.record import Record as RecordModel
from app.models.type_record import TypeRecord
from app.schemas.record import RecordFilter
from app.core.logger import structured_logger, ErrorCategory, ErrorSeverity

EVENT_CODE_TO_DBNAME = {
    "ORDER_CREATED": "Order creation",
    "STATUS_CHANGED": "Order_status_change",
    "TRANSFERRED": "Order transfer",
}

SPANISH_TO_DBNAME = {
    "Creación de orden": "Order creation",
    "Cambio de estado": "Order_status_change",
    "Transferencia de orden": "Order transfer",
}

def log_order_event(
    db: Session,
    *,
    event_type: str,
    order_id: int,
    actor_user_id: int | None = None,
    prev_status_id: int | None = None,
    new_status_id: int | None = None,
    origin_branch_id: int | None = None,
    target_branch_id: int | None = None,
    description: str | None = None,
    meta: dict | None = None,
):
    # mapear código interno a nombre en DB
    db_name = EVENT_CODE_TO_DBNAME.get(event_type, event_type)
    try:
        tr = db.query(TypeRecord).filter(TypeRecord.type_name == db_name).first()
        if not tr:
            tr = TypeRecord(type_name=db_name)
            db.add(tr)
            db.commit()
            db.refresh(tr)
    except Exception:
        return None

    record = RecordModel(
        id_even_type=tr.id,
        order_id=order_id,
        actor_user_id=actor_user_id,
        prev_status_id=prev_status_id,
        new_status_id=new_status_id,
        origin_branch_id=origin_branch_id,
        target_branch_id=target_branch_id,
        description=description,
        meta=meta or {},
    )
    try:
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    except Exception:
        return None

def get_records(db: Session, filters: RecordFilter):
    q = db.query(RecordModel)
    if filters.type:
        mapped = SPANISH_TO_DBNAME.get(filters.type, filters.type)
        q = q.join(RecordModel.type_record).filter(TypeRecord.type_name == mapped)
    if filters.user_id:
        q = q.filter(RecordModel.actor_user_id == filters.user_id)
    if filters.branch_id:
        q = q.filter(or_(RecordModel.origin_branch_id == filters.branch_id, RecordModel.target_branch_id == filters.branch_id))
    if filters.order_id:
        q = q.filter(RecordModel.order_id == filters.order_id)
    if filters.from_date:
        q = q.filter(RecordModel.created_at >= filters.from_date)
    if filters.to_date:
        q = q.filter(RecordModel.created_at <= filters.to_date)
    return q.order_by(RecordModel.created_at.desc()).offset(filters.skip).limit(filters.limit).all()
