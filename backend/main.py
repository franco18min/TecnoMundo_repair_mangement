# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1.api import api_router
from app.db.base import init_db
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- Evento de arranque: Conectando a la base de datos... ---")
    # init_db() # Mantenemos esto comentado ya que tus tablas ya existen
    print("--- Conexión establecida. El servidor está listo. ---")
    yield
    print("--- Evento de cierre: Servidor apagándose. ---")

app = FastAPI(title="Servicio Técnico Pro API", lifespan=lifespan)

# --- CONFIGURACIÓN DE CORS: ahora toma orígenes desde settings ---
origins = settings.ALLOWED_ORIGINS
print(f"[CORS] Allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Usa la lista de settings
    allow_credentials=True,
    allow_methods=["*"], # Permite todos los métodos
    allow_headers=["*"], # Permite todas las cabeceras
)

@app.get("/")
def read_root():
    return {"message": "API de Servicio Técnico Pro funcionando."}

# Este endpoint de prueba es útil para verificar la conexión básica
@app.get("/hello")
def hello_world():
    print("--- ¡La petición a /hello llegó y fue procesada! ---")
    return {"message": "El backend responde correctamente"}

app.include_router(api_router, prefix="/api/v1")