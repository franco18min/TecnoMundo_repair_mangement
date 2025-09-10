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
    current_user: User = Depends(get_current_user)  # Mantenemos la dependencia normal para HTTP
):
    """
    Obtiene el historial de notificaciones para el usuario actual.
    """
    return crud_notification.get_notifications_for_user(db, user_id=current_user.id)

@router.post("/{notification_id}/read", response_model=schemas_notification.Notification)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Mantenemos la dependencia normal para HTTP
):
    """
    Marca una notificación específica como leída.
    """
    return crud_notification.mark_notification_as_read(db, notification_id=notification_id, user_id=current_user.id)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Maneja las conexiones WebSocket. La autenticación se realiza manualmente
    para asegurar que la sesión de la BD se cierre correctamente.
    """
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # --- INICIO DE LA MODIFICACIÓN ---
    # Creamos una sesión de BD de corta duración solo para la autenticación
    db = next(get_db())
    try:
        current_user = get_user_from_token(db=db, token=token)
        if not current_user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    finally:
        db.close() # Cerramos la sesión inmediatamente después de usarla
    # --- FIN DE LA MODIFICACIÓN ---

    await manager.connect(websocket, current_user.id)
    try:
        while True:
            # Mantenemos la conexión viva
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(current_user.id)