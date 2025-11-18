# backend/main.py

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1.api import api_router
from app.db.base import init_db
from app.core.config import settings
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from uuid import uuid4
from app.core.logger import structured_logger, ErrorCategory, ErrorSeverity

@asynccontextmanager
async def lifespan(app: FastAPI):
    # init_db() # Mantenemos esto comentado ya que tus tablas ya existen
    yield
    pass

app = FastAPI(title="Servicio Técnico Pro API", lifespan=lifespan)

# --- CONFIGURACIÓN DE CORS: ahora toma orígenes desde settings ---
origins = settings.ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Usa la lista de settings
    allow_credentials=True,
    allow_methods=["*"], # Permite todos los métodos
    allow_headers=["*"], # Permite todas las cabeceras
)

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-Id"] = request_id
        return response

app.add_middleware(RequestIdMiddleware)

def error_payload(code: str, message: str, request: Request, details: dict | None = None, status_code: int = 400):
    payload = {
        "code": code,
        "message": message,
        "details": details or {},
        "request_id": getattr(request.state, "request_id", None),
        "detail": message
    }
    return JSONResponse(status_code=status_code, content=payload)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    structured_logger.log_error(exc, ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM, {"errors": exc.errors()}, endpoint=str(request.url), request_id=getattr(request.state, "request_id", None))
    return error_payload("validation_error", "Datos inválidos", request, {"errors": exc.errors()}, 422)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    severity = ErrorSeverity.MEDIUM if exc.status_code < 500 else ErrorSeverity.HIGH
    structured_logger.log_error(exc, ErrorCategory.API, severity, {"status_code": exc.status_code, "detail": exc.detail}, endpoint=str(request.url), request_id=getattr(request.state, "request_id", None))
    message = exc.detail if isinstance(exc.detail, str) else "Error de solicitud"
    return error_payload("http_error", message, request, {"status_code": exc.status_code}, exc.status_code)

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    structured_logger.log_error(exc, ErrorCategory.SYSTEM, ErrorSeverity.CRITICAL, {}, endpoint=str(request.url), request_id=getattr(request.state, "request_id", None))
    return error_payload("internal_error", "Error interno del servidor", request, {}, 500)

@app.get("/")
def read_root():
    return {"message": "API de Servicio Técnico Pro funcionando."}

# Este endpoint de prueba es útil para verificar la conexión básica
@app.get("/hello")
def hello_world():
    return {"message": "El backend responde correctamente"}

app.include_router(api_router, prefix="/api/v1")
