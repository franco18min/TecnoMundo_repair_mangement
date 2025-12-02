from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class Record(BaseModel):
    id: int
    event_type: str
    id_even_type: Optional[int] = None
    order_id: int
    actor_user_id: Optional[int] = None
    origin_branch_id: Optional[int] = None
    target_branch_id: Optional[int] = None
    prev_status_id: Optional[int] = None
    new_status_id: Optional[int] = None
    description: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RecordFilter(BaseModel):
    type: Optional[str] = None
    user_id: Optional[int] = None
    branch_id: Optional[int] = None
    order_id: Optional[int] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
    skip: int = 0
    limit: int = 100
