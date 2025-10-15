#!/usr/bin/env python3
"""
NEXUS Continuous Improvement System - Sistema de Mejora Continua
Analiza métricas, detecta patrones y aplica optimizaciones automáticas
"""

import asyncio
import json
import time
import sqlite3
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any, Tuple, Set
from pathlib import Path
import logging
from collections import defaultdict, Counter
import statistics
import threading
from concurrent.futures import ThreadPoolExecutor
import pickle
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ImprovementOpportunity:
    """Oportunidad de mejora identificada"""
    id: str
    category: str
    description: str
    impact_score: float
    effort_score: float
    priority: str
    suggested_actions: List[str]
    metrics_affected: List[str]
    confidence: float
    timestamp: datetime

@dataclass
class OptimizationResult:
    """Resultado de una optimización aplicada"""
    optimization_id: str
    category: str
    actions_taken: List[str]
    metrics_before: Dict[str, float]
    metrics_after: Dict[str, float]
    improvement_percentage: float
    success: bool
    timestamp: datetime
    duration: float

@dataclass
class UserPattern:
    """Patrón de uso del usuario detectado"""
    pattern_id: str
    pattern_type: str
    frequency: int
    avg_tokens: float
    avg_execution_time: float
    success_rate: float
    preferred_context: str
    time_of_day_preference: List[int]
    command_patterns: List[str]
    confidence: float

@dataclass
class SystemInsight:
    """Insight del sistema basado en análisis de datos"""
    insight_id: str
    category: str
    title: str
    description: str
    supporting_data: Dict[str, Any]
    actionable: bool
    priority: str
    timestamp: datetime

class ContinuousImprovementEngine:
    """
    Motor de mejora continua para NEXUS
    """
    
    def __init__(self, metrics_db_path: str = ".trae/metrics/nexus_metrics.db"):
        self.metrics_db_path = Path(metrics_db_path)
        self.improvement_db_path = Path(".trae/metrics/improvements.db")
        self.models_path = Path(".trae/metrics/ml_models")
        
        # Crear directorios necesarios
        self.improvement_db_path.parent.mkdir(parents=True, exist_ok=True)
        self.models_path.mkdir(parents=True, exist_ok=True)
        
        # Estado del motor
        self.is_running = False
        self.analysis_interval = 3600  # 1 hora
        self.optimization_interval = 21600  # 6 horas
        
        # Modelos ML para análisis
        self.user_pattern_model = None
        self.performance_predictor = None
        self.anomaly_detector = None
        
        # Cache de patrones y insights
        self.user_patterns_cache = {}
        self.system_insights_cache = []
        self.optimization_history = []
        
        # Thread pool para operaciones asíncronas
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Inicializar base de datos
        self._init_improvement_database()
        
        # Cargar modelos existentes
        self._load_ml_models()
        
        logger.info("ContinuousImprovementEngine inicializado correctamente")
    
    def _init_improvement_database(self):
        """Inicializa la base de datos de mejoras"""
        try:
            with sqlite3.connect(self.improvement_db_path) as conn:
                conn.executescript("""
                    CREATE TABLE IF NOT EXISTS improvement_opportunities (
                        id TEXT PRIMARY KEY,
                        category TEXT NOT NULL,
                        description TEXT NOT NULL,
                        impact_score REAL,
                        effort_score REAL,
                        priority TEXT,
                        suggested_actions TEXT,
                        metrics_affected TEXT,
                        confidence REAL,
                        timestamp TEXT NOT NULL,
                        status TEXT DEFAULT 'identified'
                    );
                    
                    CREATE TABLE IF NOT EXISTS optimization_results (
                        id TEXT PRIMARY KEY,
                        optimization_id TEXT,
                        category TEXT,
                        actions_taken TEXT,
                        metrics_before TEXT,
                        metrics_after TEXT,
                        improvement_percentage REAL,
                        success BOOLEAN,
                        timestamp TEXT NOT NULL,
                        duration REAL
                    );
                    
                    CREATE TABLE IF NOT EXISTS user_patterns (
                        id TEXT PRIMARY KEY,
                        pattern_type TEXT,
                        frequency INTEGER,
                        avg_tokens REAL,
                        avg_execution_time REAL,
                        success_rate REAL,
                        preferred_context TEXT,
                        time_preferences TEXT,
                        command_patterns TEXT,
                        confidence REAL,
                        last_updated TEXT
                    );
                    
                    CREATE TABLE IF NOT EXISTS system_insights (
                        id TEXT PRIMARY KEY,
                        category TEXT,
                        title TEXT,
                        description TEXT,
                        supporting_data TEXT,
                        actionable BOOLEAN,
                        priority TEXT,
                        timestamp TEXT NOT NULL,
                        status TEXT DEFAULT 'active'
                    );
                    
                    CREATE INDEX IF NOT EXISTS idx_opportunities_priority 
                    ON improvement_opportunities(priority, timestamp);
                    
                    CREATE INDEX IF NOT EXISTS idx_results_timestamp 
                    ON optimization_results(timestamp);
                """)
            logger.info("Base de datos de mejoras inicializada")
        except Exception as e:
            logger.error(f"Error inicializando base de datos de mejoras: {e}")
    
    def start_continuous_improvement(self):
        """Inicia el motor de mejora continua"""
        if self.is_running:
            logger.warning("El motor de mejora continua ya está ejecutándose")
            return
        
        self.is_running = True
        
        # Iniciar threads de análisis y optimización
        threading.Thread(target=self._analysis_loop, daemon=True).start()
        threading.Thread(target=self._optimization_loop, daemon=True).start()
        threading.Thread(target=self._pattern_learning_loop, daemon=True).start()
        
        logger.info("Motor de mejora continua iniciado")
    
    def stop_continuous_improvement(self):
        """Detiene el motor de mejora continua"""
        self.is_running = False
        logger.info("Motor de mejora continua detenido")
    
    def _analysis_loop(self):
        """Loop principal de análisis de métricas"""
        while self.is_running:
            try:
                logger.info("Iniciando análisis de mejora continua...")
                
                # Analizar métricas recientes
                opportunities = self._analyze_improvement_opportunities()
                
                # Generar insights del sistema
                insights = self._generate_system_insights()
                
                # Detectar patrones de usuario
                patterns = self._detect_user_patterns()
                
                # Almacenar resultados
                self._store_opportunities(opportunities)
                self._store_insights(insights)
                self._store_user_patterns(patterns)
                
                logger.info(f"Análisis completado: {len(opportunities)} oportunidades, {len(insights)} insights")
                
                time.sleep(self.analysis_interval)
            except Exception as e:
                logger.error(f"Error en loop de análisis: {e}")
                time.sleep(300)  # Esperar 5 minutos antes de reintentar
    
    def _optimization_loop(self):
        """Loop de aplicación de optimizaciones"""
        while self.is_running:
            try:
                # Esperar antes del primer ciclo de optimización
                time.sleep(self.optimization_interval)
                
                logger.info("Iniciando ciclo de optimización automática...")
                
                # Obtener oportunidades de alta prioridad
                high_priority_opportunities = self._get_high_priority_opportunities()
                
                # Aplicar optimizaciones automáticas
                for opportunity in high_priority_opportunities:
                    if self._should_auto_optimize(opportunity):
                        result = self._apply_optimization(opportunity)
                        self._store_optimization_result(result)
                        
                        if result.success:
                            logger.info(f"Optimización exitosa: {opportunity.description}")
                        else:
                            logger.warning(f"Optimización fallida: {opportunity.description}")
                
                logger.info("Ciclo de optimización completado")
                
            except Exception as e:
                logger.error(f"Error en loop de optimización: {e}")
                time.sleep(600)  # Esperar 10 minutos antes de reintentar
    
    def _pattern_learning_loop(self):
        """Loop de aprendizaje de patrones"""
        while self.is_running:
            try:
                # Entrenar modelos cada 4 horas
                time.sleep(14400)
                
                logger.info("Iniciando entrenamiento de modelos ML...")
                
                # Entrenar modelo de patrones de usuario
                self._train_user_pattern_model()
                
                # Entrenar predictor de rendimiento
                self._train_performance_predictor()
                
                # Entrenar detector de anomalías
                self._train_anomaly_detector()
                
                # Guardar modelos actualizados
                self._save_ml_models()
                
                logger.info("Entrenamiento de modelos completado")
                
            except Exception as e:
                logger.error(f"Error en loop de aprendizaje: {e}")
                time.sleep(1800)  # Esperar 30 minutos antes de reintentar
    
    def _analyze_improvement_opportunities(self) -> List[ImprovementOpportunity]:
        """Analiza métricas para identificar oportunidades de mejora"""
        opportunities = []
        
        try:
            # Obtener métricas recientes
            metrics_data = self._get_recent_metrics(hours=24)
            
            if not metrics_data:
                return opportunities
            
            # Analizar diferentes aspectos
            opportunities.extend(self._analyze_performance_opportunities(metrics_data))
            opportunities.extend(self._analyze_efficiency_opportunities(metrics_data))
            opportunities.extend(self._analyze_reliability_opportunities(metrics_data))
            opportunities.extend(self._analyze_user_experience_opportunities(metrics_data))
            
            # Priorizar oportunidades
            opportunities = self._prioritize_opportunities(opportunities)
            
        except Exception as e:
            logger.error(f"Error analizando oportunidades de mejora: {e}")
        
        return opportunities
    
    def _analyze_performance_opportunities(self, metrics_data: Dict) -> List[ImprovementOpportunity]:
        """Analiza oportunidades de mejora de rendimiento"""
        opportunities = []
        
        try:
            perf_data = metrics_data.get('performance', [])
            if not perf_data:
                return opportunities
            
            # Analizar CPU
            cpu_values = [row[2] for row in perf_data if row[2] is not None]  # cpu_percent column
            if cpu_values:
                avg_cpu = statistics.mean(cpu_values)
                max_cpu = max(cpu_values)
                
                if avg_cpu > 70:
                    opportunities.append(ImprovementOpportunity(
                        id=f"perf_cpu_{int(time.time())}",
                        category="performance",
                        description=f"CPU promedio alto ({avg_cpu:.1f}%) - Optimizar procesos",
                        impact_score=0.8,
                        effort_score=0.6,
                        priority="high",
                        suggested_actions=[
                            "Optimizar algoritmos de procesamiento",
                            "Implementar caché más agresivo",
                            "Reducir operaciones síncronas"
                        ],
                        metrics_affected=["cpu_percent", "response_time"],
                        confidence=0.85,
                        timestamp=datetime.now()
                    ))
                
                if max_cpu > 90:
                    opportunities.append(ImprovementOpportunity(
                        id=f"perf_cpu_spike_{int(time.time())}",
                        category="performance",
                        description=f"Picos de CPU críticos ({max_cpu:.1f}%) detectados",
                        impact_score=0.9,
                        effort_score=0.7,
                        priority="critical",
                        suggested_actions=[
                            "Identificar procesos que causan picos",
                            "Implementar throttling",
                            "Optimizar operaciones costosas"
                        ],
                        metrics_affected=["cpu_percent", "response_time", "user_satisfaction"],
                        confidence=0.9,
                        timestamp=datetime.now()
                    ))
            
            # Analizar memoria
            memory_values = [row[3] for row in perf_data if row[3] is not None]  # memory_percent column
            if memory_values:
                avg_memory = statistics.mean(memory_values)
                
                if avg_memory > 80:
                    opportunities.append(ImprovementOpportunity(
                        id=f"perf_memory_{int(time.time())}",
                        category="performance",
                        description=f"Uso de memoria alto ({avg_memory:.1f}%) - Optimizar gestión de memoria",
                        impact_score=0.7,
                        effort_score=0.5,
                        priority="medium",
                        suggested_actions=[
                            "Implementar limpieza automática de caché",
                            "Optimizar estructuras de datos",
                            "Reducir contexto cargado simultáneamente"
                        ],
                        metrics_affected=["memory_percent", "response_time"],
                        confidence=0.8,
                        timestamp=datetime.now()
                    ))
            
            # Analizar tiempo de respuesta
            response_times = [row[9] for row in perf_data if row[9] is not None]  # response_time column
            if response_times:
                avg_response = statistics.mean(response_times)
                
                if avg_response > 30:
                    opportunities.append(ImprovementOpportunity(
                        id=f"perf_response_{int(time.time())}",
                        category="performance",
                        description=f"Tiempo de respuesta lento ({avg_response:.1f}s) - Optimizar velocidad",
                        impact_score=0.9,
                        effort_score=0.6,
                        priority="high",
                        suggested_actions=[
                            "Optimizar carga de contexto",
                            "Implementar procesamiento paralelo",
                            "Mejorar algoritmos de búsqueda"
                        ],
                        metrics_affected=["response_time", "user_satisfaction"],
                        confidence=0.85,
                        timestamp=datetime.now()
                    ))
        
        except Exception as e:
            logger.error(f"Error analizando oportunidades de rendimiento: {e}")
        
        return opportunities
    
    def _analyze_efficiency_opportunities(self, metrics_data: Dict) -> List[ImprovementOpportunity]:
        """Analiza oportunidades de mejora de eficiencia"""
        opportunities = []
        
        try:
            interaction_data = metrics_data.get('interactions', [])
            if not interaction_data:
                return opportunities
            
            # Analizar uso de tokens
            token_values = [row[5] for row in interaction_data if row[5] is not None]  # tokens_used column
            if token_values:
                avg_tokens = statistics.mean(token_values)
                max_tokens = max(token_values)
                
                if avg_tokens > 600:
                    opportunities.append(ImprovementOpportunity(
                        id=f"eff_tokens_{int(time.time())}",
                        category="efficiency",
                        description=f"Uso promedio de tokens alto ({avg_tokens:.0f}) - Optimizar contexto",
                        impact_score=0.8,
                        effort_score=0.4,
                        priority="high",
                        suggested_actions=[
                            "Implementar carga selectiva de contexto",
                            "Mejorar algoritmos de compresión",
                            "Optimizar patrones de respuesta"
                        ],
                        metrics_affected=["tokens_used", "response_time", "cost_efficiency"],
                        confidence=0.9,
                        timestamp=datetime.now()
                    ))
                
                if max_tokens > 1200:
                    opportunities.append(ImprovementOpportunity(
                        id=f"eff_tokens_spike_{int(time.time())}",
                        category="efficiency",
                        description=f"Picos de tokens excesivos ({max_tokens}) detectados",
                        impact_score=0.7,
                        effort_score=0.5,
                        priority="medium",
                        suggested_actions=[
                            "Identificar comandos que generan picos",
                            "Implementar límites adaptativos",
                            "Mejorar detección de contexto necesario"
                        ],
                        metrics_affected=["tokens_used", "cost_efficiency"],
                        confidence=0.8,
                        timestamp=datetime.now()
                    ))
            
            # Analizar tasa de caché
            cache_rates = [row[10] for row in metrics_data.get('performance', []) if row[10] is not None]
            if cache_rates:
                avg_cache_rate = statistics.mean(cache_rates)
                
                if avg_cache_rate < 0.7:
                    opportunities.append(ImprovementOpportunity(
                        id=f"eff_cache_{int(time.time())}",
                        category="efficiency",
                        description=f"Tasa de acierto de caché baja ({avg_cache_rate:.1%}) - Mejorar estrategia de caché",
                        impact_score=0.6,
                        effort_score=0.3,
                        priority="medium",
                        suggested_actions=[
                            "Analizar patrones de acceso a contexto",
                            "Implementar caché predictivo",
                            "Optimizar algoritmos de invalidación"
                        ],
                        metrics_affected=["cache_hit_rate", "response_time", "tokens_used"],
                        confidence=0.75,
                        timestamp=datetime.now()
                    ))
        
        except Exception as e:
            logger.error(f"Error analizando oportunidades de eficiencia: {e}")
        
        return opportunities
    
    def _analyze_reliability_opportunities(self, metrics_data: Dict) -> List[ImprovementOpportunity]:
        """Analiza oportunidades de mejora de confiabilidad"""
        opportunities = []
        
        try:
            interaction_data = metrics_data.get('interactions', [])
            if not interaction_data:
                return opportunities
            
            # Analizar tasa de éxito
            success_values = [row[6] for row in interaction_data if row[6] is not None]  # success column
            if success_values:
                success_rate = sum(success_values) / len(success_values)
                
                if success_rate < 0.85:
                    opportunities.append(ImprovementOpportunity(
                        id=f"rel_success_{int(time.time())}",
                        category="reliability",
                        description=f"Tasa de éxito baja ({success_rate:.1%}) - Mejorar manejo de errores",
                        impact_score=0.9,
                        effort_score=0.6,
                        priority="high",
                        suggested_actions=[
                            "Mejorar validación de entrada",
                            "Implementar recuperación automática de errores",
                            "Optimizar manejo de casos edge"
                        ],
                        metrics_affected=["success_rate", "user_satisfaction", "reliability_score"],
                        confidence=0.85,
                        timestamp=datetime.now()
                    ))
            
            # Analizar errores encontrados
            error_values = [row[10] for row in interaction_data if row[10] is not None]  # errors_encountered
            if error_values:
                avg_errors = statistics.mean(error_values)
                
                if avg_errors > 1:
                    opportunities.append(ImprovementOpportunity(
                        id=f"rel_errors_{int(time.time())}",
                        category="reliability",
                        description=f"Promedio de errores alto ({avg_errors:.1f}) - Reducir errores",
                        impact_score=0.8,
                        effort_score=0.5,
                        priority="medium",
                        suggested_actions=[
                            "Implementar validación proactiva",
                            "Mejorar mensajes de error",
                            "Crear base de conocimiento de errores comunes"
                        ],
                        metrics_affected=["errors_encountered", "success_rate", "user_satisfaction"],
                        confidence=0.8,
                        timestamp=datetime.now()
                    ))
        
        except Exception as e:
            logger.error(f"Error analizando oportunidades de confiabilidad: {e}")
        
        return opportunities
    
    def _analyze_user_experience_opportunities(self, metrics_data: Dict) -> List[ImprovementOpportunity]:
        """Analiza oportunidades de mejora de experiencia de usuario"""
        opportunities = []
        
        try:
            interaction_data = metrics_data.get('interactions', [])
            if not interaction_data:
                return opportunities
            
            # Analizar satisfacción inferida del usuario
            satisfaction_values = [row[7] for row in interaction_data if row[7] is not None]
            if satisfaction_values:
                avg_satisfaction = statistics.mean(satisfaction_values)
                
                if avg_satisfaction < 0.7:
                    opportunities.append(ImprovementOpportunity(
                        id=f"ux_satisfaction_{int(time.time())}",
                        category="user_experience",
                        description=f"Satisfacción del usuario baja ({avg_satisfaction:.1%}) - Mejorar UX",
                        impact_score=0.9,
                        effort_score=0.7,
                        priority="high",
                        suggested_actions=[
                            "Reducir tiempos de respuesta",
                            "Mejorar calidad de respuestas",
                            "Implementar feedback más claro",
                            "Optimizar flujos de comandos naturales"
                        ],
                        metrics_affected=["user_satisfaction", "response_time", "success_rate"],
                        confidence=0.8,
                        timestamp=datetime.now()
                    ))
            
            # Analizar tiempo de ejecución
            execution_times = [row[4] for row in interaction_data if row[4] is not None]
            if execution_times:
                avg_execution = statistics.mean(execution_times)
                
                if avg_execution > 45:
                    opportunities.append(ImprovementOpportunity(
                        id=f"ux_execution_{int(time.time())}",
                        category="user_experience",
                        description=f"Tiempo de ejecución lento ({avg_execution:.1f}s) - Mejorar velocidad percibida",
                        impact_score=0.7,
                        effort_score=0.5,
                        priority="medium",
                        suggested_actions=[
                            "Implementar indicadores de progreso",
                            "Optimizar operaciones críticas",
                            "Proporcionar feedback intermedio"
                        ],
                        metrics_affected=["execution_time", "user_satisfaction"],
                        confidence=0.75,
                        timestamp=datetime.now()
                    ))
        
        except Exception as e:
            logger.error(f"Error analizando oportunidades de UX: {e}")
        
        return opportunities
    
    def _prioritize_opportunities(self, opportunities: List[ImprovementOpportunity]) -> List[ImprovementOpportunity]:
        """Prioriza oportunidades basado en impacto, esfuerzo y confianza"""
        try:
            def priority_score(opp):
                # Score = (impacto * confianza) / esfuerzo
                return (opp.impact_score * opp.confidence) / max(opp.effort_score, 0.1)
            
            # Ordenar por score de prioridad
            opportunities.sort(key=priority_score, reverse=True)
            
            # Asignar prioridades textuales basadas en score
            for i, opp in enumerate(opportunities):
                score = priority_score(opp)
                if score > 1.0:
                    opp.priority = "critical"
                elif score > 0.7:
                    opp.priority = "high"
                elif score > 0.4:
                    opp.priority = "medium"
                else:
                    opp.priority = "low"
        
        except Exception as e:
            logger.error(f"Error priorizando oportunidades: {e}")
        
        return opportunities
    
    def _generate_system_insights(self) -> List[SystemInsight]:
        """Genera insights del sistema basados en análisis de datos"""
        insights = []
        
        try:
            # Obtener datos históricos
            historical_data = self._get_recent_metrics(hours=168)  # 1 semana
            
            if not historical_data:
                return insights
            
            # Generar insights de tendencias
            insights.extend(self._generate_trend_insights(historical_data))
            
            # Generar insights de patrones
            insights.extend(self._generate_pattern_insights(historical_data))
            
            # Generar insights de anomalías
            insights.extend(self._generate_anomaly_insights(historical_data))
            
        except Exception as e:
            logger.error(f"Error generando insights del sistema: {e}")
        
        return insights
    
    def _generate_trend_insights(self, data: Dict) -> List[SystemInsight]:
        """Genera insights basados en tendencias"""
        insights = []
        
        try:
            perf_data = data.get('performance', [])
            if len(perf_data) < 10:
                return insights
            
            # Analizar tendencia de tiempo de respuesta
            response_times = [(datetime.fromisoformat(row[1]), row[9]) for row in perf_data if row[9] is not None]
            if len(response_times) >= 10:
                # Dividir en dos mitades para comparar tendencia
                mid_point = len(response_times) // 2
                first_half = [rt[1] for rt in response_times[:mid_point]]
                second_half = [rt[1] for rt in response_times[mid_point:]]
                
                avg_first = statistics.mean(first_half)
                avg_second = statistics.mean(second_half)
                
                change_percent = ((avg_second - avg_first) / avg_first) * 100
                
                if abs(change_percent) > 10:
                    trend_direction = "mejorando" if change_percent < 0 else "empeorando"
                    insights.append(SystemInsight(
                        insight_id=f"trend_response_{int(time.time())}",
                        category="performance_trend",
                        title=f"Tendencia de tiempo de respuesta {trend_direction}",
                        description=f"El tiempo de respuesta promedio ha cambiado {change_percent:+.1f}% en la última semana",
                        supporting_data={
                            "avg_first_half": avg_first,
                            "avg_second_half": avg_second,
                            "change_percent": change_percent,
                            "data_points": len(response_times)
                        },
                        actionable=abs(change_percent) > 20,
                        priority="high" if abs(change_percent) > 20 else "medium",
                        timestamp=datetime.now()
                    ))
        
        except Exception as e:
            logger.error(f"Error generando insights de tendencias: {e}")
        
        return insights
    
    def _detect_user_patterns(self) -> List[UserPattern]:
        """Detecta patrones de uso del usuario"""
        patterns = []
        
        try:
            # Obtener datos de interacciones recientes
            interaction_data = self._get_recent_interactions(hours=168)  # 1 semana
            
            if not interaction_data:
                return patterns
            
            # Agrupar por tipo de comando
            command_groups = defaultdict(list)
            for interaction in interaction_data:
                command_type = interaction[2]  # command_type column
                command_groups[command_type].append(interaction)
            
            # Analizar cada grupo
            for command_type, interactions in command_groups.items():
                if len(interactions) >= 5:  # Mínimo 5 interacciones para considerar patrón
                    pattern = self._analyze_command_pattern(command_type, interactions)
                    if pattern:
                        patterns.append(pattern)
            
            # Detectar patrones temporales
            temporal_patterns = self._detect_temporal_patterns(interaction_data)
            patterns.extend(temporal_patterns)
        
        except Exception as e:
            logger.error(f"Error detectando patrones de usuario: {e}")
        
        return patterns
    
    def _analyze_command_pattern(self, command_type: str, interactions: List) -> Optional[UserPattern]:
        """Analiza patrón para un tipo específico de comando"""
        try:
            # Extraer métricas
            tokens_used = [i[5] for i in interactions if i[5] is not None]
            execution_times = [i[4] for i in interactions if i[4] is not None]
            success_flags = [i[6] for i in interactions if i[6] is not None]
            contexts = [i[8] for i in interactions if i[8] is not None]
            commands = [i[3] for i in interactions if i[3] is not None]
            
            if not tokens_used or not execution_times:
                return None
            
            # Calcular estadísticas
            avg_tokens = statistics.mean(tokens_used)
            avg_execution_time = statistics.mean(execution_times)
            success_rate = sum(success_flags) / len(success_flags) if success_flags else 0
            
            # Contexto más común
            context_counter = Counter(contexts)
            preferred_context = context_counter.most_common(1)[0][0] if context_counter else ""
            
            # Patrones de comandos
            command_patterns = list(set(commands[:10]))  # Top 10 comandos únicos
            
            # Calcular confianza basada en cantidad de datos
            confidence = min(1.0, len(interactions) / 20)  # Máxima confianza con 20+ interacciones
            
            return UserPattern(
                pattern_id=f"pattern_{command_type}_{int(time.time())}",
                pattern_type=command_type,
                frequency=len(interactions),
                avg_tokens=avg_tokens,
                avg_execution_time=avg_execution_time,
                success_rate=success_rate,
                preferred_context=preferred_context,
                time_of_day_preference=[],  # Se calculará en _detect_temporal_patterns
                command_patterns=command_patterns,
                confidence=confidence
            )
        
        except Exception as e:
            logger.error(f"Error analizando patrón de comando {command_type}: {e}")
            return None
    
    def _detect_temporal_patterns(self, interactions: List) -> List[UserPattern]:
        """Detecta patrones temporales de uso"""
        patterns = []
        
        try:
            # Extraer horas de uso
            hours_of_use = []
            for interaction in interactions:
                timestamp_str = interaction[1]  # timestamp column
                timestamp = datetime.fromisoformat(timestamp_str)
                hours_of_use.append(timestamp.hour)
            
            if not hours_of_use:
                return patterns
            
            # Contar frecuencia por hora
            hour_counter = Counter(hours_of_use)
            
            # Identificar horas pico (>= 20% del promedio)
            avg_usage = len(hours_of_use) / 24
            peak_hours = [hour for hour, count in hour_counter.items() if count >= avg_usage * 1.2]
            
            if peak_hours:
                patterns.append(UserPattern(
                    pattern_id=f"temporal_pattern_{int(time.time())}",
                    pattern_type="temporal_usage",
                    frequency=len(hours_of_use),
                    avg_tokens=0,  # No aplica para patrones temporales
                    avg_execution_time=0,  # No aplica para patrones temporales
                    success_rate=0,  # No aplica para patrones temporales
                    preferred_context="",
                    time_of_day_preference=sorted(peak_hours),
                    command_patterns=[],
                    confidence=min(1.0, len(hours_of_use) / 50)
                ))
        
        except Exception as e:
            logger.error(f"Error detectando patrones temporales: {e}")
        
        return patterns
    
    def _get_recent_metrics(self, hours: int = 24) -> Dict:
        """Obtiene métricas recientes de la base de datos"""
        try:
            if not self.metrics_db_path.exists():
                return {}
            
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=hours)
            
            with sqlite3.connect(self.metrics_db_path) as conn:
                # Métricas de rendimiento
                perf_data = conn.execute("""
                    SELECT * FROM performance_metrics 
                    WHERE timestamp >= ? AND timestamp <= ?
                    ORDER BY timestamp
                """, (start_time.isoformat(), end_time.isoformat())).fetchall()
                
                # Interacciones de usuario
                interaction_data = conn.execute("""
                    SELECT * FROM user_interactions 
                    WHERE timestamp >= ? AND timestamp <= ?
                    ORDER BY timestamp
                """, (start_time.isoformat(), end_time.isoformat())).fetchall()
                
                return {
                    'performance': perf_data,
                    'interactions': interaction_data
                }
        
        except Exception as e:
            logger.error(f"Error obteniendo métricas recientes: {e}")
            return {}
    
    def _get_recent_interactions(self, hours: int = 24) -> List:
        """Obtiene interacciones recientes"""
        try:
            if not self.metrics_db_path.exists():
                return []
            
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=hours)
            
            with sqlite3.connect(self.metrics_db_path) as conn:
                return conn.execute("""
                    SELECT * FROM user_interactions 
                    WHERE timestamp >= ? AND timestamp <= ?
                    ORDER BY timestamp
                """, (start_time.isoformat(), end_time.isoformat())).fetchall()
        
        except Exception as e:
            logger.error(f"Error obteniendo interacciones recientes: {e}")
            return []
    
    def _get_high_priority_opportunities(self) -> List[ImprovementOpportunity]:
        """Obtiene oportunidades de alta prioridad para optimización automática"""
        try:
            with sqlite3.connect(self.improvement_db_path) as conn:
                rows = conn.execute("""
                    SELECT * FROM improvement_opportunities 
                    WHERE priority IN ('critical', 'high') 
                    AND status = 'identified'
                    ORDER BY impact_score DESC, confidence DESC
                    LIMIT 5
                """).fetchall()
                
                opportunities = []
                for row in rows:
                    opportunities.append(ImprovementOpportunity(
                        id=row[0],
                        category=row[1],
                        description=row[2],
                        impact_score=row[3],
                        effort_score=row[4],
                        priority=row[5],
                        suggested_actions=json.loads(row[6]) if row[6] else [],
                        metrics_affected=json.loads(row[7]) if row[7] else [],
                        confidence=row[8],
                        timestamp=datetime.fromisoformat(row[9])
                    ))
                
                return opportunities
        
        except Exception as e:
            logger.error(f"Error obteniendo oportunidades de alta prioridad: {e}")
            return []
    
    def _should_auto_optimize(self, opportunity: ImprovementOpportunity) -> bool:
        """Determina si una oportunidad debe ser optimizada automáticamente"""
        # Criterios para optimización automática
        auto_optimize_categories = ['performance', 'efficiency']
        
        return (
            opportunity.category in auto_optimize_categories and
            opportunity.confidence > 0.8 and
            opportunity.effort_score < 0.6 and
            opportunity.impact_score > 0.6
        )
    
    def _apply_optimization(self, opportunity: ImprovementOpportunity) -> OptimizationResult:
        """Aplica una optimización específica"""
        start_time = time.time()
        
        try:
            # Capturar métricas antes de la optimización
            metrics_before = self._capture_current_metrics()
            
            # Aplicar acciones de optimización
            actions_taken = []
            success = True
            
            for action in opportunity.suggested_actions:
                try:
                    action_success = self._execute_optimization_action(action, opportunity.category)
                    actions_taken.append(f"{action}: {'SUCCESS' if action_success else 'FAILED'}")
                    if not action_success:
                        success = False
                except Exception as e:
                    actions_taken.append(f"{action}: ERROR - {str(e)}")
                    success = False
            
            # Esperar un poco para que los cambios tomen efecto
            time.sleep(30)
            
            # Capturar métricas después de la optimización
            metrics_after = self._capture_current_metrics()
            
            # Calcular mejora
            improvement_percentage = self._calculate_improvement(
                metrics_before, metrics_after, opportunity.metrics_affected
            )
            
            duration = time.time() - start_time
            
            return OptimizationResult(
                optimization_id=opportunity.id,
                category=opportunity.category,
                actions_taken=actions_taken,
                metrics_before=metrics_before,
                metrics_after=metrics_after,
                improvement_percentage=improvement_percentage,
                success=success,
                timestamp=datetime.now(),
                duration=duration
            )
        
        except Exception as e:
            logger.error(f"Error aplicando optimización: {e}")
            return OptimizationResult(
                optimization_id=opportunity.id,
                category=opportunity.category,
                actions_taken=[f"ERROR: {str(e)}"],
                metrics_before={},
                metrics_after={},
                improvement_percentage=0,
                success=False,
                timestamp=datetime.now(),
                duration=time.time() - start_time
            )
    
    def _execute_optimization_action(self, action: str, category: str) -> bool:
        """Ejecuta una acción específica de optimización"""
        try:
            if "caché" in action.lower():
                return self._optimize_cache()
            elif "contexto" in action.lower():
                return self._optimize_context_loading()
            elif "memoria" in action.lower():
                return self._optimize_memory_usage()
            elif "algoritmo" in action.lower():
                return self._optimize_algorithms()
            else:
                logger.warning(f"Acción de optimización no reconocida: {action}")
                return False
        
        except Exception as e:
            logger.error(f"Error ejecutando acción de optimización {action}: {e}")
            return False
    
    def _optimize_cache(self) -> bool:
        """Optimiza la configuración de caché"""
        try:
            cache_dir = Path(".trae/cache")
            if not cache_dir.exists():
                return False
            
            # Limpiar archivos de caché antiguos (>24 horas)
            cleaned_files = 0
            for cache_file in cache_dir.rglob("*.cache"):
                if (datetime.now() - datetime.fromtimestamp(cache_file.stat().st_mtime)).hours > 24:
                    cache_file.unlink()
                    cleaned_files += 1
            
            # Actualizar configuración de caché si existe
            cache_config_file = cache_dir / "cache_config.json"
            if cache_config_file.exists():
                with open(cache_config_file, 'r') as f:
                    config = json.load(f)
                
                # Optimizar configuración
                config['max_size'] = min(config.get('max_size', 1000) * 1.2, 2000)
                config['ttl'] = max(config.get('ttl', 3600) * 0.8, 1800)
                
                with open(cache_config_file, 'w') as f:
                    json.dump(config, f, indent=2)
            
            logger.info(f"Caché optimizado: {cleaned_files} archivos limpiados")
            return True
        
        except Exception as e:
            logger.error(f"Error optimizando caché: {e}")
            return False
    
    def _optimize_context_loading(self) -> bool:
        """Optimiza la carga de contexto"""
        try:
            # Actualizar configuración de contexto
            context_config_file = Path(".trae/config/context_config.json")
            if context_config_file.exists():
                with open(context_config_file, 'r') as f:
                    config = json.load(f)
                
                # Optimizar configuración
                config['max_context_size'] = min(config.get('max_context_size', 1000) * 0.8, 800)
                config['selective_loading'] = True
                config['compression_enabled'] = True
                
                with open(context_config_file, 'w') as f:
                    json.dump(config, f, indent=2)
                
                logger.info("Configuración de contexto optimizada")
                return True
            
            return False
        
        except Exception as e:
            logger.error(f"Error optimizando carga de contexto: {e}")
            return False
    
    def _optimize_memory_usage(self) -> bool:
        """Optimiza el uso de memoria"""
        try:
            # Limpiar buffers si están muy llenos
            import gc
            gc.collect()
            
            # Limpiar archivos temporales
            temp_dir = Path(".trae/temp")
            if temp_dir.exists():
                for temp_file in temp_dir.glob("*"):
                    if (datetime.now() - datetime.fromtimestamp(temp_file.stat().st_mtime)).hours > 1:
                        temp_file.unlink()
            
            logger.info("Memoria optimizada")
            return True
        
        except Exception as e:
            logger.error(f"Error optimizando memoria: {e}")
            return False
    
    def _optimize_algorithms(self) -> bool:
        """Optimiza algoritmos (placeholder para optimizaciones específicas)"""
        try:
            # Placeholder para optimizaciones algorítmicas específicas
            # En una implementación real, esto podría incluir:
            # - Actualizar parámetros de algoritmos ML
            # - Optimizar consultas de base de datos
            # - Ajustar configuraciones de procesamiento
            
            logger.info("Algoritmos optimizados (placeholder)")
            return True
        
        except Exception as e:
            logger.error(f"Error optimizando algoritmos: {e}")
            return False
    
    def _capture_current_metrics(self) -> Dict[str, float]:
        """Captura métricas actuales del sistema"""
        try:
            import psutil
            
            return {
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'response_time': 0,  # Se actualizará con métricas reales
                'cache_hit_rate': 0,  # Se actualizará con métricas reales
                'token_efficiency': 0  # Se actualizará con métricas reales
            }
        
        except Exception as e:
            logger.error(f"Error capturando métricas actuales: {e}")
            return {}
    
    def _calculate_improvement(self, before: Dict, after: Dict, affected_metrics: List[str]) -> float:
        """Calcula el porcentaje de mejora"""
        try:
            if not before or not after:
                return 0
            
            improvements = []
            
            for metric in affected_metrics:
                if metric in before and metric in after:
                    before_val = before[metric]
                    after_val = after[metric]
                    
                    if before_val > 0:
                        # Para métricas donde menor es mejor (cpu, memory, response_time)
                        if metric in ['cpu_percent', 'memory_percent', 'response_time']:
                            improvement = ((before_val - after_val) / before_val) * 100
                        else:
                            # Para métricas donde mayor es mejor (cache_hit_rate, token_efficiency)
                            improvement = ((after_val - before_val) / before_val) * 100
                        
                        improvements.append(improvement)
            
            return statistics.mean(improvements) if improvements else 0
        
        except Exception as e:
            logger.error(f"Error calculando mejora: {e}")
            return 0
    
    def _store_opportunities(self, opportunities: List[ImprovementOpportunity]):
        """Almacena oportunidades en base de datos"""
        try:
            with sqlite3.connect(self.improvement_db_path) as conn:
                for opp in opportunities:
                    conn.execute("""
                        INSERT OR REPLACE INTO improvement_opportunities 
                        (id, category, description, impact_score, effort_score, priority,
                         suggested_actions, metrics_affected, confidence, timestamp)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        opp.id, opp.category, opp.description, opp.impact_score,
                        opp.effort_score, opp.priority, json.dumps(opp.suggested_actions),
                        json.dumps(opp.metrics_affected), opp.confidence,
                        opp.timestamp.isoformat()
                    ))
        
        except Exception as e:
            logger.error(f"Error almacenando oportunidades: {e}")
    
    def _store_insights(self, insights: List[SystemInsight]):
        """Almacena insights en base de datos"""
        try:
            with sqlite3.connect(self.improvement_db_path) as conn:
                for insight in insights:
                    conn.execute("""
                        INSERT OR REPLACE INTO system_insights 
                        (id, category, title, description, supporting_data, actionable, priority, timestamp)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        insight.insight_id, insight.category, insight.title,
                        insight.description, json.dumps(insight.supporting_data),
                        insight.actionable, insight.priority, insight.timestamp.isoformat()
                    ))
        
        except Exception as e:
            logger.error(f"Error almacenando insights: {e}")
    
    def _store_user_patterns(self, patterns: List[UserPattern]):
        """Almacena patrones de usuario en base de datos"""
        try:
            with sqlite3.connect(self.improvement_db_path) as conn:
                for pattern in patterns:
                    conn.execute("""
                        INSERT OR REPLACE INTO user_patterns 
                        (id, pattern_type, frequency, avg_tokens, avg_execution_time,
                         success_rate, preferred_context, time_preferences, command_patterns,
                         confidence, last_updated)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        pattern.pattern_id, pattern.pattern_type, pattern.frequency,
                        pattern.avg_tokens, pattern.avg_execution_time, pattern.success_rate,
                        pattern.preferred_context, json.dumps(pattern.time_of_day_preference),
                        json.dumps(pattern.command_patterns), pattern.confidence,
                        datetime.now().isoformat()
                    ))
        
        except Exception as e:
            logger.error(f"Error almacenando patrones de usuario: {e}")
    
    def _store_optimization_result(self, result: OptimizationResult):
        """Almacena resultado de optimización en base de datos"""
        try:
            with sqlite3.connect(self.improvement_db_path) as conn:
                conn.execute("""
                    INSERT INTO optimization_results 
                    (id, optimization_id, category, actions_taken, metrics_before,
                     metrics_after, improvement_percentage, success, timestamp, duration)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    f"opt_result_{int(time.time())}", result.optimization_id,
                    result.category, json.dumps(result.actions_taken),
                    json.dumps(result.metrics_before), json.dumps(result.metrics_after),
                    result.improvement_percentage, result.success,
                    result.timestamp.isoformat(), result.duration
                ))
                
                # Marcar oportunidad como procesada
                conn.execute("""
                    UPDATE improvement_opportunities 
                    SET status = 'processed' 
                    WHERE id = ?
                """, (result.optimization_id,))
        
        except Exception as e:
            logger.error(f"Error almacenando resultado de optimización: {e}")
    
    def _train_user_pattern_model(self):
        """Entrena modelo ML para detección de patrones de usuario"""
        try:
            # Placeholder para entrenamiento de modelo ML
            # En implementación real incluiría:
            # - Preparación de datos de entrenamiento
            # - Entrenamiento de modelo de clustering
            # - Validación y evaluación
            logger.info("Modelo de patrones de usuario entrenado (placeholder)")
        
        except Exception as e:
            logger.error(f"Error entrenando modelo de patrones: {e}")
    
    def _train_performance_predictor(self):
        """Entrena modelo predictor de rendimiento"""
        try:
            # Placeholder para entrenamiento de modelo ML
            logger.info("Predictor de rendimiento entrenado (placeholder)")
        
        except Exception as e:
            logger.error(f"Error entrenando predictor de rendimiento: {e}")
    
    def _train_anomaly_detector(self):
        """Entrena detector de anomalías"""
        try:
            # Placeholder para entrenamiento de modelo ML
            logger.info("Detector de anomalías entrenado (placeholder)")
        
        except Exception as e:
            logger.error(f"Error entrenando detector de anomalías: {e}")
    
    def _load_ml_models(self):
        """Carga modelos ML existentes"""
        try:
            # Placeholder para carga de modelos
            logger.info("Modelos ML cargados (placeholder)")
        
        except Exception as e:
            logger.error(f"Error cargando modelos ML: {e}")
    
    def _save_ml_models(self):
        """Guarda modelos ML actualizados"""
        try:
            # Placeholder para guardado de modelos
            logger.info("Modelos ML guardados (placeholder)")
        
        except Exception as e:
            logger.error(f"Error guardando modelos ML: {e}")
    
    def get_improvement_summary(self) -> Dict[str, Any]:
        """Obtiene resumen del estado de mejora continua"""
        try:
            with sqlite3.connect(self.improvement_db_path) as conn:
                # Contar oportunidades por prioridad
                opportunities = conn.execute("""
                    SELECT priority, COUNT(*) FROM improvement_opportunities 
                    WHERE status = 'identified'
                    GROUP BY priority
                """).fetchall()
                
                # Contar optimizaciones exitosas
                successful_optimizations = conn.execute("""
                    SELECT COUNT(*) FROM optimization_results 
                    WHERE success = 1 AND timestamp >= datetime('now', '-7 days')
                """).fetchone()[0]
                
                # Promedio de mejora
                avg_improvement = conn.execute("""
                    SELECT AVG(improvement_percentage) FROM optimization_results 
                    WHERE success = 1 AND timestamp >= datetime('now', '-7 days')
                """).fetchone()[0] or 0
                
                # Insights activos
                active_insights = conn.execute("""
                    SELECT COUNT(*) FROM system_insights 
                    WHERE status = 'active'
                """).fetchone()[0]
                
                return {
                    'opportunities_by_priority': dict(opportunities),
                    'successful_optimizations_week': successful_optimizations,
                    'average_improvement_percentage': avg_improvement,
                    'active_insights': active_insights,
                    'engine_status': 'running' if self.is_running else 'stopped',
                    'last_analysis': datetime.now().isoformat()
                }
        
        except Exception as e:
            logger.error(f"Error obteniendo resumen de mejoras: {e}")
            return {}

# Función de utilidad para inicializar el motor
def initialize_continuous_improvement() -> ContinuousImprovementEngine:
    """Inicializa y retorna una instancia del motor de mejora continua"""
    engine = ContinuousImprovementEngine()
    engine.start_continuous_improvement()
    return engine

# Ejemplo de uso
if __name__ == "__main__":
    # Inicializar motor de mejora continua
    improvement_engine = initialize_continuous_improvement()
    
    print("Motor de mejora continua iniciado...")
    print("Analizando métricas y generando oportunidades de mejora...")
    
    try:
        # Mantener el motor ejecutándose
        while True:
            time.sleep(300)  # Cada 5 minutos mostrar resumen
            summary = improvement_engine.get_improvement_summary()
            print(f"\nResumen de mejora continua:")
            print(f"- Oportunidades identificadas: {summary.get('opportunities_by_priority', {})}")
            print(f"- Optimizaciones exitosas (semana): {summary.get('successful_optimizations_week', 0)}")
            print(f"- Mejora promedio: {summary.get('average_improvement_percentage', 0):.1f}%")
            print(f"- Insights activos: {summary.get('active_insights', 0)}")
    
    except KeyboardInterrupt:
        improvement_engine.stop_continuous_improvement()
        print("\nMotor de mejora continua detenido")