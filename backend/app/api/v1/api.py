# backend/app/api/v1/api.py

from fastapi import APIRouter
# --- INICIO DE LA MODIFICACIÓN ---
from .endpoints import repair_orders, auth, customers, device_types, users, notifications, branches # IMPORTAMOS BRANCHES
# --- FIN DE LA MODIFICACIÓN ---

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

# --- INICIO DE LA MODIFICACIÓN ---
# Añadimos el nuevo router para las sucursales
api_router.include_router(branches.router, prefix="/branches", tags=["branches"])
# --- FIN DE LA MODIFICACIÓN ---

api_router.include_router(device_types.router, prefix="/device-types", tags=["device-types"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(repair_orders.router, prefix="/repair-orders", tags=["repair-orders"])