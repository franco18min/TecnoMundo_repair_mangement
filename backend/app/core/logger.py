import json
import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional
from enum import Enum
import traceback

class ErrorCategory(Enum):
    """Categorías de errores para mejor organización"""
    AUTH = "authentication"
    DATABASE = "database"
    API = "api"
    VALIDATION = "validation"
    EXTERNAL_SERVICE = "external_service"
    SYSTEM = "system"
    SECURITY = "security"
    BUSINESS_LOGIC = "business_logic"

class ErrorSeverity(Enum):
    """Niveles de severidad de errores"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class StructuredLogger:
    """Logger estructurado para manejo de errores y eventos"""
    
    def __init__(self):
        self.errors_dir = os.path.join(os.path.dirname(__file__), "..", "..", "errors")
        os.makedirs(self.errors_dir, exist_ok=True)
        
        # Configurar logger básico
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def log_error(
        self,
        error: Exception,
        category: ErrorCategory,
        severity: ErrorSeverity,
        context: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        endpoint: Optional[str] = None,
        request_id: Optional[str] = None
    ):
        """
        Registra un error de forma estructurada
        
        Args:
            error: La excepción capturada
            category: Categoría del error
            severity: Severidad del error
            context: Contexto adicional del error
            user_id: ID del usuario afectado (si aplica)
            endpoint: Endpoint donde ocurrió el error
            request_id: ID único de la petición
        """
        error_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "error_id": f"{category.value}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "category": category.value,
            "severity": severity.value,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "traceback": traceback.format_exc(),
            "context": context or {},
            "user_id": user_id,
            "endpoint": endpoint,
            "request_id": request_id,
            "environment": os.getenv("ENVIRONMENT", "development")
        }
        
        # Guardar en archivo JSON
        self._save_to_file(error_data)
        
        # Log en consola según severidad
        if severity in [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL]:
            self.logger.error(f"[{severity.value.upper()}] {category.value}: {str(error)}")
        else:
            self.logger.warning(f"[{severity.value.upper()}] {category.value}: {str(error)}")
    
    def log_event(
        self,
        event_type: str,
        message: str,
        context: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ):
        """
        Registra eventos importantes del sistema
        
        Args:
            event_type: Tipo de evento (login, logout, order_created, etc.)
            message: Mensaje descriptivo del evento
            context: Contexto adicional
            user_id: ID del usuario relacionado
        """
        event_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_id": f"event_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "type": "event",
            "event_type": event_type,
            "message": message,
            "context": context or {},
            "user_id": user_id,
            "environment": os.getenv("ENVIRONMENT", "development")
        }
        
        self._save_to_file(event_data, file_type="events")
        self.logger.info(f"EVENT [{event_type}]: {message}")
    
    def _save_to_file(self, data: Dict[str, Any], file_type: str = "errors"):
        """Guarda los datos en archivo JSON"""
        today = datetime.now().strftime("%Y-%m-%d")
        filename = f"{file_type}_{today}.json"
        filepath = os.path.join(self.errors_dir, filename)
        
        # Leer archivo existente o crear lista vacía
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            existing_data = []
        
        # Agregar nuevo registro
        existing_data.append(data)
        
        # Guardar archivo actualizado
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)
    
    def get_error_summary(self, days: int = 7) -> Dict[str, Any]:
        """
        Obtiene un resumen de errores de los últimos días
        
        Args:
            days: Número de días hacia atrás para analizar
            
        Returns:
            Diccionario con estadísticas de errores
        """
        summary = {
            "total_errors": 0,
            "by_category": {},
            "by_severity": {},
            "critical_errors": [],
            "recent_patterns": []
        }
        
        # Analizar archivos de errores de los últimos días
        for i in range(days):
            date = datetime.now() - timedelta(days=i)
            filename = f"errors_{date.strftime('%Y-%m-%d')}.json"
            filepath = os.path.join(self.errors_dir, filename)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    daily_errors = json.load(f)
                    
                for error in daily_errors:
                    summary["total_errors"] += 1
                    
                    # Contar por categoría
                    category = error.get("category", "unknown")
                    summary["by_category"][category] = summary["by_category"].get(category, 0) + 1
                    
                    # Contar por severidad
                    severity = error.get("severity", "unknown")
                    summary["by_severity"][severity] = summary["by_severity"].get(severity, 0) + 1
                    
                    # Recopilar errores críticos
                    if severity == "critical":
                        summary["critical_errors"].append({
                            "timestamp": error.get("timestamp"),
                            "error_message": error.get("error_message"),
                            "endpoint": error.get("endpoint")
                        })
                        
            except FileNotFoundError:
                continue
        
        return summary

# Instancia global del logger
structured_logger = StructuredLogger()