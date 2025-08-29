from pydantic import BaseModel

class StatusOrder(BaseModel):
    id: int
    status_name: str

    class Config:
        from_attributes = True