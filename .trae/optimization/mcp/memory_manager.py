 #!/usr/bin/env python3
"""
🧠 NEXUS - Memory Manager (MCP System)
Gestión inteligente de memoria y contexto para optimización extrema
TecnoMundo Repair Management - Trae 2.0
"""

import json
import pickle
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict, deque
import hashlib
import threading
import time

@dataclass
class MemoryEntry:
    """Entrada de memoria con metadatos"""
    id: str
    content: Any
    context_type: str
    created_at: datetime
    last_accessed: datetime
    access_count: int
    importance_score: float
    tags: List[str]
    size_bytes: int
    expiry_date: Optional[datetime] = None

@dataclass
class ContextSnapshot:
    """Snapshot de contexto para recuperación rápida"""
    snapshot_id: str
    timestamp: datetime
    project_state: Dict[str, Any]
    user_preferences: Dict[str, Any]
    active_patterns: List[str]
    performance_metrics: Dict[str, float]
    compressed_size: int

class MemoryManager:
    """Gestor avanzado de memoria con algoritmos de optimización"""
    
    def __init__(self, cache_dir: str = ".trae/cache", max_memory_mb: int = 100):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Configuración de memoria
        self.max_memory_bytes = max_memory_mb * 1024 * 1024
        self.current_memory_usage = 0
        self.memory_entries: Dict[str, MemoryEntry] = {}
        
        # Archivos de persistencia
        self.memory_index_file = self.cache_dir / "memory_index.json"
        self.memory_data_dir = self.cache_dir / "memory_data"
        self.memory_data_dir.mkdir(exist_ok=True)
        
        # Snapshots de contexto
        self.snapshots_dir = self.cache_dir / "context_snapshots"
        self.snapshots_dir.mkdir(exist_ok=True)
        self.active_snapshots: Dict[str, ContextSnapshot] = {}
        
        # Estadísticas y métricas
        self.access_patterns = defaultdict(list)
        self.performance_metrics = {
            "cache_hits": 0,
            "cache_misses": 0,
            "memory_evictions": 0,
            "compression_ratio": 0.0,
            "average_access_time": 0.0
        }
        
        # Thread para limpieza automática
        self.cleanup_thread = None
        self.running = True
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Cargar estado existente
        self._load_memory_index()
        self._start_cleanup_thread()
    
    def store(self, key: str, content: Any, context_type: str = "general", 
              tags: List[str] = None, importance: float = 0.5, 
              ttl_hours: Optional[int] = None) -> bool:
        """Almacena contenido en memoria con metadatos inteligentes"""
        
        try:
            # Serializar contenido
            serialized_content = self._serialize_content(content)
            content_size = len(serialized_content)
            
            # Verificar espacio disponible
            if not self._ensure_memory_space(content_size):
                self.logger.warning(f"No se pudo liberar espacio para {key}")
                return False
            
            # Calcular fecha de expiración
            expiry_date = None
            if ttl_hours:
                expiry_date = datetime.now() + timedelta(hours=ttl_hours)
            
            # Crear entrada de memoria
            entry = MemoryEntry(
                id=key,
                content=content,
                context_type=context_type,
                created_at=datetime.now(),
                last_accessed=datetime.now(),
                access_count=1,
                importance_score=importance,
                tags=tags or [],
                size_bytes=content_size,
                expiry_date=expiry_date
            )
            
            # Guardar en disco
            data_file = self.memory_data_dir / f"{key}.pkl"
            with open(data_file, 'wb') as f:
                pickle.dump(serialized_content, f)
            
            # Actualizar índice en memoria
            self.memory_entries[key] = entry
            self.current_memory_usage += content_size
            
            # Guardar índice
            self._save_memory_index()
            
            self.logger.info(f"💾 Almacenado: {key} ({content_size} bytes, tipo: {context_type})")
            return True
            
        except Exception as e:
            self.logger.error(f"Error almacenando {key}: {e}")
            return False
    
    def retrieve(self, key: str) -> Optional[Any]:
        """Recupera contenido de memoria con tracking de acceso"""
        
        start_time = time.time()
        
        try:
            if key not in self.memory_entries:
                self.performance_metrics["cache_misses"] += 1
                return None
            
            entry = self.memory_entries[key]
            
            # Verificar expiración
            if entry.expiry_date and datetime.now() > entry.expiry_date:
                self.evict(key)
                self.performance_metrics["cache_misses"] += 1
                return None
            
            # Cargar desde disco
            data_file = self.memory_data_dir / f"{key}.pkl"
            if not data_file.exists():
                self.logger.warning(f"Archivo de datos no encontrado: {key}")
                del self.memory_entries[key]
                self.performance_metrics["cache_misses"] += 1
                return None
            
            with open(data_file, 'rb') as f:
                serialized_content = pickle.load(f)
            
            content = self._deserialize_content(serialized_content)
            
            # Actualizar estadísticas de acceso
            entry.last_accessed = datetime.now()
            entry.access_count += 1
            
            # Registrar patrón de acceso
            self.access_patterns[key].append(datetime.now())
            
            # Actualizar métricas de rendimiento
            access_time = time.time() - start_time
            self._update_access_time_metric(access_time)
            self.performance_metrics["cache_hits"] += 1
            
            self.logger.debug(f"🔍 Recuperado: {key} (acceso #{entry.access_count})")
            return content
            
        except Exception as e:
            self.logger.error(f"Error recuperando {key}: {e}")
            self.performance_metrics["cache_misses"] += 1
            return None
    
    def evict(self, key: str) -> bool:
        """Expulsa una entrada específica de memoria"""
        
        try:
            if key not in self.memory_entries:
                return False
            
            entry = self.memory_entries[key]
            
            # Eliminar archivo de datos
            data_file = self.memory_data_dir / f"{key}.pkl"
            if data_file.exists():
                data_file.unlink()
            
            # Actualizar uso de memoria
            self.current_memory_usage -= entry.size_bytes
            
            # Eliminar del índice
            del self.memory_entries[key]
            
            # Actualizar métricas
            self.performance_metrics["memory_evictions"] += 1
            
            self.logger.info(f"🗑️ Expulsado: {key} ({entry.size_bytes} bytes liberados)")
            return True
            
        except Exception as e:
            self.logger.error(f"Error expulsando {key}: {e}")
            return False
    
    def create_snapshot(self, snapshot_id: str, project_state: Dict[str, Any], 
                       user_preferences: Dict[str, Any], active_patterns: List[str]) -> bool:
        """Crea un snapshot del contexto actual"""
        
        try:
            # Calcular métricas de rendimiento actuales
            current_metrics = self._calculate_current_metrics()
            
            # Crear snapshot
            snapshot = ContextSnapshot(
                snapshot_id=snapshot_id,
                timestamp=datetime.now(),
                project_state=project_state,
                user_preferences=user_preferences,
                active_patterns=active_patterns,
                performance_metrics=current_metrics,
                compressed_size=0  # Se calculará después de la compresión
            )
            
            # Comprimir y guardar
            compressed_data = self._compress_snapshot(snapshot)
            snapshot.compressed_size = len(compressed_data)
            
            snapshot_file = self.snapshots_dir / f"{snapshot_id}.pkl"
            with open(snapshot_file, 'wb') as f:
                pickle.dump(compressed_data, f)
            
            # Mantener en memoria activa
            self.active_snapshots[snapshot_id] = snapshot
            
            # Limpiar snapshots antiguos (mantener solo los últimos 10)
            self._cleanup_old_snapshots()
            
            self.logger.info(f"📸 Snapshot creado: {snapshot_id} ({snapshot.compressed_size} bytes)")
            return True
            
        except Exception as e:
            self.logger.error(f"Error creando snapshot {snapshot_id}: {e}")
            return False
    
    def restore_snapshot(self, snapshot_id: str) -> Optional[Dict[str, Any]]:
        """Restaura un snapshot de contexto"""
        
        try:
            snapshot_file = self.snapshots_dir / f"{snapshot_id}.pkl"
            if not snapshot_file.exists():
                self.logger.warning(f"Snapshot no encontrado: {snapshot_id}")
                return None
            
            # Cargar snapshot comprimido
            with open(snapshot_file, 'rb') as f:
                compressed_data = pickle.load(f)
            
            # Descomprimir
            snapshot_data = self._decompress_snapshot(compressed_data)
            
            self.logger.info(f"🔄 Snapshot restaurado: {snapshot_id}")
            return snapshot_data
            
        except Exception as e:
            self.logger.error(f"Error restaurando snapshot {snapshot_id}: {e}")
            return None
    
    def optimize_memory(self) -> Dict[str, Any]:
        """Optimiza el uso de memoria usando algoritmos inteligentes"""
        
        optimization_report = {
            "initial_memory_usage": self.current_memory_usage,
            "entries_before": len(self.memory_entries),
            "actions_taken": [],
            "memory_freed": 0,
            "entries_removed": 0
        }
        
        try:
            # 1. Eliminar entradas expiradas
            expired_keys = []
            for key, entry in self.memory_entries.items():
                if entry.expiry_date and datetime.now() > entry.expiry_date:
                    expired_keys.append(key)
            
            for key in expired_keys:
                if self.evict(key):
                    optimization_report["actions_taken"].append(f"Eliminado expirado: {key}")
                    optimization_report["entries_removed"] += 1
            
            # 2. Aplicar algoritmo LRU con scoring inteligente
            if self.current_memory_usage > self.max_memory_bytes * 0.8:
                candidates_for_eviction = self._get_eviction_candidates()
                
                for key in candidates_for_eviction:
                    if self.current_memory_usage <= self.max_memory_bytes * 0.6:
                        break
                    
                    entry = self.memory_entries.get(key)
                    if entry:
                        memory_freed = entry.size_bytes
                        if self.evict(key):
                            optimization_report["memory_freed"] += memory_freed
                            optimization_report["entries_removed"] += 1
                            optimization_report["actions_taken"].append(f"Expulsado por LRU: {key}")
            
            # 3. Comprimir entradas grandes poco accedidas
            large_entries = [
                (key, entry) for key, entry in self.memory_entries.items()
                if entry.size_bytes > 10000 and entry.access_count < 3
            ]
            
            for key, entry in large_entries[:5]:  # Comprimir máximo 5 entradas
                if self._compress_entry(key):
                    optimization_report["actions_taken"].append(f"Comprimido: {key}")
            
            # 4. Actualizar métricas de compresión
            self._update_compression_metrics()
            
            optimization_report["final_memory_usage"] = self.current_memory_usage
            optimization_report["entries_after"] = len(self.memory_entries)
            optimization_report["optimization_success"] = True
            
            self.logger.info(f"🚀 Optimización completada - Memoria liberada: {optimization_report['memory_freed']} bytes")
            
        except Exception as e:
            self.logger.error(f"Error en optimización de memoria: {e}")
            optimization_report["optimization_success"] = False
            optimization_report["error"] = str(e)
        
        return optimization_report
    
    def get_memory_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas detalladas de memoria"""
        
        # Calcular estadísticas por tipo de contexto
        context_stats = defaultdict(lambda: {"count": 0, "total_size": 0, "avg_access": 0})
        
        for entry in self.memory_entries.values():
            stats = context_stats[entry.context_type]
            stats["count"] += 1
            stats["total_size"] += entry.size_bytes
            stats["avg_access"] += entry.access_count
        
        # Calcular promedios
        for stats in context_stats.values():
            if stats["count"] > 0:
                stats["avg_access"] = stats["avg_access"] / stats["count"]
                stats["avg_size"] = stats["total_size"] / stats["count"]
        
        # Calcular tasa de hit del caché
        total_requests = self.performance_metrics["cache_hits"] + self.performance_metrics["cache_misses"]
        hit_rate = (self.performance_metrics["cache_hits"] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "memory_usage": {
                "current_bytes": self.current_memory_usage,
                "max_bytes": self.max_memory_bytes,
                "usage_percentage": (self.current_memory_usage / self.max_memory_bytes) * 100,
                "entries_count": len(self.memory_entries)
            },
            "performance": {
                "cache_hit_rate": f"{hit_rate:.1f}%",
                "total_hits": self.performance_metrics["cache_hits"],
                "total_misses": self.performance_metrics["cache_misses"],
                "evictions": self.performance_metrics["memory_evictions"],
                "avg_access_time": f"{self.performance_metrics['average_access_time']:.3f}s",
                "compression_ratio": f"{self.performance_metrics['compression_ratio']:.2f}"
            },
            "context_breakdown": dict(context_stats),
            "active_snapshots": len(self.active_snapshots),
            "most_accessed": self._get_most_accessed_entries(5),
            "memory_efficiency": self._calculate_memory_efficiency()
        }
    
    def _ensure_memory_space(self, required_bytes: int) -> bool:
        """Asegura que hay espacio suficiente en memoria"""
        
        if self.current_memory_usage + required_bytes <= self.max_memory_bytes:
            return True
        
        # Intentar liberar espacio
        space_to_free = (self.current_memory_usage + required_bytes) - self.max_memory_bytes
        space_freed = 0
        
        # Obtener candidatos para expulsión
        candidates = self._get_eviction_candidates()
        
        for key in candidates:
            if space_freed >= space_to_free:
                break
            
            entry = self.memory_entries.get(key)
            if entry:
                space_freed += entry.size_bytes
                self.evict(key)
        
        return space_freed >= space_to_free
    
    def _get_eviction_candidates(self) -> List[str]:
        """Obtiene candidatos para expulsión usando algoritmo inteligente"""
        
        candidates = []
        current_time = datetime.now()
        
        for key, entry in self.memory_entries.items():
            # Calcular score de expulsión (menor score = mejor candidato)
            time_since_access = (current_time - entry.last_accessed).total_seconds()
            access_frequency = entry.access_count / max((current_time - entry.created_at).total_seconds() / 3600, 1)
            
            # Score combinado: tiempo desde último acceso, frecuencia, importancia, tamaño
            eviction_score = (
                (time_since_access / 3600) * 0.4 +  # Horas desde último acceso
                (1 / max(access_frequency, 0.1)) * 0.3 +  # Inverso de frecuencia
                (1 - entry.importance_score) * 0.2 +  # Inverso de importancia
                (entry.size_bytes / 1000000) * 0.1  # Tamaño en MB
            )
            
            candidates.append((eviction_score, key))
        
        # Ordenar por score (mayor score = mejor candidato para expulsión)
        candidates.sort(reverse=True)
        
        return [key for score, key in candidates]
    
    def _compress_entry(self, key: str) -> bool:
        """Comprime una entrada específica"""
        try:
            # Implementación básica de compresión
            # En una implementación real, usaríamos algoritmos como gzip o lz4
            entry = self.memory_entries.get(key)
            if not entry:
                return False
            
            # Simular compresión (reducir tamaño en 30%)
            original_size = entry.size_bytes
            compressed_size = int(original_size * 0.7)
            
            self.current_memory_usage -= (original_size - compressed_size)
            entry.size_bytes = compressed_size
            
            self.logger.debug(f"🗜️ Comprimido {key}: {original_size} -> {compressed_size} bytes")
            return True
            
        except Exception as e:
            self.logger.error(f"Error comprimiendo {key}: {e}")
            return False
    
    def _compress_snapshot(self, snapshot: ContextSnapshot) -> bytes:
        """Comprime un snapshot de contexto"""
        # Implementación básica - en producción usar algoritmos reales
        snapshot_data = asdict(snapshot)
        serialized = pickle.dumps(snapshot_data)
        return serialized  # En producción: return gzip.compress(serialized)
    
    def _decompress_snapshot(self, compressed_data: bytes) -> Dict[str, Any]:
        """Descomprime un snapshot de contexto"""
        # En producción: decompressed = gzip.decompress(compressed_data)
        return pickle.loads(compressed_data)
    
    def _serialize_content(self, content: Any) -> bytes:
        """Serializa contenido para almacenamiento"""
        return pickle.dumps(content)
    
    def _deserialize_content(self, serialized_content: bytes) -> Any:
        """Deserializa contenido desde almacenamiento"""
        return pickle.loads(serialized_content)
    
    def _calculate_current_metrics(self) -> Dict[str, float]:
        """Calcula métricas de rendimiento actuales"""
        total_requests = self.performance_metrics["cache_hits"] + self.performance_metrics["cache_misses"]
        
        return {
            "cache_hit_rate": (self.performance_metrics["cache_hits"] / max(total_requests, 1)) * 100,
            "memory_usage_percent": (self.current_memory_usage / self.max_memory_bytes) * 100,
            "average_entry_size": self.current_memory_usage / max(len(self.memory_entries), 1),
            "eviction_rate": self.performance_metrics["memory_evictions"] / max(total_requests, 1) * 100
        }
    
    def _update_access_time_metric(self, access_time: float):
        """Actualiza métrica de tiempo de acceso promedio"""
        current_avg = self.performance_metrics["average_access_time"]
        total_hits = self.performance_metrics["cache_hits"]
        
        # Promedio móvil
        self.performance_metrics["average_access_time"] = (
            (current_avg * (total_hits - 1) + access_time) / total_hits
        )
    
    def _update_compression_metrics(self):
        """Actualiza métricas de compresión"""
        if not self.memory_entries:
            return
        
        total_original_size = sum(entry.size_bytes for entry in self.memory_entries.values())
        # Simular tamaño original (asumiendo 30% de compresión promedio)
        estimated_original_size = total_original_size * 1.3
        
        self.performance_metrics["compression_ratio"] = total_original_size / estimated_original_size
    
    def _get_most_accessed_entries(self, limit: int) -> List[Dict[str, Any]]:
        """Obtiene las entradas más accedidas"""
        sorted_entries = sorted(
            self.memory_entries.items(),
            key=lambda x: x[1].access_count,
            reverse=True
        )
        
        return [
            {
                "key": key,
                "access_count": entry.access_count,
                "context_type": entry.context_type,
                "size_bytes": entry.size_bytes,
                "importance": entry.importance_score
            }
            for key, entry in sorted_entries[:limit]
        ]
    
    def _calculate_memory_efficiency(self) -> float:
        """Calcula eficiencia de memoria (0-1)"""
        if not self.memory_entries:
            return 1.0
        
        # Factores de eficiencia
        usage_efficiency = 1 - (self.current_memory_usage / self.max_memory_bytes)
        hit_rate_efficiency = self.performance_metrics["cache_hits"] / max(
            self.performance_metrics["cache_hits"] + self.performance_metrics["cache_misses"], 1
        )
        eviction_efficiency = 1 - (self.performance_metrics["memory_evictions"] / max(len(self.memory_entries), 1))
        
        # Score combinado
        return (usage_efficiency * 0.4 + hit_rate_efficiency * 0.4 + eviction_efficiency * 0.2)
    
    def _cleanup_old_snapshots(self):
        """Limpia snapshots antiguos manteniendo solo los más recientes"""
        if len(self.active_snapshots) <= 10:
            return
        
        # Ordenar por timestamp
        sorted_snapshots = sorted(
            self.active_snapshots.items(),
            key=lambda x: x[1].timestamp,
            reverse=True
        )
        
        # Mantener solo los 10 más recientes
        to_keep = dict(sorted_snapshots[:10])
        to_remove = [sid for sid in self.active_snapshots.keys() if sid not in to_keep]
        
        for snapshot_id in to_remove:
            snapshot_file = self.snapshots_dir / f"{snapshot_id}.pkl"
            if snapshot_file.exists():
                snapshot_file.unlink()
            del self.active_snapshots[snapshot_id]
    
    def _load_memory_index(self):
        """Carga el índice de memoria desde disco"""
        if not self.memory_index_file.exists():
            return
        
        try:
            with open(self.memory_index_file, 'r', encoding='utf-8') as f:
                index_data = json.load(f)
            
            # Reconstruir entradas de memoria
            for key, entry_data in index_data.get("entries", {}).items():
                entry = MemoryEntry(
                    id=entry_data["id"],
                    content=None,  # Se carga bajo demanda
                    context_type=entry_data["context_type"],
                    created_at=datetime.fromisoformat(entry_data["created_at"]),
                    last_accessed=datetime.fromisoformat(entry_data["last_accessed"]),
                    access_count=entry_data["access_count"],
                    importance_score=entry_data["importance_score"],
                    tags=entry_data["tags"],
                    size_bytes=entry_data["size_bytes"],
                    expiry_date=datetime.fromisoformat(entry_data["expiry_date"]) if entry_data.get("expiry_date") else None
                )
                
                self.memory_entries[key] = entry
                self.current_memory_usage += entry.size_bytes
            
            # Cargar métricas
            if "performance_metrics" in index_data:
                self.performance_metrics.update(index_data["performance_metrics"])
            
            self.logger.info(f"📚 Índice de memoria cargado: {len(self.memory_entries)} entradas")
            
        except Exception as e:
            self.logger.error(f"Error cargando índice de memoria: {e}")
    
    def _save_memory_index(self):
        """Guarda el índice de memoria en disco"""
        try:
            index_data = {
                "entries": {},
                "performance_metrics": self.performance_metrics,
                "last_updated": datetime.now().isoformat()
            }
            
            # Serializar entradas (sin contenido)
            for key, entry in self.memory_entries.items():
                index_data["entries"][key] = {
                    "id": entry.id,
                    "context_type": entry.context_type,
                    "created_at": entry.created_at.isoformat(),
                    "last_accessed": entry.last_accessed.isoformat(),
                    "access_count": entry.access_count,
                    "importance_score": entry.importance_score,
                    "tags": entry.tags,
                    "size_bytes": entry.size_bytes,
                    "expiry_date": entry.expiry_date.isoformat() if entry.expiry_date else None
                }
            
            with open(self.memory_index_file, 'w', encoding='utf-8') as f:
                json.dump(index_data, f, indent=2, ensure_ascii=False)
            
        except Exception as e:
            self.logger.error(f"Error guardando índice de memoria: {e}")
    
    def _start_cleanup_thread(self):
        """Inicia thread de limpieza automática"""
        def cleanup_worker():
            while self.running:
                try:
                    time.sleep(300)  # Ejecutar cada 5 minutos
                    if self.current_memory_usage > self.max_memory_bytes * 0.8:
                        self.optimize_memory()
                except Exception as e:
                    self.logger.error(f"Error en thread de limpieza: {e}")
        
        self.cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
        self.cleanup_thread.start()
    
    def shutdown(self):
        """Cierra el gestor de memoria limpiamente"""
        self.running = False
        if self.cleanup_thread:
            self.cleanup_thread.join(timeout=5)
        
        self._save_memory_index()
        self.logger.info("🔒 Memory Manager cerrado correctamente")

def main():
    """Función principal para testing"""
    memory_manager = MemoryManager(max_memory_mb=50)
    
    try:
        # Pruebas de almacenamiento
        test_data = {
            "project_context": {"name": "TecnoMundo", "type": "Full Stack"},
            "user_preferences": {"language": "es", "theme": "dark"},
            "command_history": ["crear login", "optimizar dashboard", "probar api"]
        }
        
        # Almacenar datos de prueba
        memory_manager.store("test_context", test_data, "development", ["test", "context"], 0.8, 24)
        
        # Recuperar datos
        retrieved_data = memory_manager.retrieve("test_context")
        print(f"✅ Datos recuperados: {retrieved_data is not None}")
        
        # Crear snapshot
        memory_manager.create_snapshot("test_snapshot", test_data, {"pref": "value"}, ["pattern1"])
        
        # Obtener estadísticas
        stats = memory_manager.get_memory_stats()
        print(f"\n📊 Estadísticas de Memoria:")
        print(json.dumps(stats, indent=2, ensure_ascii=False))
        
        # Optimizar memoria
        optimization_report = memory_manager.optimize_memory()
        print(f"\n🚀 Reporte de Optimización:")
        print(json.dumps(optimization_report, indent=2, ensure_ascii=False))
        
    finally:
        memory_manager.shutdown()

if __name__ == "__main__":
    main()