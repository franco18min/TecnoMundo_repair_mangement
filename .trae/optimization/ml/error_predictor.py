#!/usr/bin/env python3
"""
🚨 NEXUS - Error Prediction & Auto-Resolution System
Sistema de predicción y resolución autónoma de errores con ML
TecnoMundo Repair Management - Trae 2.0
"""

import json
import numpy as np
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict, Counter
import re
import hashlib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.cluster import DBSCAN
from sklearn.metrics import classification_report, accuracy_score
import warnings
warnings.filterwarnings('ignore')

@dataclass
class ErrorPattern:
    """Patrón de error identificado"""
    error_id: str
    error_type: str
    error_signature: str
    frequency: int
    severity: str  # low, medium, high, critical
    context_patterns: List[str]
    resolution_strategies: List[Dict[str, Any]]
    success_rate: float
    last_occurrence: datetime
    auto_resolvable: bool
    confidence_score: float

@dataclass
class ErrorResolution:
    """Resolución de error aplicada"""
    resolution_id: str
    error_id: str
    strategy_used: str
    steps_executed: List[str]
    success: bool
    execution_time: float
    side_effects: List[str]
    user_feedback: Optional[str]
    timestamp: datetime

@dataclass
class PredictionResult:
    """Resultado de predicción de error"""
    predicted_errors: List[Dict[str, Any]]
    confidence_scores: List[float]
    prevention_strategies: List[Dict[str, Any]]
    risk_assessment: Dict[str, float]
    recommended_actions: List[str]
    monitoring_points: List[str]

class ErrorPredictionSystem:
    """Sistema de predicción y resolución autónoma de errores"""
    
    def __init__(self, data_dir: str = ".trae/optimization/ml"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Archivos de datos
        self.errors_file = self.data_dir / "error_patterns.json"
        self.resolutions_file = self.data_dir / "error_resolutions.json"
        self.models_dir = self.data_dir / "error_models"
        self.models_dir.mkdir(exist_ok=True)
        
        # Estado del sistema
        self.error_patterns: Dict[str, ErrorPattern] = {}
        self.error_resolutions: List[ErrorResolution] = []
        self.error_history: List[Dict[str, Any]] = []
        
        # Modelos de ML
        self.error_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.error_clusterer = DBSCAN(eps=0.3, min_samples=2)
        self.text_vectorizer = TfidfVectorizer(max_features=200, stop_words='english')
        
        # Patrones de error comunes
        self.common_error_patterns = {
            "import_error": {
                "regex": r"ImportError|ModuleNotFoundError",
                "severity": "medium",
                "auto_resolvable": True,
                "resolution_strategies": [
                    {"type": "install_package", "command": "pip install {package}"},
                    {"type": "check_path", "action": "verify_python_path"},
                    {"type": "virtual_env", "action": "activate_venv"}
                ]
            },
            "syntax_error": {
                "regex": r"SyntaxError|IndentationError",
                "severity": "high",
                "auto_resolvable": False,
                "resolution_strategies": [
                    {"type": "syntax_check", "action": "highlight_syntax_issue"},
                    {"type": "format_code", "action": "auto_format"},
                    {"type": "suggest_fix", "action": "provide_correction"}
                ]
            },
            "api_error": {
                "regex": r"ConnectionError|TimeoutError|HTTPError",
                "severity": "medium",
                "auto_resolvable": True,
                "resolution_strategies": [
                    {"type": "retry_request", "max_attempts": 3},
                    {"type": "check_connectivity", "action": "ping_endpoint"},
                    {"type": "fallback_endpoint", "action": "use_backup"}
                ]
            },
            "database_error": {
                "regex": r"DatabaseError|OperationalError|IntegrityError",
                "severity": "high",
                "auto_resolvable": True,
                "resolution_strategies": [
                    {"type": "reconnect_db", "action": "refresh_connection"},
                    {"type": "check_schema", "action": "validate_tables"},
                    {"type": "rollback_transaction", "action": "safe_rollback"}
                ]
            },
            "permission_error": {
                "regex": r"PermissionError|AccessDenied",
                "severity": "medium",
                "auto_resolvable": True,
                "resolution_strategies": [
                    {"type": "check_permissions", "action": "verify_file_access"},
                    {"type": "run_as_admin", "action": "elevate_privileges"},
                    {"type": "change_ownership", "action": "fix_file_ownership"}
                ]
            }
        }
        
        # Métricas del sistema
        self.prediction_metrics = {
            "errors_predicted": 0,
            "errors_prevented": 0,
            "auto_resolutions_successful": 0,
            "auto_resolutions_failed": 0,
            "prediction_accuracy": 0.0,
            "average_resolution_time": 0.0,
            "user_satisfaction": 0.0
        }
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Cargar datos existentes
        self._load_error_data()
        self._initialize_models()
    
    def predict_potential_errors(self, context_data: Dict[str, Any]) -> PredictionResult:
        """Predice errores potenciales basado en el contexto actual"""
        
        try:
            # Extraer características del contexto
            features = self._extract_context_features(context_data)
            
            # Detectar anomalías en el contexto
            anomalies = self._detect_context_anomalies(features)
            
            # Predecir tipos de error probables
            error_predictions = self._predict_error_types(features)
            
            # Calcular scores de confianza
            confidence_scores = self._calculate_prediction_confidence(error_predictions, features)
            
            # Evaluar riesgo general
            risk_assessment = self._assess_error_risk(context_data, error_predictions)
            
            # Generar estrategias de prevención
            prevention_strategies = self._generate_prevention_strategies(error_predictions, context_data)
            
            # Identificar puntos de monitoreo
            monitoring_points = self._identify_monitoring_points(context_data, error_predictions)
            
            # Recomendar acciones proactivas
            recommended_actions = self._generate_proactive_actions(
                error_predictions, risk_assessment, context_data
            )
            
            result = PredictionResult(
                predicted_errors=error_predictions,
                confidence_scores=confidence_scores,
                prevention_strategies=prevention_strategies,
                risk_assessment=risk_assessment,
                recommended_actions=recommended_actions,
                monitoring_points=monitoring_points
            )
            
            # Actualizar métricas
            self.prediction_metrics["errors_predicted"] += len(error_predictions)
            
            self.logger.info(f"🔮 Predicción completada - {len(error_predictions)} errores potenciales detectados")
            return result
            
        except Exception as e:
            self.logger.error(f"Error en predicción: {e}")
            return PredictionResult([], [], [], {}, [], [])
    
    def auto_resolve_error(self, error_data: Dict[str, Any]) -> Dict[str, Any]:
        """Intenta resolver automáticamente un error"""
        
        try:
            # Identificar el patrón de error
            error_pattern = self._identify_error_pattern(error_data)
            
            if not error_pattern or not error_pattern.auto_resolvable:
                return {
                    "success": False,
                    "reason": "Error no auto-resolvable",
                    "manual_steps_required": True,
                    "suggested_actions": self._generate_manual_resolution_steps(error_data)
                }
            
            # Seleccionar estrategia de resolución
            resolution_strategy = self._select_resolution_strategy(error_pattern, error_data)
            
            # Ejecutar resolución
            execution_result = self._execute_resolution_strategy(resolution_strategy, error_data)
            
            # Verificar éxito de la resolución
            resolution_success = self._verify_resolution_success(error_data, execution_result)
            
            # Documentar resolución
            resolution_record = ErrorResolution(
                resolution_id=f"res_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                error_id=error_pattern.error_id,
                strategy_used=resolution_strategy["type"],
                steps_executed=execution_result.get("steps", []),
                success=resolution_success,
                execution_time=execution_result.get("execution_time", 0.0),
                side_effects=execution_result.get("side_effects", []),
                user_feedback=None,
                timestamp=datetime.now()
            )
            
            self.error_resolutions.append(resolution_record)
            
            # Actualizar patrón de error con resultado
            self._update_error_pattern_success_rate(error_pattern, resolution_success)
            
            # Actualizar métricas
            if resolution_success:
                self.prediction_metrics["auto_resolutions_successful"] += 1
            else:
                self.prediction_metrics["auto_resolutions_failed"] += 1
            
            result = {
                "success": resolution_success,
                "resolution_id": resolution_record.resolution_id,
                "strategy_used": resolution_strategy["type"],
                "steps_executed": execution_result.get("steps", []),
                "execution_time": execution_result.get("execution_time", 0.0),
                "side_effects": execution_result.get("side_effects", []),
                "confidence": error_pattern.confidence_score,
                "follow_up_actions": self._generate_follow_up_actions(resolution_record)
            }
            
            if resolution_success:
                self.logger.info(f"✅ Error resuelto automáticamente - {error_pattern.error_type}")
            else:
                self.logger.warning(f"❌ Resolución automática falló - {error_pattern.error_type}")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error en resolución automática: {e}")
            return {
                "success": False,
                "error": str(e),
                "manual_intervention_required": True
            }
    
    def learn_from_error(self, error_data: Dict[str, Any], 
                        resolution_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Aprende de un error ocurrido para mejorar predicciones futuras"""
        
        try:
            # Registrar error en historial
            error_record = {
                **error_data,
                "timestamp": datetime.now(),
                "learned": False
            }
            self.error_history.append(error_record)
            
            # Identificar o crear patrón de error
            error_pattern = self._identify_or_create_error_pattern(error_data)
            
            # Actualizar frecuencia del patrón
            error_pattern.frequency += 1
            error_pattern.last_occurrence = datetime.now()
            
            # Analizar contexto del error
            context_analysis = self._analyze_error_context(error_data)
            
            # Actualizar patrones de contexto
            self._update_context_patterns(error_pattern, context_analysis)
            
            # Si hay datos de resolución, aprender de ellos
            learning_insights = {}
            if resolution_data:
                learning_insights = self._learn_from_resolution(error_pattern, resolution_data)
            
            # Identificar mejoras en estrategias de resolución
            strategy_improvements = self._identify_strategy_improvements(error_pattern, resolution_data)
            
            # Actualizar modelos de ML
            model_update_result = self._update_ml_models(error_data, resolution_data)
            
            # Generar insights de aprendizaje
            learning_result = {
                "error_pattern_updated": True,
                "pattern_id": error_pattern.error_id,
                "frequency_updated": error_pattern.frequency,
                "context_patterns_learned": len(context_analysis.get("new_patterns", [])),
                "resolution_insights": learning_insights,
                "strategy_improvements": strategy_improvements,
                "model_updates": model_update_result,
                "prediction_improvements": self._calculate_prediction_improvements(error_pattern),
                "recommendations": self._generate_learning_recommendations(error_pattern, context_analysis)
            }
            
            # Marcar como aprendido
            error_record["learned"] = True
            
            self.logger.info(f"🧠 Aprendizaje completado - Patrón: {error_pattern.error_type}")
            return learning_result
            
        except Exception as e:
            self.logger.error(f"Error en aprendizaje: {e}")
            return {"success": False, "error": str(e)}
    
    def get_error_analytics(self, time_window_days: int = 30) -> Dict[str, Any]:
        """Obtiene análisis de errores en una ventana de tiempo"""
        
        try:
            # Filtrar errores por ventana de tiempo
            cutoff_date = datetime.now() - timedelta(days=time_window_days)
            recent_errors = [
                error for error in self.error_history
                if error.get("timestamp", datetime.now()) > cutoff_date
            ]
            
            if not recent_errors:
                return {
                    "success": False,
                    "reason": "No hay errores en la ventana de tiempo especificada",
                    "time_window_days": time_window_days
                }
            
            # Análisis de frecuencia por tipo
            error_frequency = Counter([
                error.get("error_type", "unknown") for error in recent_errors
            ])
            
            # Análisis temporal
            temporal_analysis = self._analyze_error_temporal_patterns(recent_errors)
            
            # Análisis de severidad
            severity_analysis = self._analyze_error_severity_patterns(recent_errors)
            
            # Análisis de resolución
            resolution_analysis = self._analyze_resolution_effectiveness(recent_errors)
            
            # Tendencias de mejora
            improvement_trends = self._calculate_improvement_trends(recent_errors)
            
            # Top errores problemáticos
            problematic_errors = self._identify_problematic_errors(recent_errors)
            
            # Recomendaciones de mejora
            improvement_recommendations = self._generate_improvement_recommendations(
                recent_errors, error_frequency, resolution_analysis
            )
            
            analytics = {
                "analysis_period": f"{time_window_days} días",
                "total_errors": len(recent_errors),
                "unique_error_types": len(error_frequency),
                "error_frequency": dict(error_frequency.most_common(10)),
                "temporal_patterns": temporal_analysis,
                "severity_distribution": severity_analysis,
                "resolution_effectiveness": resolution_analysis,
                "improvement_trends": improvement_trends,
                "problematic_errors": problematic_errors,
                "system_metrics": self.prediction_metrics,
                "improvement_recommendations": improvement_recommendations,
                "health_score": self._calculate_error_system_health_score(recent_errors)
            }
            
            self.logger.info(f"📊 Análisis completado - {len(recent_errors)} errores analizados")
            return analytics
            
        except Exception as e:
            self.logger.error(f"Error en análisis: {e}")
            return {"success": False, "error": str(e)}
    
    def optimize_error_handling(self) -> Dict[str, Any]:
        """Optimiza el sistema de manejo de errores basado en datos históricos"""
        
        try:
            # Analizar efectividad de estrategias actuales
            strategy_effectiveness = self._analyze_strategy_effectiveness()
            
            # Identificar patrones de error recurrentes
            recurring_patterns = self._identify_recurring_error_patterns()
            
            # Optimizar umbrales de confianza
            confidence_optimization = self._optimize_confidence_thresholds()
            
            # Mejorar estrategias de resolución
            strategy_improvements = self._improve_resolution_strategies()
            
            # Actualizar modelos de predicción
            model_optimization = self._optimize_prediction_models()
            
            # Generar nuevas reglas de auto-resolución
            new_auto_resolution_rules = self._generate_auto_resolution_rules()
            
            # Aplicar optimizaciones
            optimization_results = self._apply_optimizations({
                "strategy_effectiveness": strategy_effectiveness,
                "confidence_optimization": confidence_optimization,
                "strategy_improvements": strategy_improvements,
                "model_optimization": model_optimization,
                "new_rules": new_auto_resolution_rules
            })
            
            # Calcular impacto esperado
            expected_impact = self._calculate_optimization_impact(optimization_results)
            
            optimization_summary = {
                "optimizations_applied": len(optimization_results),
                "strategy_improvements": len(strategy_improvements),
                "new_auto_resolution_rules": len(new_auto_resolution_rules),
                "model_accuracy_improvement": model_optimization.get("accuracy_improvement", 0.0),
                "expected_error_reduction": expected_impact.get("error_reduction", 0.0),
                "expected_resolution_improvement": expected_impact.get("resolution_improvement", 0.0),
                "optimization_details": optimization_results,
                "monitoring_recommendations": self._generate_optimization_monitoring_plan()
            }
            
            self.logger.info(f"⚡ Optimización completada - {len(optimization_results)} mejoras aplicadas")
            return optimization_summary
            
        except Exception as e:
            self.logger.error(f"Error en optimización: {e}")
            return {"success": False, "error": str(e)}
    
    # Métodos auxiliares para procesamiento
    
    def _extract_context_features(self, context_data: Dict[str, Any]) -> np.ndarray:
        """Extrae características numéricas del contexto"""
        
        features = []
        
        # Características temporales
        now = datetime.now()
        features.extend([
            now.hour,
            now.weekday(),
            1.0 if now.weekday() >= 5 else 0.0  # es fin de semana
        ])
        
        # Características del proyecto
        features.extend([
            len(context_data.get("files_modified", [])),
            len(context_data.get("dependencies", [])),
            context_data.get("complexity_score", 0.0),
            context_data.get("test_coverage", 0.0)
        ])
        
        # Características del sistema
        features.extend([
            context_data.get("memory_usage", 0.0),
            context_data.get("cpu_usage", 0.0),
            context_data.get("disk_usage", 0.0),
            len(context_data.get("active_processes", []))
        ])
        
        # Características de desarrollo
        features.extend([
            len(context_data.get("recent_commits", [])),
            context_data.get("lines_of_code_changed", 0),
            len(context_data.get("api_calls_made", [])),
            context_data.get("database_queries", 0)
        ])
        
        return np.array(features)
    
    def _identify_error_pattern(self, error_data: Dict[str, Any]) -> Optional[ErrorPattern]:
        """Identifica el patrón de error correspondiente"""
        
        error_message = error_data.get("message", "")
        error_type = error_data.get("type", "")
        
        # Buscar en patrones existentes
        for pattern in self.error_patterns.values():
            if pattern.error_type == error_type:
                return pattern
            
            # Buscar por expresión regular en patrones comunes
            for common_type, common_pattern in self.common_error_patterns.items():
                if re.search(common_pattern["regex"], error_message, re.IGNORECASE):
                    # Buscar patrón existente o crear uno nuevo
                    pattern_id = f"{common_type}_{hashlib.md5(error_message.encode()).hexdigest()[:8]}"
                    
                    if pattern_id in self.error_patterns:
                        return self.error_patterns[pattern_id]
                    else:
                        # Crear nuevo patrón basado en el común
                        new_pattern = ErrorPattern(
                            error_id=pattern_id,
                            error_type=common_type,
                            error_signature=error_message[:100],
                            frequency=0,
                            severity=common_pattern["severity"],
                            context_patterns=[],
                            resolution_strategies=common_pattern["resolution_strategies"],
                            success_rate=0.5,
                            last_occurrence=datetime.now(),
                            auto_resolvable=common_pattern["auto_resolvable"],
                            confidence_score=0.7
                        )
                        
                        self.error_patterns[pattern_id] = new_pattern
                        return new_pattern
        
        return None
    
    def _execute_resolution_strategy(self, strategy: Dict[str, Any], 
                                   error_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecuta una estrategia de resolución"""
        
        start_time = datetime.now()
        steps_executed = []
        side_effects = []
        
        try:
            strategy_type = strategy.get("type", "")
            
            if strategy_type == "install_package":
                # Simular instalación de paquete
                package_name = self._extract_package_name(error_data.get("message", ""))
                if package_name:
                    steps_executed.append(f"pip install {package_name}")
                    # En implementación real, ejecutaría el comando
                    success = True
                else:
                    success = False
            
            elif strategy_type == "retry_request":
                # Simular reintento de request
                max_attempts = strategy.get("max_attempts", 3)
                steps_executed.append(f"Reintentando request (max {max_attempts} intentos)")
                success = True  # Simular éxito
            
            elif strategy_type == "reconnect_db":
                # Simular reconexión a base de datos
                steps_executed.append("Cerrando conexión actual")
                steps_executed.append("Estableciendo nueva conexión")
                steps_executed.append("Verificando conectividad")
                success = True
            
            elif strategy_type == "check_permissions":
                # Simular verificación de permisos
                file_path = error_data.get("file_path", "")
                steps_executed.append(f"Verificando permisos para {file_path}")
                steps_executed.append("Aplicando permisos correctos")
                success = True
            
            else:
                # Estrategia no implementada
                steps_executed.append(f"Estrategia {strategy_type} no implementada")
                success = False
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "success": success,
                "steps": steps_executed,
                "side_effects": side_effects,
                "execution_time": execution_time
            }
            
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            return {
                "success": False,
                "steps": steps_executed,
                "side_effects": side_effects,
                "execution_time": execution_time,
                "error": str(e)
            }
    
    def _extract_package_name(self, error_message: str) -> Optional[str]:
        """Extrae el nombre del paquete de un mensaje de error de importación"""
        
        # Patrones comunes para extraer nombres de paquetes
        patterns = [
            r"No module named '([^']+)'",
            r"ModuleNotFoundError: No module named '([^']+)'",
            r"ImportError: No module named ([^\s]+)",
            r"cannot import name '([^']+)'"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, error_message)
            if match:
                return match.group(1)
        
        return None
    
    def _load_error_data(self):
        """Carga datos de errores desde archivos"""
        
        # Cargar patrones de error
        if self.errors_file.exists():
            try:
                with open(self.errors_file, 'r', encoding='utf-8') as f:
                    patterns_data = json.load(f)
                
                for pattern_id, pattern_data in patterns_data.items():
                    pattern = ErrorPattern(
                        error_id=pattern_data["error_id"],
                        error_type=pattern_data["error_type"],
                        error_signature=pattern_data["error_signature"],
                        frequency=pattern_data["frequency"],
                        severity=pattern_data["severity"],
                        context_patterns=pattern_data["context_patterns"],
                        resolution_strategies=pattern_data["resolution_strategies"],
                        success_rate=pattern_data["success_rate"],
                        last_occurrence=datetime.fromisoformat(pattern_data["last_occurrence"]),
                        auto_resolvable=pattern_data["auto_resolvable"],
                        confidence_score=pattern_data["confidence_score"]
                    )
                    self.error_patterns[pattern_id] = pattern
                
                self.logger.info(f"🔄 Cargados {len(self.error_patterns)} patrones de error")
                
            except Exception as e:
                self.logger.error(f"Error cargando patrones de error: {e}")
    
    def _initialize_models(self):
        """Inicializa modelos de ML con datos sintéticos si es necesario"""
        
        if not self.error_patterns:
            self.logger.info("🚀 Inicializando modelos con datos sintéticos...")
            
            # Generar datos sintéticos para inicialización
            synthetic_errors = self._generate_synthetic_error_data()
            
            for error_data in synthetic_errors:
                self.learn_from_error(error_data)
    
    def _generate_synthetic_error_data(self) -> List[Dict[str, Any]]:
        """Genera datos sintéticos de errores para inicialización"""
        
        synthetic_errors = []
        
        # Errores de importación
        synthetic_errors.extend([
            {
                "type": "ImportError",
                "message": "ModuleNotFoundError: No module named 'requests'",
                "file_path": "src/api/client.py",
                "line_number": 5,
                "severity": "medium"
            },
            {
                "type": "ImportError", 
                "message": "ModuleNotFoundError: No module named 'pandas'",
                "file_path": "src/data/processor.py",
                "line_number": 2,
                "severity": "medium"
            }
        ])
        
        # Errores de sintaxis
        synthetic_errors.extend([
            {
                "type": "SyntaxError",
                "message": "SyntaxError: invalid syntax",
                "file_path": "src/components/Login.jsx",
                "line_number": 15,
                "severity": "high"
            }
        ])
        
        # Errores de API
        synthetic_errors.extend([
            {
                "type": "ConnectionError",
                "message": "ConnectionError: Failed to establish connection",
                "file_path": "src/api/auth.py",
                "line_number": 25,
                "severity": "medium"
            }
        ])
        
        return synthetic_errors
    
    def get_system_status(self) -> Dict[str, Any]:
        """Obtiene el estado actual del sistema de predicción de errores"""
        
        return {
            "error_patterns": len(self.error_patterns),
            "error_history": len(self.error_history),
            "resolutions_recorded": len(self.error_resolutions),
            "prediction_metrics": self.prediction_metrics,
            "auto_resolvable_patterns": sum(
                1 for pattern in self.error_patterns.values() 
                if pattern.auto_resolvable
            ),
            "average_success_rate": np.mean([
                pattern.success_rate for pattern in self.error_patterns.values()
            ]) if self.error_patterns else 0.0,
            "system_health": self._calculate_error_system_health_score([])
        }

def main():
    """Función principal para testing"""
    error_system = ErrorPredictionSystem()
    
    # Simular predicción de errores
    context = {
        "files_modified": ["src/api/auth.py", "src/components/Login.jsx"],
        "dependencies": ["requests", "fastapi", "react"],
        "complexity_score": 0.7,
        "memory_usage": 0.6,
        "recent_commits": ["fix auth bug", "update login ui"]
    }
    
    prediction = error_system.predict_potential_errors(context)
    print(f"🔮 Predicción: {len(prediction.predicted_errors)} errores potenciales")
    
    # Simular error y resolución
    error_data = {
        "type": "ImportError",
        "message": "ModuleNotFoundError: No module named 'requests'",
        "file_path": "src/api/client.py",
        "line_number": 5
    }
    
    resolution = error_system.auto_resolve_error(error_data)
    print(f"🔧 Resolución: {'Exitosa' if resolution.get('success') else 'Falló'}")
    
    # Obtener estado del sistema
    status = error_system.get_system_status()
    print(f"\n📊 Estado del Sistema:")
    print(json.dumps(status, indent=2, ensure_ascii=False, default=str))

if __name__ == "__main__":
    main()