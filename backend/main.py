from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1.api import api_router
from app.db.base import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- Evento de arranque: Inicializando la base de datos... ---")
    init_db()
    print("--- Base de datos inicializada correctamente. ---")
    yield
    print("--- Evento de cierre: Servidor apagándose. ---")

app = FastAPI(title="Servicio Técnico Pro API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NUEVO ENDPOINT DE PRUEBA "HOLA MUNDO" ---
@app.get("/hello")
def hello_world():
    print("--- ¡La petición a /hello llegó y fue procesada! ---")
    return {"message": "El backend responde correctamente"}
# ---------------------------------------------

@app.get("/")
def read_root():
    return {"message": "API de Servicio Técnico Pro funcionando."}

app.include_router(api_router, prefix="/api/v1")