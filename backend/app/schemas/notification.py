from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Notification(BaseModel):
    id: int
    user_id: int
    message: str
    is_read: bool
    link_to: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True