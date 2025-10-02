# backend/app/schemas/repair_order.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

from .customer import Customer, CustomerCreate, CustomerUpdate
from .user import User
from .status_order import StatusOrder
from .device_type import DeviceType
from .device_condition import DeviceCondition, DeviceConditionCreate, DeviceConditionUpdate
from .repair_order_photo import RepairOrderPhoto
from .branch import Branch # <-- IMPORTAMOS EL NUEVO ESQUEMA


class RepairOrder(BaseModel):
    id: int
    device_model: Optional[str] = None
    created_at: datetime
    customer: Customer
    technician: Optional[User] = None
    status: Optional[StatusOrder] = None
    device_type: Optional[DeviceType] = None
    # --- INICIO DE LA MODIFICACIÓN ---
    branch: Optional[Branch] = None # <-- AÑADIMOS LA SUCURSAL
    # --- FIN DE LA MODIFICACIÓN ---
    problem_description: str
    accesories: Optional[str] = None
    observations: Optional[str] = None
    password_or_pattern: Optional[str] = None
    deposit: Optional[float] = None
    total_cost: Optional[float] = None
    balance: Optional[float] = None
    parts_used: Optional[str] = None
    technician_diagnosis: Optional[str] = None
    repair_notes: Optional[str] = None
    device_conditions: List[DeviceCondition] = []
    photos: List[RepairOrderPhoto] = []

    class Config:
        from_attributes = True

# ... (El resto de los esquemas como RepairOrderCreate, etc., no necesitan cambios por ahora)

class RepairOrderCreate(BaseModel):
    is_spare_part_ordered: bool = False
    customer_id: Optional[int] = None
    customer: Optional[CustomerCreate] = None
    device_type_id: int
    device_model: str
    serial_number: Optional[str] = None
    accesories: Optional[str] = None
    problem_description: str
    password_or_pattern: Optional[str] = None
    observations: Optional[str] = None
    total_cost: Optional[float] = 0.0
    deposit: Optional[float] = 0.0
    parts_used: Optional[str] = None
    checklist: List[DeviceConditionCreate] = []

    class Config:
        from_attributes = True


# Schema para que el TÉCNICO complete su trabajo
class RepairOrderUpdate(BaseModel):
    technician_diagnosis: Optional[str] = None
    repair_notes: Optional[str] = None
    parts_used: Optional[str] = None
    total_cost: Optional[float] = None
    deposit: Optional[float] = None
    status_id: Optional[int] = Field(None, ge=1, le=6)
    checklist: Optional[List[DeviceConditionUpdate]] = None

class RepairOrderTransfer(BaseModel):
    target_branch_id: int = Field(..., description="ID de la sucursal destino")
    
    class Config:
        from_attributes = True


# Para que ADMIN/RECEPCIONISTA modifiquen detalles
class RepairOrderDetailsUpdate(BaseModel):
    customer: Optional[CustomerUpdate] = None
    device_type_id: Optional[int] = None
    device_model: Optional[str] = None
    serial_number: Optional[str] = None
    accesories: Optional[str] = None
    problem_description: Optional[str] = None
    password_or_pattern: Optional[str] = None
    observations: Optional[str] = None
    total_cost: Optional[float] = None
    deposit: Optional[float] = None
    parts_used: Optional[str] = None
    status_id: Optional[int] = Field(None, ge=1, le=6)
    checklist: Optional[List[DeviceConditionUpdate]] = None

# Schema para actualizar solo campos de diagnóstico
class RepairOrderDiagnosisUpdate(BaseModel):
    technician_diagnosis: Optional[str] = None
    repair_notes: Optional[str] = None
    
    class Config:
        from_attributes = True