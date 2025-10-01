# backend/app/api/v1/api.py

from fastapi import APIRouter
from .endpoints import repair_orders, auth, customers, device_types, users, notifications, branches, roles, init, debug, errors

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(branches.router, prefix="/branches", tags=["branches"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(device_types.router, prefix="/device-types", tags=["device-types"])
api_router.include_router(repair_orders.router, prefix="/repair-orders", tags=["repair-orders"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(init.router, prefix="/init", tags=["initialization"])
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])
api_router.include_router(errors.router, prefix="/errors", tags=["errors"])
