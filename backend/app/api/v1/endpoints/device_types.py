# backend/app/api/v1/endpoints/device_types.py

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud import crud_device_type
from app.schemas import device_type as schemas_device_type
# --- INICIO DE LA CORRECCIÓN DE SEGURIDAD ---
from app.api.v1 import dependencies as deps
from app.models.user import User
# --- FIN DE LA CORRECCIÓN DE SEGURIDAD ---

router = APIRouter()

@router.get("/", response_model=List[schemas_device_type.DeviceType])
def read_device_types(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user) # <-- Guardia añadido
):
    """
    Endpoint para obtener la lista de todos los tipos de dispositivos.
    Solo accesible para usuarios activos.
    """
    device_types = crud_device_type.get_device_types(db)
    return device_types
