#!/usr/bin/env python3
"""
NEXUS Metrics Collector - Sistema de Métricas y Mejora Continua
Recolecta, analiza y reporta métricas de rendimiento del sistema NEXUS
"""

import asyncio
import json
import time
import psutil
import sqlite3
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import logging
from collections import defaultdict, deque
import statistics
import threading
from concurrent.futures import ThreadPoolExecutor

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MetricPoint:
    """Punto de métrica individual"""
    timestamp: datetime
    metric_name: str
    value: float
    tags: Dict[str, str]
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class PerformanceSnapshot:
    """Snapshot de rendimiento del sistema"""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    disk_io_read: int
    disk_io_write: int
    network_io_sent: int
    network_io_recv: int
    active_processes: int
    response_time: float
    cache_hit_rate: float
    error_rate: float
    token_efficiency: float

@dataclass
class UserInteractionMetric:
    """Métrica de interacción del usuario"""
    timestamp: datetime
    command_type: str
    natural_command: str
    execution_time: float
    tokens_used: int
    success: bool
    user_satisfaction_inferred: float
    context_loaded: str
    files_modified: int
    errors_encountered: int

@dataclass
class SystemHealthReport:
    """Reporte de salud del sistema"""
    timestamp: datetime
    overall_health_score: float
    performance_score: float
    efficiency_score: float
    reliability_score: float
    user_satisfaction_score: float
    recommendations: List[str]
    alerts: List[str]
    trends: Dict[str, str]

class MetricsCollector:
    """
    Recolector principal de métricas para NEXUS
    """
    
    def __init__(self, db_path: str = ".trae/metrics/nexus_metrics.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Buffers en memoria para métricas en tiempo real
        self.performance_buffer = deque(maxlen=1000)
        self.interaction_buffer = deque(maxlen=500)
        self.metric_buffer = deque(maxlen=2000)
        
        # Estado del sistema
        self.is_collecting = False
        self.collection_interval = 30  # segundos
        self.last_system_snapshot = None
        
        # Thread pool para operaciones asíncronas
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Inicializar base de datos
        self._init_database()
        
        # Métricas de baseline
        self.baseline_metrics = self._calculate_baseline()
        
        logger.info("MetricsCollector inicializado correctamente")
    
    def _init_database(self):
        """Inicializa la base de datos de métricas"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.executescript("""
                    CREATE TABLE IF NOT EXISTS performance_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        cpu_percent REAL,
                        memory_percent REAL,
                        disk_io_read INTEGER,
                        disk_io_write INTEGER,
                        network_io_sent INTEGER,
                        network_io_recv INTEGER,
                        active_processes INTEGER,
                        response_time REAL,
                        cache_hit_rate REAL,
                        error_rate REAL,
                        token_efficiency REAL
                    );
                    
                    CREATE TABLE IF NOT EXISTS user_interactions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        command_type TEXT,
                        natural_command TEXT,
                        execution_time REAL,
                        tokens_used INTEGER,
                        success BOOLEAN,
                        user_satisfaction_inferred REAL,
                        context_loaded TEXT,
                        files_modified INTEGER,
                        errors_encountered INTEGER
                    );
                    
                    CREATE TABLE IF NOT EXISTS system_health (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        overall_health_score REAL,
                        performance_score REAL,
                        efficiency_score REAL,
                        reliability_score REAL,
                        user_satisfaction_score REAL,
                        recommendations TEXT,
                        alerts TEXT,
                        trends TEXT
                    );
                    
                    CREATE TABLE IF NOT EXISTS custom_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        metric_name TEXT NOT NULL,
                        value REAL,
                        tags TEXT,
                        metadata TEXT
                    );
                    
                    CREATE INDEX IF NOT EXISTS idx_performance_timestamp 
                    ON performance_metrics(timestamp);
                    
                    CREATE INDEX IF NOT EXISTS idx_interactions_timestamp 
                    ON user_interactions(timestamp);
                    
                    CREATE INDEX IF NOT EXISTS idx_health_timestamp 
                    ON system_health(timestamp);
                """)
            logger.info("Base de datos de métricas inicializada")
        except Exception as e:
            logger.error(f"Error inicializando base de datos: {e}")
    
    def start_collection(self):
        """Inicia la recolección automática de métricas"""
        if self.is_collecting:
            logger.warning("La recolección ya está activa")
            return
        
        self.is_collecting = True
        
        # Iniciar threads de recolección
        threading.Thread(target=self._performance_collection_loop, daemon=True).start()
        threading.Thread(target=self._health_monitoring_loop, daemon=True).start()
        
        logger.info("Recolección de métricas iniciada")
    
    def stop_collection(self):
        """Detiene la recolección de métricas"""
        self.is_collecting = False
        logger.info("Recolección de métricas detenida")
    
    def _performance_collection_loop(self):
        """Loop principal de recolección de métricas de rendimiento"""
        while self.is_collecting:
            try:
                snapshot = self._collect_performance_snapshot()
                self.performance_buffer.append(snapshot)
                self._store_performance_snapshot(snapshot)
                
                time.sleep(self.collection_interval)
            except Exception as e:
                logger.error(f"Error en recolección de rendimiento: {e}")
                time.sleep(5)
    
    def _health_monitoring_loop(self):
        """Loop de monitoreo de salud del sistema"""
        while self.is_collecting:
            try:
                # Generar reporte de salud cada 5 minutos
                time.sleep(300)
                health_report = self._generate_health_report()
                self._store_health_report(health_report)
                
                # Verificar alertas críticas
                self._check_critical_alerts(health_report)
                
            except Exception as e:
                logger.error(f"Error en monitoreo de salud: {e}")
                time.sleep(30)
    
    def _collect_performance_snapshot(self) -> PerformanceSnapshot:
        """Recolecta snapshot actual de rendimiento"""
        try:
            # Métricas del sistema
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk_io = psutil.disk_io_counters()
            network_io = psutil.net_io_counters()
            
            # Métricas específicas de NEXUS
            response_time = self._calculate_avg_response_time()
            cache_hit_rate = self._calculate_cache_hit_rate()
            error_rate = self._calculate_error_rate()
            token_efficiency = self._calculate_token_efficiency()
            
            return PerformanceSnapshot(
                timestamp=datetime.now(),
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                disk_io_read=disk_io.read_bytes if disk_io else 0,
                disk_io_write=disk_io.write_bytes if disk_io else 0,
                network_io_sent=network_io.bytes_sent if network_io else 0,
                network_io_recv=network_io.bytes_recv if network_io else 0,
                active_processes=len(psutil.pids()),
                response_time=response_time,
                cache_hit_rate=cache_hit_rate,
                error_rate=error_rate,
                token_efficiency=token_efficiency
            )
        except Exception as e:
            logger.error(f"Error recolectando snapshot de rendimiento: {e}")
            return None
    
    def record_user_interaction(self, 
                              command_type: str,
                              natural_command: str,
                              execution_time: float,
                              tokens_used: int,
                              success: bool,
                              context_loaded: str = "",
                              files_modified: int = 0,
                              errors_encountered: int = 0):
        """Registra una interacción del usuario"""
        try:
            # Inferir satisfacción del usuario basada en métricas
            satisfaction = self._infer_user_satisfaction(
                execution_time, tokens_used, success, errors_encountered
            )
            
            interaction = UserInteractionMetric(
                timestamp=datetime.now(),
                command_type=command_type,
                natural_command=natural_command,
                execution_time=execution_time,
                tokens_used=tokens_used,
                success=success,
                user_satisfaction_inferred=satisfaction,
                context_loaded=context_loaded,
                files_modified=files_modified,
                errors_encountered=errors_encountered
            )
            
            self.interaction_buffer.append(interaction)
            self._store_user_interaction(interaction)
            
            logger.debug(f"Interacción registrada: {command_type} - {success}")
        except Exception as e:
            logger.error(f"Error registrando interacción: {e}")
    
    def record_custom_metric(self, 
                           metric_name: str, 
                           value: float, 
                           tags: Dict[str, str] = None,
                           metadata: Dict[str, Any] = None):
        """Registra una métrica personalizada"""
        try:
            metric = MetricPoint(
                timestamp=datetime.now(),
                metric_name=metric_name,
                value=value,
                tags=tags or {},
                metadata=metadata
            )
            
            self.metric_buffer.append(metric)
            self._store_custom_metric(metric)
            
            logger.debug(f"Métrica personalizada registrada: {metric_name} = {value}")
        except Exception as e:
            logger.error(f"Error registrando métrica personalizada: {e}")
    
    def _calculate_avg_response_time(self) -> float:
        """Calcula tiempo de respuesta promedio reciente"""
        if not self.interaction_buffer:
            return 0.0
        
        recent_interactions = [
            i for i in self.interaction_buffer 
            if (datetime.now() - i.timestamp).seconds < 300  # últimos 5 minutos
        ]
        
        if not recent_interactions:
            return 0.0
        
        return statistics.mean([i.execution_time for i in recent_interactions])
    
    def _calculate_cache_hit_rate(self) -> float:
        """Calcula tasa de aciertos de caché"""
        try:
            # Leer estadísticas de caché desde archivo de estado
            cache_stats_file = Path(".trae/cache/cache_stats.json")
            if cache_stats_file.exists():
                with open(cache_stats_file, 'r') as f:
                    stats = json.load(f)
                    hits = stats.get('hits', 0)
                    misses = stats.get('misses', 0)
                    total = hits + misses
                    return (hits / total) if total > 0 else 0.0
            return 0.0
        except Exception:
            return 0.0
    
    def _calculate_error_rate(self) -> float:
        """Calcula tasa de errores reciente"""
        if not self.interaction_buffer:
            return 0.0
        
        recent_interactions = [
            i for i in self.interaction_buffer 
            if (datetime.now() - i.timestamp).seconds < 300
        ]
        
        if not recent_interactions:
            return 0.0
        
        failed_interactions = [i for i in recent_interactions if not i.success]
        return len(failed_interactions) / len(recent_interactions)
    
    def _calculate_token_efficiency(self) -> float:
        """Calcula eficiencia de tokens (tokens por tarea exitosa)"""
        if not self.interaction_buffer:
            return 0.0
        
        successful_interactions = [i for i in self.interaction_buffer if i.success]
        
        if not successful_interactions:
            return 0.0
        
        avg_tokens = statistics.mean([i.tokens_used for i in successful_interactions])
        
        # Normalizar: menor uso de tokens = mayor eficiencia
        # Baseline: 800 tokens = 50% eficiencia, 400 tokens = 100% eficiencia
        baseline_tokens = 800
        efficiency = max(0, min(100, (baseline_tokens / avg_tokens) * 50))
        
        return efficiency / 100.0  # Retornar como decimal
    
    def _infer_user_satisfaction(self, 
                               execution_time: float, 
                               tokens_used: int, 
                               success: bool, 
                               errors: int) -> float:
        """Infiere satisfacción del usuario basada en métricas"""
        satisfaction = 0.5  # Base neutral
        
        # Factor de éxito
        if success:
            satisfaction += 0.3
        else:
            satisfaction -= 0.4
        
        # Factor de tiempo de ejecución
        if execution_time < 10:
            satisfaction += 0.2
        elif execution_time > 60:
            satisfaction -= 0.2
        
        # Factor de eficiencia de tokens
        if tokens_used < 400:
            satisfaction += 0.1
        elif tokens_used > 800:
            satisfaction -= 0.1
        
        # Factor de errores
        satisfaction -= (errors * 0.1)
        
        return max(0.0, min(1.0, satisfaction))
    
    def _generate_health_report(self) -> SystemHealthReport:
        """Genera reporte de salud del sistema"""
        try:
            # Calcular scores de diferentes aspectos
            performance_score = self._calculate_performance_score()
            efficiency_score = self._calculate_efficiency_score()
            reliability_score = self._calculate_reliability_score()
            satisfaction_score = self._calculate_user_satisfaction_score()
            
            # Score general (promedio ponderado)
            overall_score = (
                performance_score * 0.25 +
                efficiency_score * 0.30 +
                reliability_score * 0.25 +
                satisfaction_score * 0.20
            )
            
            # Generar recomendaciones
            recommendations = self._generate_recommendations(
                performance_score, efficiency_score, reliability_score, satisfaction_score
            )
            
            # Generar alertas
            alerts = self._generate_alerts(
                performance_score, efficiency_score, reliability_score, satisfaction_score
            )
            
            # Analizar tendencias
            trends = self._analyze_trends()
            
            return SystemHealthReport(
                timestamp=datetime.now(),
                overall_health_score=overall_score,
                performance_score=performance_score,
                efficiency_score=efficiency_score,
                reliability_score=reliability_score,
                user_satisfaction_score=satisfaction_score,
                recommendations=recommendations,
                alerts=alerts,
                trends=trends
            )
        except Exception as e:
            logger.error(f"Error generando reporte de salud: {e}")
            return None
    
    def _calculate_performance_score(self) -> float:
        """Calcula score de rendimiento del sistema"""
        if not self.performance_buffer:
            return 0.5
        
        recent_snapshots = [
            s for s in self.performance_buffer 
            if (datetime.now() - s.timestamp).seconds < 1800  # últimos 30 minutos
        ]
        
        if not recent_snapshots:
            return 0.5
        
        # Factores de rendimiento
        avg_cpu = statistics.mean([s.cpu_percent for s in recent_snapshots])
        avg_memory = statistics.mean([s.memory_percent for s in recent_snapshots])
        avg_response_time = statistics.mean([s.response_time for s in recent_snapshots])
        
        # Calcular score (0-1)
        cpu_score = max(0, 1 - (avg_cpu / 100))
        memory_score = max(0, 1 - (avg_memory / 100))
        response_score = max(0, 1 - (avg_response_time / 60))  # 60s como máximo aceptable
        
        return (cpu_score + memory_score + response_score) / 3
    
    def _calculate_efficiency_score(self) -> float:
        """Calcula score de eficiencia"""
        if not self.interaction_buffer:
            return 0.5
        
        recent_interactions = [
            i for i in self.interaction_buffer 
            if (datetime.now() - i.timestamp).seconds < 1800
        ]
        
        if not recent_interactions:
            return 0.5
        
        # Métricas de eficiencia
        avg_tokens = statistics.mean([i.tokens_used for i in recent_interactions])
        avg_execution_time = statistics.mean([i.execution_time for i in recent_interactions])
        
        # Normalizar scores
        token_efficiency = max(0, min(1, (800 - avg_tokens) / 400))  # 400-800 tokens rango
        time_efficiency = max(0, min(1, (30 - avg_execution_time) / 25))  # 5-30s rango
        
        return (token_efficiency + time_efficiency) / 2
    
    def _calculate_reliability_score(self) -> float:
        """Calcula score de confiabilidad"""
        if not self.interaction_buffer:
            return 0.5
        
        recent_interactions = [
            i for i in self.interaction_buffer 
            if (datetime.now() - i.timestamp).seconds < 3600  # última hora
        ]
        
        if not recent_interactions:
            return 0.5
        
        success_rate = len([i for i in recent_interactions if i.success]) / len(recent_interactions)
        error_rate = statistics.mean([i.errors_encountered for i in recent_interactions])
        
        # Score basado en tasa de éxito y errores
        success_score = success_rate
        error_score = max(0, 1 - (error_rate / 5))  # 5 errores como máximo aceptable
        
        return (success_score + error_score) / 2
    
    def _calculate_user_satisfaction_score(self) -> float:
        """Calcula score de satisfacción del usuario"""
        if not self.interaction_buffer:
            return 0.5
        
        recent_interactions = [
            i for i in self.interaction_buffer 
            if (datetime.now() - i.timestamp).seconds < 3600
        ]
        
        if not recent_interactions:
            return 0.5
        
        return statistics.mean([i.user_satisfaction_inferred for i in recent_interactions])
    
    def _generate_recommendations(self, perf: float, eff: float, rel: float, sat: float) -> List[str]:
        """Genera recomendaciones basadas en scores"""
        recommendations = []
        
        if perf < 0.7:
            recommendations.append("Optimizar rendimiento del sistema - CPU/Memoria alta")
        
        if eff < 0.7:
            recommendations.append("Mejorar eficiencia de tokens - Optimizar contexto")
        
        if rel < 0.8:
            recommendations.append("Mejorar confiabilidad - Revisar manejo de errores")
        
        if sat < 0.7:
            recommendations.append("Mejorar experiencia de usuario - Reducir tiempos de respuesta")
        
        # Recomendaciones específicas
        if perf > 0.9 and eff < 0.6:
            recommendations.append("Sistema estable - Enfocar en optimización de tokens")
        
        if rel > 0.9 and sat < 0.7:
            recommendations.append("Sistema confiable - Mejorar velocidad de respuesta")
        
        return recommendations
    
    def _generate_alerts(self, perf: float, eff: float, rel: float, sat: float) -> List[str]:
        """Genera alertas basadas en scores críticos"""
        alerts = []
        
        if perf < 0.5:
            alerts.append("CRÍTICO: Rendimiento del sistema muy bajo")
        
        if rel < 0.6:
            alerts.append("CRÍTICO: Alta tasa de errores detectada")
        
        if sat < 0.4:
            alerts.append("ADVERTENCIA: Satisfacción del usuario muy baja")
        
        if eff < 0.4:
            alerts.append("ADVERTENCIA: Eficiencia de tokens muy baja")
        
        return alerts
    
    def _analyze_trends(self) -> Dict[str, str]:
        """Analiza tendencias en las métricas"""
        trends = {}
        
        try:
            # Analizar tendencia de rendimiento
            if len(self.performance_buffer) >= 10:
                recent_perf = list(self.performance_buffer)[-5:]
                older_perf = list(self.performance_buffer)[-10:-5]
                
                recent_avg = statistics.mean([s.response_time for s in recent_perf])
                older_avg = statistics.mean([s.response_time for s in older_perf])
                
                if recent_avg < older_avg * 0.9:
                    trends['performance'] = 'MEJORANDO'
                elif recent_avg > older_avg * 1.1:
                    trends['performance'] = 'EMPEORANDO'
                else:
                    trends['performance'] = 'ESTABLE'
            
            # Analizar tendencia de satisfacción
            if len(self.interaction_buffer) >= 10:
                recent_interactions = list(self.interaction_buffer)[-5:]
                older_interactions = list(self.interaction_buffer)[-10:-5]
                
                recent_sat = statistics.mean([i.user_satisfaction_inferred for i in recent_interactions])
                older_sat = statistics.mean([i.user_satisfaction_inferred for i in older_interactions])
                
                if recent_sat > older_sat + 0.1:
                    trends['satisfaction'] = 'MEJORANDO'
                elif recent_sat < older_sat - 0.1:
                    trends['satisfaction'] = 'EMPEORANDO'
                else:
                    trends['satisfaction'] = 'ESTABLE'
        
        except Exception as e:
            logger.error(f"Error analizando tendencias: {e}")
        
        return trends
    
    def _check_critical_alerts(self, health_report: SystemHealthReport):
        """Verifica alertas críticas y toma acciones automáticas"""
        for alert in health_report.alerts:
            if "CRÍTICO" in alert:
                logger.critical(f"Alerta crítica detectada: {alert}")
                
                # Acciones automáticas para alertas críticas
                if "Rendimiento" in alert:
                    self._trigger_performance_optimization()
                elif "errores" in alert:
                    self._trigger_error_analysis()
    
    def _trigger_performance_optimization(self):
        """Dispara optimización automática de rendimiento"""
        try:
            # Limpiar caché si es necesario
            cache_dir = Path(".trae/cache")
            if cache_dir.exists():
                # Limpiar archivos de caché antiguos
                for cache_file in cache_dir.glob("*.cache"):
                    if (datetime.now() - datetime.fromtimestamp(cache_file.stat().st_mtime)).days > 1:
                        cache_file.unlink()
            
            logger.info("Optimización automática de rendimiento ejecutada")
        except Exception as e:
            logger.error(f"Error en optimización automática: {e}")
    
    def _trigger_error_analysis(self):
        """Dispara análisis automático de errores"""
        try:
            # Analizar patrones de errores recientes
            recent_errors = [
                i for i in self.interaction_buffer 
                if not i.success and (datetime.now() - i.timestamp).seconds < 3600
            ]
            
            if recent_errors:
                error_patterns = defaultdict(int)
                for error in recent_errors:
                    error_patterns[error.command_type] += 1
                
                # Log de patrones de errores más comunes
                for pattern, count in error_patterns.items():
                    if count >= 3:
                        logger.warning(f"Patrón de error detectado: {pattern} ({count} veces)")
            
            logger.info("Análisis automático de errores completado")
        except Exception as e:
            logger.error(f"Error en análisis automático de errores: {e}")
    
    def _store_performance_snapshot(self, snapshot: PerformanceSnapshot):
        """Almacena snapshot de rendimiento en base de datos"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO performance_metrics 
                    (timestamp, cpu_percent, memory_percent, disk_io_read, disk_io_write,
                     network_io_sent, network_io_recv, active_processes, response_time,
                     cache_hit_rate, error_rate, token_efficiency)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    snapshot.timestamp.isoformat(),
                    snapshot.cpu_percent,
                    snapshot.memory_percent,
                    snapshot.disk_io_read,
                    snapshot.disk_io_write,
                    snapshot.network_io_sent,
                    snapshot.network_io_recv,
                    snapshot.active_processes,
                    snapshot.response_time,
                    snapshot.cache_hit_rate,
                    snapshot.error_rate,
                    snapshot.token_efficiency
                ))
        except Exception as e:
            logger.error(f"Error almacenando snapshot de rendimiento: {e}")
    
    def _store_user_interaction(self, interaction: UserInteractionMetric):
        """Almacena interacción de usuario en base de datos"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO user_interactions 
                    (timestamp, command_type, natural_command, execution_time, tokens_used,
                     success, user_satisfaction_inferred, context_loaded, files_modified,
                     errors_encountered)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    interaction.timestamp.isoformat(),
                    interaction.command_type,
                    interaction.natural_command,
                    interaction.execution_time,
                    interaction.tokens_used,
                    interaction.success,
                    interaction.user_satisfaction_inferred,
                    interaction.context_loaded,
                    interaction.files_modified,
                    interaction.errors_encountered
                ))
        except Exception as e:
            logger.error(f"Error almacenando interacción de usuario: {e}")
    
    def _store_health_report(self, report: SystemHealthReport):
        """Almacena reporte de salud en base de datos"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO system_health 
                    (timestamp, overall_health_score, performance_score, efficiency_score,
                     reliability_score, user_satisfaction_score, recommendations, alerts, trends)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    report.timestamp.isoformat(),
                    report.overall_health_score,
                    report.performance_score,
                    report.efficiency_score,
                    report.reliability_score,
                    report.user_satisfaction_score,
                    json.dumps(report.recommendations),
                    json.dumps(report.alerts),
                    json.dumps(report.trends)
                ))
        except Exception as e:
            logger.error(f"Error almacenando reporte de salud: {e}")
    
    def _store_custom_metric(self, metric: MetricPoint):
        """Almacena métrica personalizada en base de datos"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO custom_metrics 
                    (timestamp, metric_name, value, tags, metadata)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    metric.timestamp.isoformat(),
                    metric.metric_name,
                    metric.value,
                    json.dumps(metric.tags),
                    json.dumps(metric.metadata) if metric.metadata else None
                ))
        except Exception as e:
            logger.error(f"Error almacenando métrica personalizada: {e}")
    
    def _calculate_baseline(self) -> Dict[str, float]:
        """Calcula métricas baseline del sistema"""
        try:
            baseline = {
                'cpu_baseline': psutil.cpu_percent(interval=1),
                'memory_baseline': psutil.virtual_memory().percent,
                'response_time_baseline': 5.0,  # 5 segundos como baseline
                'token_efficiency_baseline': 0.6,  # 60% como baseline
                'error_rate_baseline': 0.1  # 10% como baseline
            }
            
            logger.info(f"Baseline calculado: {baseline}")
            return baseline
        except Exception as e:
            logger.error(f"Error calculando baseline: {e}")
            return {}
    
    def get_current_metrics(self) -> Dict[str, Any]:
        """Obtiene métricas actuales del sistema"""
        try:
            current_snapshot = self._collect_performance_snapshot()
            latest_health = self._generate_health_report()
            
            return {
                'performance': asdict(current_snapshot) if current_snapshot else {},
                'health': asdict(latest_health) if latest_health else {},
                'buffer_sizes': {
                    'performance_buffer': len(self.performance_buffer),
                    'interaction_buffer': len(self.interaction_buffer),
                    'metric_buffer': len(self.metric_buffer)
                },
                'collection_status': self.is_collecting,
                'baseline_metrics': self.baseline_metrics
            }
        except Exception as e:
            logger.error(f"Error obteniendo métricas actuales: {e}")
            return {}
    
    def generate_report(self, hours: int = 24) -> Dict[str, Any]:
        """Genera reporte completo de métricas"""
        try:
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=hours)
            
            with sqlite3.connect(self.db_path) as conn:
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
                
                # Reportes de salud
                health_data = conn.execute("""
                    SELECT * FROM system_health 
                    WHERE timestamp >= ? AND timestamp <= ?
                    ORDER BY timestamp
                """, (start_time.isoformat(), end_time.isoformat())).fetchall()
            
            # Procesar datos para el reporte
            report = {
                'period': {
                    'start': start_time.isoformat(),
                    'end': end_time.isoformat(),
                    'hours': hours
                },
                'summary': {
                    'total_interactions': len(interaction_data),
                    'successful_interactions': len([i for i in interaction_data if i[6]]),  # success column
                    'avg_response_time': statistics.mean([i[9] for i in perf_data]) if perf_data else 0,
                    'avg_token_usage': statistics.mean([i[5] for i in interaction_data]) if interaction_data else 0,
                    'latest_health_score': health_data[-1][2] if health_data else 0  # overall_health_score
                },
                'performance_data': perf_data,
                'interaction_data': interaction_data,
                'health_data': health_data
            }
            
            return report
        except Exception as e:
            logger.error(f"Error generando reporte: {e}")
            return {}

# Función de utilidad para inicializar el collector
def initialize_metrics_collector() -> MetricsCollector:
    """Inicializa y retorna una instancia del collector de métricas"""
    collector = MetricsCollector()
    collector.start_collection()
    return collector

# Ejemplo de uso
if __name__ == "__main__":
    # Inicializar collector
    collector = initialize_metrics_collector()
    
    # Simular algunas interacciones para testing
    collector.record_user_interaction(
        command_type="development",
        natural_command="crear componente de login",
        execution_time=15.5,
        tokens_used=450,
        success=True,
        context_loaded="frontend_context",
        files_modified=3,
        errors_encountered=0
    )
    
    # Obtener métricas actuales
    current_metrics = collector.get_current_metrics()
    print("Métricas actuales:")
    print(json.dumps(current_metrics, indent=2, default=str))
    
    # Generar reporte
    report = collector.generate_report(hours=1)
    print("\nReporte de la última hora:")
    print(json.dumps(report['summary'], indent=2, default=str))
    
    print("\nMetricsCollector ejecutándose... Presiona Ctrl+C para detener")
    
    try:
        # Mantener el collector ejecutándose
        while True:
            time.sleep(60)
            print(f"Sistema activo - Health Score: {collector._generate_health_report().overall_health_score:.2f}")
    except KeyboardInterrupt:
        collector.stop_collection()
        print("\nMetricsCollector detenido")