# backend/app/api/v1/endpoints/device_types.py

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud import crud_device_type
from app.schemas import device_type as schemas_device_type
from app.db.session import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas_device_type.DeviceType])
def read_device_types(db: Session = Depends(get_db)):
    """
    Endpoint para obtener la lista de todos los tipos de dispositivos.
    """
    device_types = crud_device_type.get_device_types(db)
    return device_types