# backend/app/api/v1/api.py

from fastapi import APIRouter
# V ---- PASO 1: ASEGÚRATE DE QUE 'notifications' ESTÉ IMPORTADO AQUÍ ---- V
from .endpoints import repair_orders, auth, customers, device_types, users, notifications

api_router = APIRouter()

# Registramos los routers existentes
api_router.include_router(users.router, prefix="/users", tags=["users"])

# V ---- PASO 2: AÑADE ESTA LÍNEA PARA REGISTRAR EL ROUTER DE NOTIFICACIONES ---- V
# Esta línea es la que falta y causa el error.
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

api_router.include_router(device_types.router, prefix="/device-types", tags=["device-types"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(repair_orders.router, prefix="/repair-orders", tags=["repair-orders"])