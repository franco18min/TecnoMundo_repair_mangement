# backend/app/api/v1/endpoints/errors.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime
import json
import os
from pathlib import Path

router = APIRouter()

# Modelos Pydantic para validar los datos de entrada
class ErrorReport(BaseModel):
    timestamp: Optional[str] = None
    errorId: str
    category: str
    severity: str
    errorType: str
    errorMessage: str
    stack: Optional[str] = None
    context: Dict[str, Any] = {}
    userId: Optional[str] = None
    component: Optional[str] = None
    environment: str = "development"

class EventReport(BaseModel):
    timestamp: str
    eventId: str
    type: str
    eventType: str
    message: str
    context: Dict[str, Any]
    userId: Optional[str] = None
    component: Optional[str] = None
    environment: str

class ErrorResponse(BaseModel):
    success: bool
    message: str
    errorId: Optional[str] = None

# Configuración de rutas de archivos
# Obtener el directorio del backend (4 niveles arriba desde este archivo)
BACKEND_DIR = Path(__file__).parent.parent.parent.parent
ERRORS_DIR = BACKEND_DIR / "errors"
ERRORS_DIR.mkdir(exist_ok=True)

FRONTEND_ERRORS_FILE = ERRORS_DIR / "frontend_errors.json"
FRONTEND_EVENTS_FILE = ERRORS_DIR / "frontend_events.json"

def save_to_file(data: dict, file_path: Path):
    """Guarda datos en un archivo JSON, manteniendo un historial"""
    try:
        # Leer datos existentes
        existing_data = []
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                try:
                    existing_data = json.load(f)
                except json.JSONDecodeError:
                    existing_data = []
        
        # Agregar nuevo dato
        existing_data.append(data)
        
        # Mantener solo los últimos 1000 registros
        if len(existing_data) > 1000:
            existing_data = existing_data[-1000:]
        
        # Guardar datos actualizados
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)
            
        return True
    except Exception as e:
        print(f"Error guardando en archivo {file_path}: {e}")
        return False

@router.post("/report", response_model=ErrorResponse)
async def report_error(error_data: ErrorReport):
    """
    Endpoint para recibir reportes de errores del frontend
    """
    try:
        # Convertir a diccionario para guardar
        error_dict = error_data.dict()
        error_dict["received_at"] = datetime.now().isoformat()
        
        # Si no hay timestamp, usar el actual
        if not error_dict.get("timestamp"):
            error_dict["timestamp"] = datetime.now().isoformat()
        
        # Guardar en archivo
        success = save_to_file(error_dict, FRONTEND_ERRORS_FILE)
        
        if success:
            return ErrorResponse(
                success=True,
                message="Error reportado exitosamente",
                errorId=error_data.errorId
            )
        else:
            raise HTTPException(status_code=500, detail="Error al guardar el reporte")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando reporte: {str(e)}")

@router.post("/event", response_model=ErrorResponse)
async def report_event(event_data: EventReport):
    """
    Endpoint para recibir eventos del frontend
    """
    try:
        # Convertir a diccionario para guardar
        event_dict = event_data.dict()
        event_dict["received_at"] = datetime.now().isoformat()
        
        # Guardar en archivo
        success = save_to_file(event_dict, FRONTEND_EVENTS_FILE)
        
        if success:
            return ErrorResponse(
                success=True,
                message="Evento reportado exitosamente",
                errorId=event_data.eventId
            )
        else:
            raise HTTPException(status_code=500, detail="Error al guardar el evento")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando evento: {str(e)}")

@router.get("/statistics")
async def get_error_statistics():
    """
    Endpoint para obtener estadísticas de errores
    """
    try:
        stats = {
            "errors": {
                "total": 0,
                "by_category": {},
                "by_severity": {},
                "recent_count": 0
            },
            "events": {
                "total": 0,
                "by_type": {},
                "recent_count": 0
            }
        }
        
        # Procesar errores
        if FRONTEND_ERRORS_FILE.exists():
            with open(FRONTEND_ERRORS_FILE, 'r', encoding='utf-8') as f:
                try:
                    errors = json.load(f)
                    stats["errors"]["total"] = len(errors)
                    
                    # Contar por categoría y severidad
                    for error in errors:
                        category = error.get("category", "unknown")
                        severity = error.get("severity", "unknown")
                        
                        stats["errors"]["by_category"][category] = stats["errors"]["by_category"].get(category, 0) + 1
                        stats["errors"]["by_severity"][severity] = stats["errors"]["by_severity"].get(severity, 0) + 1
                    
                    # Errores recientes (últimas 24 horas)
                    now = datetime.now()
                    recent_errors = []
                    for error in errors:
                        try:
                            timestamp_str = error.get("timestamp", "1970-01-01T00:00:00")
                            # Remover la 'Z' si está presente y parsear como naive datetime
                            if timestamp_str.endswith('Z'):
                                timestamp_str = timestamp_str[:-1]
                            # Remover milisegundos si están presentes
                            if '.' in timestamp_str:
                                timestamp_str = timestamp_str.split('.')[0]
                            error_time = datetime.fromisoformat(timestamp_str)
                            if (now - error_time).total_seconds() < 86400:  # 24 horas en segundos
                                recent_errors.append(error)
                        except (ValueError, TypeError):
                            continue
                    stats["errors"]["recent_count"] = len(recent_errors)
                    
                except json.JSONDecodeError:
                    pass
        
        # Procesar eventos
        if FRONTEND_EVENTS_FILE.exists():
            with open(FRONTEND_EVENTS_FILE, 'r', encoding='utf-8') as f:
                try:
                    events = json.load(f)
                    stats["events"]["total"] = len(events)
                    
                    # Contar por tipo
                    for event in events:
                        event_type = event.get("eventType", "unknown")
                        stats["events"]["by_type"][event_type] = stats["events"]["by_type"].get(event_type, 0) + 1
                    
                    # Eventos recientes (últimas 24 horas)
                    now = datetime.now()
                    recent_events = []
                    for event in events:
                        try:
                            timestamp_str = event.get("timestamp", "1970-01-01T00:00:00")
                            # Remover la 'Z' si está presente y parsear como naive datetime
                            if timestamp_str.endswith('Z'):
                                timestamp_str = timestamp_str[:-1]
                            # Remover milisegundos si están presentes
                            if '.' in timestamp_str:
                                timestamp_str = timestamp_str.split('.')[0]
                            event_time = datetime.fromisoformat(timestamp_str)
                            if (now - event_time).total_seconds() < 86400:  # 24 horas en segundos
                                recent_events.append(event)
                        except (ValueError, TypeError):
                            continue
                    stats["events"]["recent_count"] = len(recent_events)
                    
                except json.JSONDecodeError:
                    pass
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")

@router.get("/recent")
async def get_recent_errors(limit: int = 50):
    """
    Endpoint para obtener errores recientes
    """
    try:
        recent_data = {
            "errors": [],
            "events": []
        }
        
        # Obtener errores recientes
        if FRONTEND_ERRORS_FILE.exists():
            with open(FRONTEND_ERRORS_FILE, 'r', encoding='utf-8') as f:
                try:
                    errors = json.load(f)
                    recent_data["errors"] = errors[-limit:] if errors else []
                except json.JSONDecodeError:
                    pass
        
        # Obtener eventos recientes
        if FRONTEND_EVENTS_FILE.exists():
            with open(FRONTEND_EVENTS_FILE, 'r', encoding='utf-8') as f:
                try:
                    events = json.load(f)
                    recent_data["events"] = events[-limit:] if events else []
                except json.JSONDecodeError:
                    pass
        
        return recent_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo datos recientes: {str(e)}")

@router.delete("/clear")
async def clear_error_data():
    """
    Endpoint para limpiar datos de errores (solo para desarrollo)
    """
    try:
        cleared = []
        
        if FRONTEND_ERRORS_FILE.exists():
            FRONTEND_ERRORS_FILE.unlink()
            cleared.append("errors")
        
        if FRONTEND_EVENTS_FILE.exists():
            FRONTEND_EVENTS_FILE.unlink()
            cleared.append("events")
        
        return {
            "success": True,
            "message": f"Datos limpiados: {', '.join(cleared) if cleared else 'ninguno'}",
            "cleared": cleared
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error limpiando datos: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Endpoint de verificación de salud del sistema de errores
    """
    return {
        "status": "healthy",
        "service": "error_reporting",
        "timestamp": datetime.now().isoformat(),
        "files": {
            "errors_file_exists": FRONTEND_ERRORS_FILE.exists(),
            "events_file_exists": FRONTEND_EVENTS_FILE.exists(),
            "errors_dir_exists": ERRORS_DIR.exists()
        }
    }