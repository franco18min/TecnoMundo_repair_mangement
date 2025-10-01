from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import uuid
from typing import Callable
import time

from .logger import structured_logger, ErrorCategory, ErrorSeverity

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware para capturar y registrar errores automáticamente"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Generar ID único para la petición
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # Log de petición exitosa (solo para endpoints importantes)
            if request.url.path.startswith("/api/"):
                process_time = time.time() - start_time
                structured_logger.log_event(
                    event_type="api_request",
                    message=f"{request.method} {request.url.path} - {response.status_code}",
                    context={
                        "method": request.method,
                        "path": request.url.path,
                        "status_code": response.status_code,
                        "process_time": round(process_time, 3),
                        "user_agent": request.headers.get("user-agent"),
                        "ip": request.client.host if request.client else None
                    },
                    user_id=getattr(request.state, "user_id", None)
                )
            
            return response
            
        except HTTPException as exc:
            # Errores HTTP controlados
            severity = ErrorSeverity.MEDIUM if exc.status_code >= 500 else ErrorSeverity.LOW
            category = self._categorize_http_error(exc.status_code)
            
            structured_logger.log_error(
                error=exc,
                category=category,
                severity=severity,
                context={
                    "status_code": exc.status_code,
                    "method": request.method,
                    "path": request.url.path,
                    "headers": dict(request.headers),
                    "query_params": dict(request.query_params)
                },
                user_id=getattr(request.state, "user_id", None),
                endpoint=request.url.path,
                request_id=request_id
            )
            
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "error": exc.detail,
                    "request_id": request_id,
                    "timestamp": time.time()
                }
            )
            
        except Exception as exc:
            # Errores no controlados - CRÍTICOS
            structured_logger.log_error(
                error=exc,
                category=ErrorCategory.SYSTEM,
                severity=ErrorSeverity.CRITICAL,
                context={
                    "method": request.method,
                    "path": request.url.path,
                    "headers": dict(request.headers),
                    "query_params": dict(request.query_params)
                },
                user_id=getattr(request.state, "user_id", None),
                endpoint=request.url.path,
                request_id=request_id
            )
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Error interno del servidor",
                    "request_id": request_id,
                    "timestamp": time.time()
                }
            )
    
    def _categorize_http_error(self, status_code: int) -> ErrorCategory:
        """Categoriza errores HTTP según el código de estado"""
        if status_code == 401:
            return ErrorCategory.AUTH
        elif status_code == 403:
            return ErrorCategory.SECURITY
        elif status_code == 422:
            return ErrorCategory.VALIDATION
        elif status_code >= 500:
            return ErrorCategory.SYSTEM
        else:
            return ErrorCategory.API