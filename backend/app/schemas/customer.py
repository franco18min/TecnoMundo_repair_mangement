from pydantic import BaseModel

class Customer(BaseModel):
    id: int
    first_name: str
    last_name: str

    class Config:
        from_attributes = True