from fastapi import APIRouter
from .endpoints import repair_orders, auth # --- IMPORTA EL NUEVO ENDPOINT DE AUTH ---

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"]) # --- AÑADE EL ROUTER DE AUTH ---
api_router.include_router(repair_orders.router, prefix="/repair-orders", tags=["repair-orders"])