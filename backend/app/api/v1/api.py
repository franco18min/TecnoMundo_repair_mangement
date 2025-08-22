from fastapi import APIRouter
from app.api.v1.endpoints import repair_orders

api_router = APIRouter()
api_router.include_router(repair_orders.router, prefix="/repair-orders", tags=["repair-orders"])
