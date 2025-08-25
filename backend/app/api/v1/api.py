from fastapi import APIRouter
# CORRECCIÓN: Se hizo la importación relativa al paquete actual
from .endpoints import repair_orders

api_router = APIRouter()
api_router.include_router(repair_orders.router, prefix="/repair-orders", tags=["repair-orders"])