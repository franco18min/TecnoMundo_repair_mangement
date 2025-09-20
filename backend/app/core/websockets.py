# backend/app/core/websockets.py

from fastapi import WebSocket
from typing import List, Dict
from app.models.user import User


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user: User):
        await websocket.accept()
        branch_id = user.branch_id
        if branch_id is None:
            await websocket.close(code=1008)
            return

        if branch_id not in self.active_connections:
            self.active_connections[branch_id] = {}
        self.active_connections[branch_id][user.id] = websocket

    def disconnect(self, user: User):
        branch_id = user.branch_id
        if branch_id and branch_id in self.active_connections:
            if user.id in self.active_connections[branch_id]:
                del self.active_connections[branch_id][user.id]
                if not self.active_connections[branch_id]:
                    del self.active_connections[branch_id]

    async def send_to_user(self, message: str, user_id: int):
        for branch_id in self.active_connections:
            if user_id in self.active_connections[branch_id]:
                await self.active_connections[branch_id][user_id].send_text(message)
                break

    # --- INICIO DE LA MODIFICACIÓN ---
    # Se mantiene la difusión por sucursal, pero se reintroduce una difusión global.
    async def broadcast_to_all(self, message: str):
        """Envía un mensaje a todos los usuarios conectados en todas las sucursales."""
        for branch_connections in self.active_connections.values():
            for connection in branch_connections.values():
                await connection.send_text(message)

    async def broadcast_to_branch(self, message: str, branch_id: int):
        """Envía un mensaje solo a los usuarios de una sucursal específica."""
        if branch_id in self.active_connections:
            for connection in self.active_connections[branch_id].values():
                await connection.send_text(message)
    # --- FIN DE LA MODIFICACIÓN ---


manager = ConnectionManager()