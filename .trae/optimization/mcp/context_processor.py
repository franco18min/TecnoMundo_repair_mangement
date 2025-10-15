#!/usr/bin/env python3
"""
🎯 NEXUS - Context Processor (MCP System)
Procesamiento inteligente de contexto y planificación adaptativa
TecnoMundo Repair Management - Trae 2.0
"""

import json
import logging
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict, deque
import re
import hashlib
from enum import Enum

class ContextType(Enum):
    """Tipos de contexto disponibles"""
    DEVELOPMENT = "development"
    DEBUGGING = "debugging"
    OPTIMIZATION = "optimization"
    TESTING = "testing"
    DOCUMENTATION = "documentation"
    DEPLOYMENT = "deployment"
    LEARNING = "learning"

class Priority(Enum):
    """Niveles de prioridad"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class ContextPattern:
    """Patrón de contexto identificado"""
    pattern_id: str
    pattern_type: ContextType
    triggers: List[str]
    context_requirements: List[str]
    estimated_tokens: int
    success_rate: float
    last_used: datetime
    usage_count: int

@dataclass
class PlanningTask:
    """Tarea de planificación"""
    task_id: str
    description: str
    context_type: ContextType
    priority: Priority
    estimated_duration: int  # minutos
    required_context: List[str]
    dependencies: List[str]
    tools_needed: List[str]
    success_criteria: List[str]
    created_at: datetime
    status: str = "pending"

@dataclass
class ContextSnapshot:
    """Snapshot de contexto procesado"""
    snapshot_id: str
    context_type: ContextType
    active_patterns: List[str]
    context_data: Dict[str, Any]
    processing_metadata: Dict[str, Any]
    confidence_score: float
    created_at: datetime

class ContextProcessor:
    """Procesador avanzado de contexto con IA integrada"""
    
    def __init__(self, config_dir: str = ".trae/config"):
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # Archivos de configuración
        self.patterns_file = self.config_dir / "context_patterns.json"
        self.planning_file = self.config_dir / "planning_tasks.json"
        
        # Estado interno
        self.context_patterns: Dict[str, ContextPattern] = {}
        self.active_tasks: Dict[str, PlanningTask] = {}
        self.context_history: deque = deque(maxlen=100)
        self.pattern_success_rates: Dict[str, List[float]] = defaultdict(list)
        
        # Métricas de rendimiento
        self.processing_metrics = {
            "contexts_processed": 0,
            "patterns_matched": 0,
            "planning_accuracy": 0.0,
            "average_processing_time": 0.0,
            "context_cache_hits": 0
        }
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Cargar patrones y tareas existentes
        self._load_context_patterns()
        self._load_planning_tasks()
        self._initialize_default_patterns()
    
    def process_natural_command(self, command: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Procesa un comando natural y genera contexto optimizado"""
        
        start_time = datetime.now()
        
        try:
            # Normalizar comando
            normalized_command = self._normalize_command(command)
            
            # Detectar tipo de contexto
            context_type = self._detect_context_type(normalized_command)
            
            # Identificar patrones aplicables
            matching_patterns = self._find_matching_patterns(normalized_command, context_type)
            
            # Generar contexto específico
            context_data = self._generate_context_data(normalized_command, context_type, matching_patterns, user_context)
            
            # Crear plan de ejecución
            execution_plan = self._create_execution_plan(normalized_command, context_type, context_data)
            
            # Estimar recursos necesarios
            resource_estimation = self._estimate_resources(execution_plan, matching_patterns)
            
            # Crear snapshot de contexto
            snapshot = self._create_context_snapshot(context_type, matching_patterns, context_data)
            
            # Actualizar métricas
            processing_time = (datetime.now() - start_time).total_seconds()
            self._update_processing_metrics(processing_time, len(matching_patterns))
            
            # Registrar en historial
            self.context_history.append({
                "command": command,
                "context_type": context_type.value,
                "patterns_used": [p.pattern_id for p in matching_patterns],
                "timestamp": datetime.now(),
                "processing_time": processing_time
            })
            
            result = {
                "success": True,
                "context_type": context_type.value,
                "context_data": context_data,
                "execution_plan": execution_plan,
                "resource_estimation": resource_estimation,
                "snapshot_id": snapshot.snapshot_id,
                "confidence_score": snapshot.confidence_score,
                "processing_time": processing_time,
                "patterns_matched": len(matching_patterns),
                "recommendations": self._generate_recommendations(context_type, matching_patterns)
            }
            
            self.logger.info(f"🎯 Comando procesado: {command[:50]}... (tipo: {context_type.value}, confianza: {snapshot.confidence_score:.2f})")
            return result
            
        except Exception as e:
            self.logger.error(f"Error procesando comando '{command}': {e}")
            return {
                "success": False,
                "error": str(e),
                "context_type": "unknown",
                "fallback_suggestions": self._get_fallback_suggestions(command)
            }
    
    def plan_development_session(self, goals: List[str], time_available: int, 
                               user_preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """Planifica una sesión de desarrollo completa"""
        
        try:
            # Analizar objetivos
            analyzed_goals = self._analyze_goals(goals)
            
            # Crear tareas basadas en objetivos
            planned_tasks = []
            total_estimated_time = 0
            
            for goal in analyzed_goals:
                tasks = self._break_down_goal_into_tasks(goal, user_preferences)
                planned_tasks.extend(tasks)
                total_estimated_time += sum(task.estimated_duration for task in tasks)
            
            # Optimizar orden de tareas
            optimized_schedule = self._optimize_task_schedule(planned_tasks, time_available)
            
            # Identificar dependencias críticas
            critical_path = self._identify_critical_path(optimized_schedule)
            
            # Generar recomendaciones de contexto
            context_recommendations = self._generate_context_recommendations(optimized_schedule)
            
            # Calcular métricas de factibilidad
            feasibility_metrics = self._calculate_feasibility_metrics(
                optimized_schedule, time_available, total_estimated_time
            )
            
            session_plan = {
                "session_id": self._generate_session_id(),
                "goals": goals,
                "analyzed_goals": analyzed_goals,
                "planned_tasks": [asdict(task) for task in optimized_schedule],
                "critical_path": critical_path,
                "context_recommendations": context_recommendations,
                "time_allocation": {
                    "available_minutes": time_available,
                    "estimated_minutes": total_estimated_time,
                    "buffer_minutes": max(0, time_available - total_estimated_time),
                    "feasibility_score": feasibility_metrics["feasibility_score"]
                },
                "success_probability": feasibility_metrics["success_probability"],
                "risk_factors": feasibility_metrics["risk_factors"],
                "optimization_suggestions": self._generate_optimization_suggestions(optimized_schedule),
                "created_at": datetime.now().isoformat()
            }
            
            # Guardar plan para seguimiento
            self._save_session_plan(session_plan)
            
            self.logger.info(f"📋 Sesión planificada: {len(optimized_schedule)} tareas, {total_estimated_time} min estimados")
            return session_plan
            
        except Exception as e:
            self.logger.error(f"Error planificando sesión: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback_plan": self._generate_fallback_plan(goals, time_available)
            }
    
    def adapt_context_to_user(self, user_id: str, interaction_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Adapta el contexto basado en el historial del usuario"""
        
        try:
            # Analizar patrones de uso del usuario
            usage_patterns = self._analyze_user_patterns(interaction_history)
            
            # Identificar preferencias implícitas
            implicit_preferences = self._extract_implicit_preferences(interaction_history)
            
            # Calcular scores de contexto personalizados
            personalized_scores = self._calculate_personalized_context_scores(usage_patterns)
            
            # Generar recomendaciones adaptativas
            adaptive_recommendations = self._generate_adaptive_recommendations(
                usage_patterns, implicit_preferences, personalized_scores
            )
            
            # Crear perfil de contexto personalizado
            personalized_profile = {
                "user_id": user_id,
                "usage_patterns": usage_patterns,
                "implicit_preferences": implicit_preferences,
                "context_scores": personalized_scores,
                "adaptive_recommendations": adaptive_recommendations,
                "learning_insights": self._generate_learning_insights(interaction_history),
                "optimization_opportunities": self._identify_optimization_opportunities(usage_patterns),
                "last_updated": datetime.now().isoformat()
            }
            
            # Actualizar patrones de contexto con aprendizaje
            self._update_patterns_with_learning(personalized_profile)
            
            self.logger.info(f"🧠 Contexto adaptado para usuario {user_id}: {len(usage_patterns)} patrones identificados")
            return personalized_profile
            
        except Exception as e:
            self.logger.error(f"Error adaptando contexto para usuario {user_id}: {e}")
            return {
                "success": False,
                "error": str(e),
                "user_id": user_id
            }
    
    def optimize_token_usage(self, context_data: Dict[str, Any], target_tokens: int) -> Dict[str, Any]:
        """Optimiza el uso de tokens manteniendo calidad"""
        
        try:
            # Analizar contenido actual
            current_analysis = self._analyze_current_content(context_data)
            
            # Identificar elementos optimizables
            optimization_candidates = self._identify_optimization_candidates(context_data, current_analysis)
            
            # Aplicar técnicas de optimización
            optimized_content = self._apply_optimization_techniques(
                context_data, optimization_candidates, target_tokens
            )
            
            # Validar calidad después de optimización
            quality_metrics = self._validate_optimization_quality(context_data, optimized_content)
            
            # Generar reporte de optimización
            optimization_report = {
                "original_estimated_tokens": current_analysis["estimated_tokens"],
                "target_tokens": target_tokens,
                "optimized_estimated_tokens": optimized_content["estimated_tokens"],
                "token_reduction": current_analysis["estimated_tokens"] - optimized_content["estimated_tokens"],
                "reduction_percentage": ((current_analysis["estimated_tokens"] - optimized_content["estimated_tokens"]) / current_analysis["estimated_tokens"]) * 100,
                "quality_score": quality_metrics["quality_score"],
                "optimization_techniques_used": optimized_content["techniques_used"],
                "quality_impact": quality_metrics["quality_impact"],
                "recommendations": quality_metrics["recommendations"]
            }
            
            result = {
                "success": True,
                "optimized_context": optimized_content["context"],
                "optimization_report": optimization_report,
                "quality_maintained": quality_metrics["quality_score"] >= 0.8,
                "target_achieved": optimized_content["estimated_tokens"] <= target_tokens
            }
            
            self.logger.info(f"⚡ Optimización completada: {optimization_report['token_reduction']} tokens reducidos ({optimization_report['reduction_percentage']:.1f}%)")
            return result
            
        except Exception as e:
            self.logger.error(f"Error optimizando tokens: {e}")
            return {
                "success": False,
                "error": str(e),
                "original_context": context_data
            }
    
    def _normalize_command(self, command: str) -> str:
        """Normaliza un comando para procesamiento"""
        # Convertir a minúsculas y limpiar
        normalized = command.lower().strip()
        
        # Remover caracteres especiales innecesarios
        normalized = re.sub(r'[^\w\s\-áéíóúñü]', ' ', normalized)
        
        # Normalizar espacios
        normalized = re.sub(r'\s+', ' ', normalized)
        
        return normalized
    
    def _detect_context_type(self, command: str) -> ContextType:
        """Detecta el tipo de contexto basado en el comando"""
        
        # Patrones de detección por tipo
        patterns = {
            ContextType.DEVELOPMENT: [
                r'\b(crear|hacer|generar|implementar|desarrollar|construir|añadir|agregar)\b',
                r'\b(componente|función|clase|módulo|feature|funcionalidad)\b',
                r'\b(frontend|backend|api|database|ui|interfaz)\b'
            ],
            ContextType.DEBUGGING: [
                r'\b(error|problema|bug|fallo|arreglar|corregir|solucionar|debuggear)\b',
                r'\b(no funciona|no sirve|roto|broken)\b',
                r'\b(revisar|verificar|diagnosticar|analizar)\b'
            ],
            ContextType.OPTIMIZATION: [
                r'\b(optimizar|mejorar|acelerar|performance|rendimiento)\b',
                r'\b(lento|rápido|eficiencia|velocidad)\b',
                r'\b(refactorizar|refactor|limpiar|organizar)\b'
            ],
            ContextType.TESTING: [
                r'\b(probar|test|testing|verificar|validar)\b',
                r'\b(unit test|integration|e2e|qa)\b',
                r'\b(funciona|works|coverage|cobertura)\b'
            ],
            ContextType.DOCUMENTATION: [
                r'\b(documentar|documento|doc|readme|guía|manual)\b',
                r'\b(explicar|describir|comentar|anotar)\b',
                r'\b(ayuda|help|tutorial|ejemplo)\b'
            ],
            ContextType.DEPLOYMENT: [
                r'\b(deploy|desplegar|publicar|subir|producción)\b',
                r'\b(servidor|server|hosting|cloud)\b',
                r'\b(build|compilar|empaquetar)\b'
            ]
        }
        
        # Calcular scores para cada tipo
        type_scores = {}
        for context_type, pattern_list in patterns.items():
            score = 0
            for pattern in pattern_list:
                matches = len(re.findall(pattern, command))
                score += matches
            type_scores[context_type] = score
        
        # Retornar el tipo con mayor score
        if max(type_scores.values()) > 0:
            return max(type_scores, key=type_scores.get)
        
        # Default a desarrollo si no hay matches claros
        return ContextType.DEVELOPMENT
    
    def _find_matching_patterns(self, command: str, context_type: ContextType) -> List[ContextPattern]:
        """Encuentra patrones que coinciden con el comando"""
        
        matching_patterns = []
        
        for pattern in self.context_patterns.values():
            if pattern.pattern_type != context_type:
                continue
            
            # Verificar si algún trigger coincide
            pattern_score = 0
            for trigger in pattern.triggers:
                if re.search(trigger, command, re.IGNORECASE):
                    pattern_score += 1
            
            if pattern_score > 0:
                # Actualizar estadísticas del patrón
                pattern.usage_count += 1
                pattern.last_used = datetime.now()
                matching_patterns.append(pattern)
        
        # Ordenar por tasa de éxito y uso reciente
        matching_patterns.sort(
            key=lambda p: (p.success_rate, p.usage_count, -((datetime.now() - p.last_used).total_seconds())),
            reverse=True
        )
        
        return matching_patterns[:5]  # Máximo 5 patrones más relevantes
    
    def _generate_context_data(self, command: str, context_type: ContextType, 
                             patterns: List[ContextPattern], user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Genera datos de contexto específicos"""
        
        context_data = {
            "command": command,
            "context_type": context_type.value,
            "timestamp": datetime.now().isoformat(),
            "patterns_applied": [p.pattern_id for p in patterns],
            "user_context": user_context or {}
        }
        
        # Agregar contexto específico por tipo
        if context_type == ContextType.DEVELOPMENT:
            context_data.update(self._generate_development_context(command, patterns))
        elif context_type == ContextType.DEBUGGING:
            context_data.update(self._generate_debugging_context(command, patterns))
        elif context_type == ContextType.OPTIMIZATION:
            context_data.update(self._generate_optimization_context(command, patterns))
        elif context_type == ContextType.TESTING:
            context_data.update(self._generate_testing_context(command, patterns))
        elif context_type == ContextType.DOCUMENTATION:
            context_data.update(self._generate_documentation_context(command, patterns))
        
        return context_data
    
    def _generate_development_context(self, command: str, patterns: List[ContextPattern]) -> Dict[str, Any]:
        """Genera contexto específico para desarrollo"""
        
        # Detectar tecnologías mencionadas
        technologies = []
        tech_patterns = {
            "react": r'\b(react|jsx|component|hook|state)\b',
            "fastapi": r'\b(fastapi|api|endpoint|router|pydantic)\b',
            "postgresql": r'\b(postgres|postgresql|database|db|sql)\b',
            "tailwind": r'\b(tailwind|css|style|design)\b'
        }
        
        for tech, pattern in tech_patterns.items():
            if re.search(pattern, command, re.IGNORECASE):
                technologies.append(tech)
        
        # Detectar tipo de componente/funcionalidad
        component_type = "general"
        if re.search(r'\b(login|auth|autenticación)\b', command, re.IGNORECASE):
            component_type = "authentication"
        elif re.search(r'\b(dashboard|panel|admin)\b', command, re.IGNORECASE):
            component_type = "dashboard"
        elif re.search(r'\b(form|formulario|input)\b', command, re.IGNORECASE):
            component_type = "form"
        elif re.search(r'\b(api|endpoint|service)\b', command, re.IGNORECASE):
            component_type = "api"
        
        return {
            "development_type": "feature_creation",
            "technologies_involved": technologies,
            "component_type": component_type,
            "estimated_complexity": self._estimate_complexity(command, patterns),
            "suggested_approach": self._suggest_development_approach(component_type, technologies),
            "required_files": self._identify_required_files(component_type, technologies),
            "dependencies": self._identify_dependencies(technologies)
        }
    
    def _generate_debugging_context(self, command: str, patterns: List[ContextPattern]) -> Dict[str, Any]:
        """Genera contexto específico para debugging"""
        
        # Detectar tipo de error
        error_type = "general"
        if re.search(r'\b(404|not found|no encontrado)\b', command, re.IGNORECASE):
            error_type = "not_found"
        elif re.search(r'\b(500|server error|error servidor)\b', command, re.IGNORECASE):
            error_type = "server_error"
        elif re.search(r'\b(auth|authentication|login)\b', command, re.IGNORECASE):
            error_type = "authentication"
        elif re.search(r'\b(database|db|sql)\b', command, re.IGNORECASE):
            error_type = "database"
        
        return {
            "debugging_type": "error_resolution",
            "error_category": error_type,
            "urgency_level": self._assess_urgency(command),
            "diagnostic_steps": self._generate_diagnostic_steps(error_type),
            "common_solutions": self._get_common_solutions(error_type),
            "tools_needed": self._get_debugging_tools(error_type)
        }
    
    def _create_execution_plan(self, command: str, context_type: ContextType, 
                             context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crea un plan de ejecución detallado"""
        
        # Generar pasos basados en el tipo de contexto
        steps = []
        estimated_time = 0
        
        if context_type == ContextType.DEVELOPMENT:
            steps = self._generate_development_steps(context_data)
            estimated_time = len(steps) * 5  # 5 minutos por paso promedio
        elif context_type == ContextType.DEBUGGING:
            steps = self._generate_debugging_steps(context_data)
            estimated_time = len(steps) * 3  # 3 minutos por paso promedio
        elif context_type == ContextType.OPTIMIZATION:
            steps = self._generate_optimization_steps(context_data)
            estimated_time = len(steps) * 4  # 4 minutos por paso promedio
        
        return {
            "execution_steps": steps,
            "estimated_duration_minutes": estimated_time,
            "parallel_tasks": self._identify_parallel_tasks(steps),
            "critical_path": self._identify_step_dependencies(steps),
            "success_criteria": self._define_success_criteria(context_type, context_data),
            "rollback_plan": self._create_rollback_plan(steps)
        }
    
    def _estimate_resources(self, execution_plan: Dict[str, Any], patterns: List[ContextPattern]) -> Dict[str, Any]:
        """Estima recursos necesarios para la ejecución"""
        
        # Calcular tokens estimados basado en patrones
        estimated_tokens = 0
        for pattern in patterns:
            estimated_tokens += pattern.estimated_tokens
        
        # Ajustar basado en complejidad del plan
        complexity_multiplier = len(execution_plan["execution_steps"]) / 5
        estimated_tokens = int(estimated_tokens * complexity_multiplier)
        
        return {
            "estimated_tokens": estimated_tokens,
            "estimated_time_minutes": execution_plan["estimated_duration_minutes"],
            "tools_required": self._extract_tools_from_plan(execution_plan),
            "context_files_needed": self._identify_context_files(execution_plan),
            "memory_usage_mb": self._estimate_memory_usage(execution_plan),
            "confidence_level": self._calculate_confidence_level(patterns)
        }
    
    def _create_context_snapshot(self, context_type: ContextType, patterns: List[ContextPattern], 
                               context_data: Dict[str, Any]) -> ContextSnapshot:
        """Crea un snapshot del contexto procesado"""
        
        snapshot_id = f"ctx_{context_type.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Calcular score de confianza
        confidence_score = 0.0
        if patterns:
            confidence_score = sum(p.success_rate for p in patterns) / len(patterns)
        
        # Metadatos de procesamiento
        processing_metadata = {
            "patterns_count": len(patterns),
            "processing_timestamp": datetime.now().isoformat(),
            "context_complexity": self._calculate_context_complexity(context_data),
            "optimization_applied": True
        }
        
        return ContextSnapshot(
            snapshot_id=snapshot_id,
            context_type=context_type,
            active_patterns=[p.pattern_id for p in patterns],
            context_data=context_data,
            processing_metadata=processing_metadata,
            confidence_score=confidence_score,
            created_at=datetime.now()
        )
    
    def _initialize_default_patterns(self):
        """Inicializa patrones de contexto por defecto"""
        
        default_patterns = [
            # Patrones de desarrollo
            ContextPattern(
                pattern_id="dev_react_component",
                pattern_type=ContextType.DEVELOPMENT,
                triggers=["crear componente", "nuevo componente", "component"],
                context_requirements=["project_structure", "react_patterns", "styling_guide"],
                estimated_tokens=400,
                success_rate=0.85,
                last_used=datetime.now(),
                usage_count=0
            ),
            ContextPattern(
                pattern_id="dev_api_endpoint",
                pattern_type=ContextType.DEVELOPMENT,
                triggers=["crear api", "nuevo endpoint", "fastapi"],
                context_requirements=["api_structure", "database_models", "authentication"],
                estimated_tokens=350,
                success_rate=0.80,
                last_used=datetime.now(),
                usage_count=0
            ),
            # Patrones de debugging
            ContextPattern(
                pattern_id="debug_auth_error",
                pattern_type=ContextType.DEBUGGING,
                triggers=["error login", "authentication", "no funciona login"],
                context_requirements=["auth_flow", "jwt_config", "user_model"],
                estimated_tokens=300,
                success_rate=0.90,
                last_used=datetime.now(),
                usage_count=0
            ),
            # Patrones de optimización
            ContextPattern(
                pattern_id="opt_performance",
                pattern_type=ContextType.OPTIMIZATION,
                triggers=["optimizar", "lento", "performance", "rendimiento"],
                context_requirements=["performance_metrics", "bottlenecks", "optimization_techniques"],
                estimated_tokens=450,
                success_rate=0.75,
                last_used=datetime.now(),
                usage_count=0
            )
        ]
        
        for pattern in default_patterns:
            if pattern.pattern_id not in self.context_patterns:
                self.context_patterns[pattern.pattern_id] = pattern
    
    def _load_context_patterns(self):
        """Carga patrones de contexto desde archivo"""
        if not self.patterns_file.exists():
            return
        
        try:
            with open(self.patterns_file, 'r', encoding='utf-8') as f:
                patterns_data = json.load(f)
            
            for pattern_id, pattern_data in patterns_data.items():
                pattern = ContextPattern(
                    pattern_id=pattern_data["pattern_id"],
                    pattern_type=ContextType(pattern_data["pattern_type"]),
                    triggers=pattern_data["triggers"],
                    context_requirements=pattern_data["context_requirements"],
                    estimated_tokens=pattern_data["estimated_tokens"],
                    success_rate=pattern_data["success_rate"],
                    last_used=datetime.fromisoformat(pattern_data["last_used"]),
                    usage_count=pattern_data["usage_count"]
                )
                self.context_patterns[pattern_id] = pattern
            
            self.logger.info(f"📚 Cargados {len(self.context_patterns)} patrones de contexto")
            
        except Exception as e:
            self.logger.error(f"Error cargando patrones: {e}")
    
    def _save_context_patterns(self):
        """Guarda patrones de contexto en archivo"""
        try:
            patterns_data = {}
            for pattern_id, pattern in self.context_patterns.items():
                patterns_data[pattern_id] = {
                    "pattern_id": pattern.pattern_id,
                    "pattern_type": pattern.pattern_type.value,
                    "triggers": pattern.triggers,
                    "context_requirements": pattern.context_requirements,
                    "estimated_tokens": pattern.estimated_tokens,
                    "success_rate": pattern.success_rate,
                    "last_used": pattern.last_used.isoformat(),
                    "usage_count": pattern.usage_count
                }
            
            with open(self.patterns_file, 'w', encoding='utf-8') as f:
                json.dump(patterns_data, f, indent=2, ensure_ascii=False)
            
        except Exception as e:
            self.logger.error(f"Error guardando patrones: {e}")
    
    def _update_processing_metrics(self, processing_time: float, patterns_matched: int):
        """Actualiza métricas de procesamiento"""
        self.processing_metrics["contexts_processed"] += 1
        self.processing_metrics["patterns_matched"] += patterns_matched
        
        # Actualizar tiempo promedio de procesamiento
        current_avg = self.processing_metrics["average_processing_time"]
        total_processed = self.processing_metrics["contexts_processed"]
        
        self.processing_metrics["average_processing_time"] = (
            (current_avg * (total_processed - 1) + processing_time) / total_processed
        )
    
    # Métodos auxiliares simplificados para mantener el archivo manejable
    def _estimate_complexity(self, command: str, patterns: List[ContextPattern]) -> str:
        """Estima la complejidad de la tarea"""
        complexity_indicators = len(re.findall(r'\b(complejo|avanzado|integración|múltiple)\b', command, re.IGNORECASE))
        if complexity_indicators > 2 or len(patterns) > 3:
            return "high"
        elif complexity_indicators > 0 or len(patterns) > 1:
            return "medium"
        return "low"
    
    def _generate_recommendations(self, context_type: ContextType, patterns: List[ContextPattern]) -> List[str]:
        """Genera recomendaciones basadas en el contexto"""
        recommendations = []
        
        if context_type == ContextType.DEVELOPMENT:
            recommendations.extend([
                "Seguir patrones de diseño establecidos",
                "Implementar tests unitarios",
                "Documentar funcionalidad nueva"
            ])
        elif context_type == ContextType.DEBUGGING:
            recommendations.extend([
                "Revisar logs del sistema",
                "Verificar configuración",
                "Probar en entorno aislado"
            ])
        
        return recommendations
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de procesamiento"""
        return {
            "processing_metrics": self.processing_metrics,
            "active_patterns": len(self.context_patterns),
            "context_history_size": len(self.context_history),
            "most_used_patterns": self._get_most_used_patterns(5),
            "success_rates": self._calculate_pattern_success_rates()
        }
    
    def _get_most_used_patterns(self, limit: int) -> List[Dict[str, Any]]:
        """Obtiene los patrones más utilizados"""
        sorted_patterns = sorted(
            self.context_patterns.values(),
            key=lambda p: p.usage_count,
            reverse=True
        )
        
        return [
            {
                "pattern_id": p.pattern_id,
                "usage_count": p.usage_count,
                "success_rate": p.success_rate,
                "context_type": p.pattern_type.value
            }
            for p in sorted_patterns[:limit]
        ]
    
    def _calculate_pattern_success_rates(self) -> Dict[str, float]:
        """Calcula tasas de éxito por tipo de contexto"""
        success_rates = {}
        
        for context_type in ContextType:
            patterns = [p for p in self.context_patterns.values() if p.pattern_type == context_type]
            if patterns:
                avg_success = sum(p.success_rate for p in patterns) / len(patterns)
                success_rates[context_type.value] = avg_success
        
        return success_rates

def main():
    """Función principal para testing"""
    processor = ContextProcessor()
    
    # Pruebas de procesamiento
    test_commands = [
        "crear un componente de login para React",
        "hay un error en la autenticación de usuarios",
        "optimizar el rendimiento del dashboard",
        "probar la API de órdenes de trabajo"
    ]
    
    for command in test_commands:
        print(f"\n🔍 Procesando: {command}")
        result = processor.process_natural_command(command)
        print(f"✅ Tipo: {result.get('context_type')}, Confianza: {result.get('confidence_score', 0):.2f}")
    
    # Mostrar estadísticas
    stats = processor.get_processing_stats()
    print(f"\n📊 Estadísticas:")
    print(json.dumps(stats, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()