# backend/app/api/v1/api.py

from fastapi import APIRouter
from .endpoints import repair_orders, auth, customers, device_types # --- IMPORTA EL NUEVO ENDPOINT ---

api_router = APIRouter()

# --- AÑADE EL ROUTER DE DEVICE_TYPES ---
api_router.include_router(device_types.router, prefix="/device-types", tags=["device-types"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(repair_orders.router, prefix="/repair-orders", tags=["repair-orders"])