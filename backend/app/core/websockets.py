# backend/app/core/websockets.py

from fastapi import WebSocket
from typing import List, Dict
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user: User):
        await websocket.accept()
        branch_id = user.branch_id
        if branch_id is None:
            logger.warning(f"WS Rejected: User {user.id} has no branch_id")
            await websocket.close(code=1008)
            return

        if branch_id not in self.active_connections:
            self.active_connections[branch_id] = {}
        self.active_connections[branch_id][user.id] = websocket
        
        # Logging mejorado con métricas
        total_connections = self.get_connection_count()
        logger.info(f"WS Connected: User {user.id} | Branch {branch_id} | Total connections: {total_connections}")

    def disconnect(self, user: User):
        branch_id = user.branch_id
        if branch_id and branch_id in self.active_connections:
            if user.id in self.active_connections[branch_id]:
                del self.active_connections[branch_id][user.id]
                
                # Logging mejorado con métricas
                total_connections = self.get_connection_count()
                logger.info(f"WS Disconnected: User {user.id} | Branch {branch_id} | Total connections: {total_connections}")
                
                if not self.active_connections[branch_id]:
                    del self.active_connections[branch_id]

    async def send_to_user(self, message: str, user_id: int):
        """Envía un mensaje a un usuario específico."""
        for branch_id in self.active_connections:
            if user_id in self.active_connections[branch_id]:
                try:
                    await self.active_connections[branch_id][user_id].send_text(message)
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {e}")
                break

    async def broadcast_to_all(self, message: str):
        """Envía un mensaje a todos los usuarios conectados en todas las sucursales."""
        disconnected_users = []
        
        for branch_id, branch_connections in self.active_connections.items():
            for user_id, connection in branch_connections.items():
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.warning(f"Failed to send to user {user_id} in branch {branch_id}: {e}")
                    disconnected_users.append((branch_id, user_id))
        
        # Limpiar conexiones que fallaron
        for branch_id, user_id in disconnected_users:
            if branch_id in self.active_connections and user_id in self.active_connections[branch_id]:
                del self.active_connections[branch_id][user_id]
                logger.info(f"Removed stale connection: User {user_id} | Branch {branch_id}")
                if not self.active_connections[branch_id]:
                    del self.active_connections[branch_id]

    async def broadcast_to_branch(self, message: str, branch_id: int):
        """Envía un mensaje solo a los usuarios de una sucursal específica."""
        if branch_id not in self.active_connections:
            return
        
        disconnected_users = []
        
        for user_id, connection in self.active_connections[branch_id].items():
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Failed to send to user {user_id} in branch {branch_id}: {e}")
                disconnected_users.append(user_id)
        
        # Limpiar conexiones que fallaron
        for user_id in disconnected_users:
            if user_id in self.active_connections[branch_id]:
                del self.active_connections[branch_id][user_id]
                logger.info(f"Removed stale connection: User {user_id} | Branch {branch_id}")
        
        if not self.active_connections[branch_id]:
            del self.active_connections[branch_id]

    def get_connection_count(self) -> int:
        """Retorna el número total de conexiones activas."""
        count = 0
        for branch_connections in self.active_connections.values():
            count += len(branch_connections)
        return count

    def get_branch_connection_count(self, branch_id: int) -> int:
        """Retorna el número de conexiones activas en una sucursal específica."""
        if branch_id in self.active_connections:
            return len(self.active_connections[branch_id])
        return 0


manager = ConnectionManager()