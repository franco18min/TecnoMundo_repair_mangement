from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ErrorReport(BaseModel):
    request_id: Optional[str] = None
    route: Optional[str] = None
    user_message: Optional[str] = None
    error_code: Optional[str] = None
    status: Optional[int] = None
    client_context: Optional[Dict[str, Any]] = None
    user_agent: Optional[str] = None