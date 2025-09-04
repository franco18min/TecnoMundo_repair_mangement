# backend/app/api/v1/api.py

from fastapi import APIRouter
from .endpoints import repair_orders, auth, customers, device_types, users # IMPORTAMOS USERS

api_router = APIRouter()

# --- INICIO DE LA MODIFICACIÓN ---
# Añadimos el router de users. Es buena práctica ponerlo antes de los que lo usan.
api_router.include_router(users.router, prefix="/users", tags=["users"])
# --- FIN DE LA MODIFICACIÓN ---

api_router.include_router(device_types.router, prefix="/device-types", tags=["device-types"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(repair_orders.router, prefix="/repair-orders", tags=["repair-orders"])