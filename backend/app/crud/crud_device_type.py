# backend/app/crud/crud_device_type.py

from sqlalchemy.orm import Session
from app.models.device_type import DeviceType as DeviceTypeModel

def get_device_types(db: Session):
    """
    Obtiene todos los tipos de dispositivos de la base de datos.
    """
    return db.query(DeviceTypeModel).order_by(DeviceTypeModel.type_name).all()