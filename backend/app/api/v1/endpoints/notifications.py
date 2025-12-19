# backend/app/api/v1/endpoints/notifications.py

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import asyncio
import json
import logging

from app.core.websockets import manager
from app.crud import crud_notification
from app.schemas import notification as schemas_notification
from app.models.user import User
from app.api.v1.dependencies import get_db, get_current_user, get_user_from_token

router = APIRouter()
logger = logging.getLogger(__name__)

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
    """
    Endpoint WebSocket con sistema de heartbeat para mantener conexiones vivas.
    Envía PINGs cada 30 segundos y procesa PONGs del cliente.
    """
    token = websocket.query_params.get("token")
    if not token:
        logger.warning("WS connection rejected: No token provided")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    db = next(get_db())
    current_user = None
    try:
        current_user = get_user_from_token(db=db, token=token)
        if not current_user or not getattr(current_user, "is_active", False):
            logger.warning(f"WS connection rejected: Invalid or inactive user (token: {token[:10]}...)")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    finally:
        db.close()

    # Conectar al gestor de conexiones
    await manager.connect(websocket, current_user)
    
    # Tarea de heartbeat para enviar PINGs periódicamente
    async def send_ping():
        """Envía mensajes PING cada 30 segundos para mantener la conexión viva."""
        try:
            while True:
                await asyncio.sleep(30)
                try:
                    await websocket.send_json({"event": "PING"})
                    logger.debug(f"PING sent to user {current_user.id}")
                except Exception as e:
                    logger.warning(f"Failed to send PING to user {current_user.id}: {e}")
                    break
        except asyncio.CancelledError:
            logger.debug(f"Ping task cancelled for user {current_user.id}")
    
    # Iniciar tarea de heartbeat
    ping_task = asyncio.create_task(send_ping())
    
    try:
        while True:
            # Recibir mensajes del cliente
            message = await websocket.receive_text()
            
            try:
                data = json.loads(message)
                
                # Procesar mensaje PONG del cliente
                if data.get("event") == "PONG":
                    logger.debug(f"PONG received from user {current_user.id}")
                    continue
                
                # Aquí se pueden procesar otros tipos de mensajes del cliente si es necesario
                logger.debug(f"Message received from user {current_user.id}: {data}")
                
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON received from user {current_user.id}: {message}")
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected normally for user {current_user.id}")
    except Exception as e:
        logger.error(f"WebSocket error for user {current_user.id}: {e}")
    finally:
        # Cancelar tarea de heartbeat
        ping_task.cancel()
        try:
            await ping_task
        except asyncio.CancelledError:
            pass
        
        # Asegurar que siempre se llame a disconnect
        manager.disconnect(current_user)
        logger.info(f"WebSocket cleanup completed for user {current_user.id}")
