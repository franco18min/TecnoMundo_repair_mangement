#!/usr/bin/env python3
"""
🧠 NEXUS - Context Handler
Manejador de contexto inteligente para preservación de estado
TecnoMundo Repair Management - Trae 2.0
"""

import json
import pickle
import hashlib
import gzip
import threading
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, asdict, field
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict, OrderedDict
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import sqlite3
import os

@dataclass
class ContextEntry:
    """Entrada de contexto"""
    context_id: str
    context_type: str
    data: Dict[str, Any]
    metadata: Dict[str, Any]
    created_at: datetime
    last_accessed: datetime
    access_count: int = 0
    size_bytes: int = 0
    compression_ratio: float = 1.0
    tags: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    ttl: Optional[timedelta] = None

@dataclass
class ContextSnapshot:
    """Snapshot completo del contexto"""
    snapshot_id: str
    timestamp: datetime
    project_state: Dict[str, Any]
    file_checksums: Dict[str, str]
    environment_state: Dict[str, Any]
    active_contexts: List[str]
    metadata: Dict[str, Any]
    compression_level: int = 6

@dataclass
class ContextQuery:
    """Query para búsqueda de contexto"""
    context_types: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    time_range: Optional[Tuple[datetime, datetime]] = None
    metadata_filters: Optional[Dict[str, Any]] = None
    limit: int = 100
    sort_by: str = "last_accessed"
    sort_order: str = "desc"

class ContextHandler:
    """Manejador de contexto inteligente"""
    
    def __init__(self, config_dir: str = ".trae/automation"):
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # Directorios de almacenamiento
        self.contexts_dir = self.config_dir / "contexts"
        self.snapshots_dir = self.config_dir / "snapshots"
        self.cache_dir = self.config_dir / "cache"
        
        for directory in [self.contexts_dir, self.snapshots_dir, self.cache_dir]:
            directory.mkdir(exist_ok=True)
        
        # Base de datos SQLite para metadatos
        self.db_path = self.config_dir / "context_metadata.db"
        self.db_lock = threading.Lock()
        
        # Configuración
        self.config = {
            "max_memory_contexts": 50,
            "max_disk_contexts": 1000,
            "compression_enabled": True,
            "compression_threshold": 1024,  # bytes
            "auto_cleanup_enabled": True,
            "cleanup_interval": 3600,  # segundos
            "default_ttl": timedelta(days=7),
            "snapshot_interval": timedelta(hours=1),
            "max_snapshots": 24,
            "enable_smart_preloading": True,
            "preload_threshold": 0.8  # probabilidad
        }
        
        # Caché en memoria
        self.memory_cache: OrderedDict[str, ContextEntry] = OrderedDict()
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "compressions": 0,
            "decompressions": 0
        }
        
        # Sistema de predicción
        self.access_patterns: Dict[str, List[datetime]] = defaultdict(list)
        self.context_relationships: Dict[str, Set[str]] = defaultdict(set)
        
        # Executor para operaciones I/O
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Estado del sistema
        self.active_contexts: Set[str] = set()
        self.pending_snapshots: List[str] = []
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Inicializar base de datos
        self._init_database()
        
        # Cargar contextos existentes
        self._load_existing_contexts()
        
        # Iniciar tareas de mantenimiento
        self._start_maintenance_tasks()
        
        self.logger.info("🧠 Context Handler iniciado")
    
    async def store_context(
        self,
        context_id: str,
        context_type: str,
        data: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[List[str]] = None,
        ttl: Optional[timedelta] = None,
        compress: bool = True
    ) -> bool:
        """Almacena un contexto"""
        
        try:
            # Preparar metadatos
            metadata = metadata or {}
            tags = tags or []
            ttl = ttl or self.config["default_ttl"]
            
            # Calcular tamaño y hash
            data_str = json.dumps(data, sort_keys=True, default=str)
            size_bytes = len(data_str.encode('utf-8'))
            data_hash = hashlib.sha256(data_str.encode('utf-8')).hexdigest()
            
            # Verificar si ya existe contexto idéntico
            existing_entry = await self._find_identical_context(data_hash)
            if existing_entry:
                # Actualizar referencias en lugar de duplicar
                await self._update_context_reference(context_id, existing_entry.context_id)
                return True
            
            # Comprimir si es necesario
            compression_ratio = 1.0
            if compress and size_bytes > self.config["compression_threshold"]:
                compressed_data = await self._compress_data(data)
                compression_ratio = len(compressed_data) / size_bytes
                self.cache_stats["compressions"] += 1
            else:
                compressed_data = data
            
            # Crear entrada de contexto
            entry = ContextEntry(
                context_id=context_id,
                context_type=context_type,
                data=compressed_data,
                metadata={
                    **metadata,
                    "data_hash": data_hash,
                    "compressed": compress and size_bytes > self.config["compression_threshold"]
                },
                created_at=datetime.now(),
                last_accessed=datetime.now(),
                size_bytes=size_bytes,
                compression_ratio=compression_ratio,
                tags=tags,
                ttl=ttl
            )
            
            # Almacenar en memoria
            await self._store_in_memory(entry)
            
            # Almacenar en disco
            await self._store_on_disk(entry)
            
            # Actualizar base de datos
            await self._update_database(entry)
            
            # Registrar patrón de acceso
            self._record_access_pattern(context_id)
            
            # Marcar como activo
            self.active_contexts.add(context_id)
            
            self.logger.debug(f"💾 Contexto almacenado: {context_id} ({size_bytes} bytes)")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error almacenando contexto {context_id}: {e}")
            return False
    
    async def retrieve_context(
        self,
        context_id: str,
        include_metadata: bool = True
    ) -> Optional[Dict[str, Any]]:
        """Recupera un contexto"""
        
        try:
            # Buscar en memoria primero
            entry = self.memory_cache.get(context_id)
            
            if entry:
                self.cache_stats["hits"] += 1
                # Mover al final (LRU)
                self.memory_cache.move_to_end(context_id)
            else:
                self.cache_stats["misses"] += 1
                # Cargar desde disco
                entry = await self._load_from_disk(context_id)
                
                if entry:
                    # Agregar a memoria
                    await self._store_in_memory(entry)
            
            if not entry:
                return None
            
            # Actualizar estadísticas de acceso
            entry.last_accessed = datetime.now()
            entry.access_count += 1
            
            # Registrar patrón de acceso
            self._record_access_pattern(context_id)
            
            # Descomprimir si es necesario
            data = entry.data
            if entry.metadata.get("compressed", False):
                data = await self._decompress_data(data)
                self.cache_stats["decompressions"] += 1
            
            # Preparar resultado
            result = {
                "context_id": context_id,
                "context_type": entry.context_type,
                "data": data,
                "created_at": entry.created_at.isoformat(),
                "last_accessed": entry.last_accessed.isoformat(),
                "access_count": entry.access_count
            }
            
            if include_metadata:
                result["metadata"] = entry.metadata
                result["tags"] = entry.tags
                result["size_bytes"] = entry.size_bytes
                result["compression_ratio"] = entry.compression_ratio
            
            # Precargar contextos relacionados si está habilitado
            if self.config["enable_smart_preloading"]:
                await self._smart_preload_related_contexts(context_id)
            
            self.logger.debug(f"📖 Contexto recuperado: {context_id}")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error recuperando contexto {context_id}: {e}")
            return None
    
    async def query_contexts(self, query: ContextQuery) -> List[Dict[str, Any]]:
        """Busca contextos basado en criterios"""
        
        try:
            # Construir query SQL
            sql_query, params = self._build_sql_query(query)
            
            # Ejecutar query
            with self.db_lock:
                conn = sqlite3.connect(self.db_path)
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                cursor.execute(sql_query, params)
                rows = cursor.fetchall()
                
                conn.close()
            
            # Procesar resultados
            results = []
            for row in rows:
                context_id = row["context_id"]
                
                # Recuperar contexto completo si está en los primeros resultados
                if len(results) < 10:  # Limitar carga completa
                    context_data = await self.retrieve_context(context_id, include_metadata=True)
                    if context_data:
                        results.append(context_data)
                else:
                    # Solo metadatos para el resto
                    results.append({
                        "context_id": context_id,
                        "context_type": row["context_type"],
                        "created_at": row["created_at"],
                        "last_accessed": row["last_accessed"],
                        "access_count": row["access_count"],
                        "size_bytes": row["size_bytes"],
                        "tags": json.loads(row["tags"]) if row["tags"] else []
                    })
            
            self.logger.debug(f"🔍 Query ejecutada: {len(results)} resultados")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error en query de contextos: {e}")
            return []
    
    async def create_snapshot(
        self,
        snapshot_id: Optional[str] = None,
        include_contexts: Optional[List[str]] = None
    ) -> str:
        """Crea un snapshot del estado actual"""
        
        try:
            if not snapshot_id:
                snapshot_id = f"snapshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Capturar estado del proyecto
            project_state = await self._capture_project_state()
            
            # Calcular checksums de archivos
            file_checksums = await self._calculate_file_checksums()
            
            # Capturar estado del entorno
            environment_state = await self._capture_environment_state()
            
            # Determinar contextos activos
            if include_contexts:
                active_contexts = include_contexts
            else:
                active_contexts = list(self.active_contexts)
            
            # Crear snapshot
            snapshot = ContextSnapshot(
                snapshot_id=snapshot_id,
                timestamp=datetime.now(),
                project_state=project_state,
                file_checksums=file_checksums,
                environment_state=environment_state,
                active_contexts=active_contexts,
                metadata={
                    "total_contexts": len(active_contexts),
                    "memory_usage": len(self.memory_cache),
                    "cache_stats": self.cache_stats.copy()
                }
            )
            
            # Guardar snapshot
            await self._save_snapshot(snapshot)
            
            # Limpiar snapshots antiguos
            await self._cleanup_old_snapshots()
            
            self.logger.info(f"📸 Snapshot creado: {snapshot_id}")
            
            return snapshot_id
            
        except Exception as e:
            self.logger.error(f"Error creando snapshot: {e}")
            return ""
    
    async def restore_snapshot(self, snapshot_id: str) -> bool:
        """Restaura un snapshot"""
        
        try:
            # Cargar snapshot
            snapshot = await self._load_snapshot(snapshot_id)
            if not snapshot:
                return False
            
            # Restaurar estado del proyecto
            await self._restore_project_state(snapshot.project_state)
            
            # Verificar archivos
            await self._verify_file_checksums(snapshot.file_checksums)
            
            # Restaurar entorno
            await self._restore_environment_state(snapshot.environment_state)
            
            # Cargar contextos activos
            for context_id in snapshot.active_contexts:
                await self.retrieve_context(context_id)
            
            # Actualizar estado activo
            self.active_contexts = set(snapshot.active_contexts)
            
            self.logger.info(f"🔄 Snapshot restaurado: {snapshot_id}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error restaurando snapshot {snapshot_id}: {e}")
            return False
    
    async def optimize_contexts(self) -> Dict[str, Any]:
        """Optimiza el almacenamiento de contextos"""
        
        try:
            optimization_stats = {
                "contexts_processed": 0,
                "contexts_compressed": 0,
                "contexts_deduplicated": 0,
                "space_saved": 0,
                "time_taken": 0
            }
            
            start_time = datetime.now()
            
            # Obtener todos los contextos
            all_contexts = await self._get_all_context_ids()
            
            # Agrupar por hash para deduplicación
            hash_groups = defaultdict(list)
            
            for context_id in all_contexts:
                entry = await self._load_from_disk(context_id)
                if entry and "data_hash" in entry.metadata:
                    hash_groups[entry.metadata["data_hash"]].append(entry)
                
                optimization_stats["contexts_processed"] += 1
            
            # Deduplicar contextos idénticos
            for data_hash, entries in hash_groups.items():
                if len(entries) > 1:
                    # Mantener el más reciente, referenciar los demás
                    primary_entry = max(entries, key=lambda e: e.last_accessed)
                    
                    for entry in entries:
                        if entry.context_id != primary_entry.context_id:
                            await self._create_context_reference(
                                entry.context_id,
                                primary_entry.context_id
                            )
                            optimization_stats["contexts_deduplicated"] += 1
                            optimization_stats["space_saved"] += entry.size_bytes
            
            # Comprimir contextos grandes no comprimidos
            for context_id in all_contexts:
                entry = await self._load_from_disk(context_id)
                
                if (entry and 
                    not entry.metadata.get("compressed", False) and
                    entry.size_bytes > self.config["compression_threshold"]):
                    
                    # Comprimir
                    compressed_data = await self._compress_data(entry.data)
                    entry.data = compressed_data
                    entry.metadata["compressed"] = True
                    
                    old_size = entry.size_bytes
                    new_size = len(json.dumps(compressed_data, default=str).encode('utf-8'))
                    entry.compression_ratio = new_size / old_size
                    
                    # Guardar
                    await self._store_on_disk(entry)
                    
                    optimization_stats["contexts_compressed"] += 1
                    optimization_stats["space_saved"] += old_size - new_size
            
            # Limpiar contextos expirados
            expired_count = await self._cleanup_expired_contexts()
            
            optimization_stats["time_taken"] = (datetime.now() - start_time).total_seconds()
            optimization_stats["expired_contexts_removed"] = expired_count
            
            self.logger.info(f"⚡ Optimización completada: {optimization_stats}")
            
            return optimization_stats
            
        except Exception as e:
            self.logger.error(f"Error en optimización: {e}")
            return {"error": str(e)}
    
    async def get_context_analytics(self) -> Dict[str, Any]:
        """Obtiene analíticas de uso de contextos"""
        
        try:
            # Estadísticas básicas
            total_contexts = len(await self._get_all_context_ids())
            memory_contexts = len(self.memory_cache)
            
            # Estadísticas de acceso
            access_stats = await self._calculate_access_statistics()
            
            # Distribución por tipo
            type_distribution = await self._get_type_distribution()
            
            # Patrones de uso
            usage_patterns = self._analyze_usage_patterns()
            
            # Eficiencia de caché
            cache_efficiency = self._calculate_cache_efficiency()
            
            # Predicciones
            predictions = await self._generate_usage_predictions()
            
            analytics = {
                "overview": {
                    "total_contexts": total_contexts,
                    "memory_contexts": memory_contexts,
                    "active_contexts": len(self.active_contexts),
                    "cache_hit_rate": cache_efficiency["hit_rate"],
                    "average_compression_ratio": access_stats.get("avg_compression_ratio", 1.0)
                },
                "access_statistics": access_stats,
                "type_distribution": type_distribution,
                "usage_patterns": usage_patterns,
                "cache_efficiency": cache_efficiency,
                "predictions": predictions,
                "storage_stats": await self._get_storage_statistics(),
                "performance_metrics": {
                    "avg_retrieval_time": access_stats.get("avg_retrieval_time", 0),
                    "avg_storage_time": access_stats.get("avg_storage_time", 0),
                    "compression_efficiency": access_stats.get("compression_efficiency", 0)
                }
            }
            
            return analytics
            
        except Exception as e:
            self.logger.error(f"Error generando analíticas: {e}")
            return {"error": str(e)}
    
    def get_system_status(self) -> Dict[str, Any]:
        """Obtiene el estado del sistema de contextos"""
        
        return {
            "memory_cache_size": len(self.memory_cache),
            "active_contexts": len(self.active_contexts),
            "cache_stats": self.cache_stats.copy(),
            "config": self.config.copy(),
            "storage_paths": {
                "contexts": str(self.contexts_dir),
                "snapshots": str(self.snapshots_dir),
                "cache": str(self.cache_dir),
                "database": str(self.db_path)
            }
        }
    
    # Métodos auxiliares
    
    def _init_database(self):
        """Inicializa la base de datos SQLite"""
        
        with self.db_lock:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Tabla de contextos
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contexts (
                    context_id TEXT PRIMARY KEY,
                    context_type TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    last_accessed TEXT NOT NULL,
                    access_count INTEGER DEFAULT 0,
                    size_bytes INTEGER DEFAULT 0,
                    compression_ratio REAL DEFAULT 1.0,
                    tags TEXT,
                    metadata TEXT,
                    ttl_expires TEXT,
                    data_hash TEXT,
                    reference_to TEXT
                )
            """)
            
            # Tabla de snapshots
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS snapshots (
                    snapshot_id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    metadata TEXT,
                    file_path TEXT
                )
            """)
            
            # Índices para optimización
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_context_type ON contexts(context_type)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_last_accessed ON contexts(last_accessed)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_data_hash ON contexts(data_hash)")
            
            conn.commit()
            conn.close()
    
    async def _store_in_memory(self, entry: ContextEntry):
        """Almacena entrada en caché de memoria"""
        
        # Verificar límite de memoria
        while len(self.memory_cache) >= self.config["max_memory_contexts"]:
            # Evict LRU
            oldest_id, _ = self.memory_cache.popitem(last=False)
            self.cache_stats["evictions"] += 1
            self.logger.debug(f"🗑️ Contexto evictado de memoria: {oldest_id}")
        
        # Agregar nueva entrada
        self.memory_cache[entry.context_id] = entry
    
    async def _store_on_disk(self, entry: ContextEntry):
        """Almacena entrada en disco"""
        
        file_path = self.contexts_dir / f"{entry.context_id}.pkl"
        
        # Usar executor para I/O no bloqueante
        await asyncio.get_event_loop().run_in_executor(
            self.executor,
            self._write_context_file,
            file_path,
            entry
        )
    
    def _write_context_file(self, file_path: Path, entry: ContextEntry):
        """Escribe archivo de contexto (ejecutado en thread pool)"""
        
        try:
            with open(file_path, 'wb') as f:
                pickle.dump(entry, f, protocol=pickle.HIGHEST_PROTOCOL)
        except Exception as e:
            self.logger.error(f"Error escribiendo contexto {entry.context_id}: {e}")
    
    async def _load_from_disk(self, context_id: str) -> Optional[ContextEntry]:
        """Carga entrada desde disco"""
        
        file_path = self.contexts_dir / f"{context_id}.pkl"
        
        if not file_path.exists():
            return None
        
        # Usar executor para I/O no bloqueante
        return await asyncio.get_event_loop().run_in_executor(
            self.executor,
            self._read_context_file,
            file_path
        )
    
    def _read_context_file(self, file_path: Path) -> Optional[ContextEntry]:
        """Lee archivo de contexto (ejecutado en thread pool)"""
        
        try:
            with open(file_path, 'rb') as f:
                return pickle.load(f)
        except Exception as e:
            self.logger.error(f"Error leyendo contexto {file_path.stem}: {e}")
            return None
    
    async def _compress_data(self, data: Any) -> bytes:
        """Comprime datos usando gzip"""
        
        json_str = json.dumps(data, sort_keys=True, default=str)
        json_bytes = json_str.encode('utf-8')
        
        return await asyncio.get_event_loop().run_in_executor(
            self.executor,
            gzip.compress,
            json_bytes,
            self.config.get("compression_level", 6)
        )
    
    async def _decompress_data(self, compressed_data: bytes) -> Any:
        """Descomprime datos"""
        
        json_bytes = await asyncio.get_event_loop().run_in_executor(
            self.executor,
            gzip.decompress,
            compressed_data
        )
        
        json_str = json_bytes.decode('utf-8')
        return json.loads(json_str)
    
    def _record_access_pattern(self, context_id: str):
        """Registra patrón de acceso"""
        
        now = datetime.now()
        self.access_patterns[context_id].append(now)
        
        # Mantener solo los últimos 100 accesos
        if len(self.access_patterns[context_id]) > 100:
            self.access_patterns[context_id] = self.access_patterns[context_id][-100:]
    
    async def _smart_preload_related_contexts(self, context_id: str):
        """Precarga contextos relacionados inteligentemente"""
        
        # Obtener contextos relacionados
        related_contexts = self.context_relationships.get(context_id, set())
        
        # Calcular probabilidades de acceso
        for related_id in related_contexts:
            probability = self._calculate_access_probability(related_id)
            
            if probability > self.config["preload_threshold"]:
                # Precargar si no está en memoria
                if related_id not in self.memory_cache:
                    entry = await self._load_from_disk(related_id)
                    if entry:
                        await self._store_in_memory(entry)
                        self.logger.debug(f"🔮 Contexto precargado: {related_id}")
    
    def _calculate_access_probability(self, context_id: str) -> float:
        """Calcula probabilidad de acceso basada en patrones históricos"""
        
        accesses = self.access_patterns.get(context_id, [])
        
        if not accesses:
            return 0.0
        
        # Calcular frecuencia reciente
        recent_accesses = [
            access for access in accesses
            if (datetime.now() - access).total_seconds() < 3600  # última hora
        ]
        
        # Probabilidad basada en frecuencia y recencia
        frequency_score = len(recent_accesses) / 10.0  # normalizar
        recency_score = 1.0 if recent_accesses else 0.0
        
        return min(frequency_score * 0.7 + recency_score * 0.3, 1.0)
    
    def _start_maintenance_tasks(self):
        """Inicia tareas de mantenimiento en background"""
        
        if self.config["auto_cleanup_enabled"]:
            # Programar limpieza automática
            threading.Timer(
                self.config["cleanup_interval"],
                self._periodic_cleanup
            ).start()
        
        # Programar snapshots automáticos
        if self.config["snapshot_interval"]:
            threading.Timer(
                self.config["snapshot_interval"].total_seconds(),
                self._periodic_snapshot
            ).start()
    
    def _periodic_cleanup(self):
        """Limpieza periódica"""
        
        try:
            asyncio.create_task(self._cleanup_expired_contexts())
            asyncio.create_task(self.optimize_contexts())
            
            # Reprogramar
            threading.Timer(
                self.config["cleanup_interval"],
                self._periodic_cleanup
            ).start()
            
        except Exception as e:
            self.logger.error(f"Error en limpieza periódica: {e}")
    
    def _periodic_snapshot(self):
        """Snapshot periódico"""
        
        try:
            asyncio.create_task(self.create_snapshot())
            
            # Reprogramar
            threading.Timer(
                self.config["snapshot_interval"].total_seconds(),
                self._periodic_snapshot
            ).start()
            
        except Exception as e:
            self.logger.error(f"Error en snapshot periódico: {e}")
    
    async def shutdown(self):
        """Cierra el manejador de contexto limpiamente"""
        
        # Crear snapshot final
        await self.create_snapshot("shutdown_snapshot")
        
        # Cerrar executor
        self.executor.shutdown(wait=True)
        
        self.logger.info("🛑 Context Handler cerrado")

def main():
    """Función principal para testing"""
    async def test_context_handler():
        handler = ContextHandler()
        
        # Almacenar contexto de prueba
        test_data = {
            "project": "TecnoMundo",
            "component": "authentication",
            "state": {"logged_in": True, "user_id": 123}
        }
        
        success = await handler.store_context(
            context_id="test_auth_context",
            context_type="authentication",
            data=test_data,
            tags=["auth", "user", "session"]
        )
        
        print(f"💾 Contexto almacenado: {success}")
        
        # Recuperar contexto
        retrieved = await handler.retrieve_context("test_auth_context")
        print(f"📖 Contexto recuperado: {retrieved is not None}")
        
        # Crear snapshot
        snapshot_id = await handler.create_snapshot()
        print(f"📸 Snapshot creado: {snapshot_id}")
        
        # Obtener analíticas
        analytics = await handler.get_context_analytics()
        print(f"📊 Analíticas: {analytics}")
        
        # Cerrar handler
        await handler.shutdown()
    
    asyncio.run(test_context_handler())

if __name__ == "__main__":
    main()