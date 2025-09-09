from fastapi import WebSocket
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        # Mantenemos un diccionario de conexiones activas: {user_id: WebSocket}
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_to_user(self, message: str, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

    async def broadcast_to_users(self, message: str, user_ids: List[int]):
        for user_id in user_ids:
            if user_id in self.active_connections:
                await self.active_connections[user_id].send_text(message)

# Creamos una única instancia global para que toda la aplicación la use
manager = ConnectionManager()