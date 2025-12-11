from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.record import Record as RecordSchema
from app.schemas.record import RecordFilter
from app.crud import crud_record
from app.models.user import User
from app.api.v1 import dependencies as deps

router = APIRouter()

@router.get("/", response_model=List[RecordSchema])
def read_records(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    type: Optional[str] = None,
    user_id: Optional[int] = None,
    branch_id: Optional[int] = None,
    order_id: Optional[int] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
):
    filters = RecordFilter(
        type=type,
        user_id=user_id,
        branch_id=branch_id,
        order_id=order_id,
        from_date=None,
        to_date=None,
        skip=skip,
        limit=limit,
    )
    return crud_record.get_records(db, filters)
