# backend/app/api/v1/endpoints/notifications.py

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.websockets import manager
from app.crud import crud_notification
from app.schemas import notification as schemas_notification
from app.models.user import User
from app.api.v1.dependencies import get_db, get_current_user, get_user_from_token

router = APIRouter()

@router.get("/", response_model=List[schemas_notification.Notification])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene el historial de notificaciones para el usuario actual.
    """
    return crud_notification.get_notifications_for_user(db, user_id=current_user.id)

@router.post("/{notification_id}/read", response_model=schemas_notification.Notification)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marca una notificación específica como leída.
    """
    db_notification = crud_notification.mark_notification_as_read(db, notification_id=notification_id, user_id=current_user.id)
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notificación no encontrada o no pertenece al usuario.")
    return db_notification

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    db = next(get_db())
    try:
        current_user = get_user_from_token(db=db, token=token)
        if not current_user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    finally:
        db.close()

    # Pasamos el objeto 'current_user' completo al gestor de conexiones
    await manager.connect(websocket, current_user)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(current_user)