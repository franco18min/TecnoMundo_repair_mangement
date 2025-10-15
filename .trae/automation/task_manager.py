#!/usr/bin/env python3
"""
🤖 NEXUS - Task Manager
Gestor de tareas automatizado con preservación de contexto
TecnoMundo Repair Management - Trae 2.0
"""

import json
import uuid
import asyncio
import threading
from typing import Dict, List, Optional, Any, Callable, Union
from dataclasses import dataclass, asdict, field
from datetime import datetime, timedelta
from pathlib import Path
from enum import Enum
from collections import defaultdict, deque
import logging
import pickle
import hashlib

class TaskStatus(Enum):
    """Estados de las tareas"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"

class TaskPriority(Enum):
    """Prioridades de las tareas"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4
    CRITICAL = 5

class TaskType(Enum):
    """Tipos de tareas"""
    DEVELOPMENT = "development"
    DEBUGGING = "debugging"
    TESTING = "testing"
    OPTIMIZATION = "optimization"
    DOCUMENTATION = "documentation"
    DEPLOYMENT = "deployment"
    MAINTENANCE = "maintenance"

@dataclass
class TaskContext:
    """Contexto de una tarea"""
    task_id: str
    project_state: Dict[str, Any]
    file_states: Dict[str, str]  # archivo -> hash
    environment_vars: Dict[str, str]
    dependencies: List[str]
    cache_keys: List[str]
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class Task:
    """Definición de una tarea"""
    task_id: str
    name: str
    description: str
    task_type: TaskType
    priority: TaskPriority
    status: TaskStatus
    
    # Configuración de ejecución
    command: Optional[str] = None
    function: Optional[Callable] = None
    parameters: Dict[str, Any] = field(default_factory=dict)
    
    # Dependencias y contexto
    dependencies: List[str] = field(default_factory=list)
    context: Optional[TaskContext] = None
    
    # Tiempos y métricas
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_duration: Optional[timedelta] = None
    actual_duration: Optional[timedelta] = None
    
    # Resultados y logs
    result: Optional[Any] = None
    error: Optional[str] = None
    logs: List[str] = field(default_factory=list)
    
    # Configuración de reintentos
    max_retries: int = 3
    retry_count: int = 0
    retry_delay: timedelta = field(default_factory=lambda: timedelta(seconds=30))
    
    # Metadatos
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TaskFlow:
    """Flujo de tareas relacionadas"""
    flow_id: str
    name: str
    description: str
    tasks: List[str]  # IDs de tareas
    execution_order: List[List[str]]  # Grupos de tareas que pueden ejecutarse en paralelo
    status: TaskStatus
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

class TaskManager:
    """Gestor de tareas automatizado con preservación de contexto"""
    
    def __init__(self, config_dir: str = ".trae/automation"):
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # Archivos de persistencia
        self.tasks_file = self.config_dir / "tasks.json"
        self.flows_file = self.config_dir / "task_flows.json"
        self.contexts_dir = self.config_dir / "contexts"
        self.contexts_dir.mkdir(exist_ok=True)
        
        # Estado del gestor
        self.tasks: Dict[str, Task] = {}
        self.task_flows: Dict[str, TaskFlow] = {}
        self.running_tasks: Dict[str, asyncio.Task] = {}
        self.task_queue: deque = deque()
        
        # Configuración
        self.config = {
            "max_concurrent_tasks": 5,
            "auto_retry_failed": True,
            "context_preservation": True,
            "auto_cleanup_completed": False,
            "task_timeout": 3600,  # 1 hora
            "context_cache_size": 100,
            "enable_task_scheduling": True
        }
        
        # Sistema de eventos
        self.event_handlers: Dict[str, List[Callable]] = defaultdict(list)
        
        # Métricas
        self.metrics = {
            "tasks_created": 0,
            "tasks_completed": 0,
            "tasks_failed": 0,
            "average_execution_time": 0.0,
            "context_cache_hits": 0,
            "context_cache_misses": 0
        }
        
        # Caché de contextos
        self.context_cache: Dict[str, TaskContext] = {}
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Cargar estado persistente
        self._load_persistent_state()
        
        # Iniciar procesamiento de tareas
        self.processing_active = True
        self.processing_task = asyncio.create_task(self._process_task_queue())
        
        self.logger.info("🤖 Task Manager iniciado")
    
    async def create_task(
        self,
        name: str,
        description: str,
        task_type: TaskType,
        priority: TaskPriority = TaskPriority.MEDIUM,
        command: Optional[str] = None,
        function: Optional[Callable] = None,
        parameters: Optional[Dict[str, Any]] = None,
        dependencies: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        estimated_duration: Optional[timedelta] = None,
        preserve_context: bool = True
    ) -> str:
        """Crea una nueva tarea"""
        
        task_id = str(uuid.uuid4())
        
        # Crear contexto si está habilitado
        context = None
        if preserve_context and self.config["context_preservation"]:
            context = await self._capture_current_context(task_id)
        
        task = Task(
            task_id=task_id,
            name=name,
            description=description,
            task_type=task_type,
            priority=priority,
            status=TaskStatus.PENDING,
            command=command,
            function=function,
            parameters=parameters or {},
            dependencies=dependencies or [],
            context=context,
            estimated_duration=estimated_duration,
            tags=tags or [],
            metadata={}
        )
        
        self.tasks[task_id] = task
        self.metrics["tasks_created"] += 1
        
        # Agregar a la cola de procesamiento
        self.task_queue.append(task_id)
        
        # Emitir evento
        await self._emit_event("task_created", {"task_id": task_id, "task": task})
        
        self.logger.info(f"📝 Tarea creada: {name} ({task_id[:8]})")
        
        # Guardar estado
        await self._save_persistent_state()
        
        return task_id
    
    async def create_task_flow(
        self,
        name: str,
        description: str,
        task_definitions: List[Dict[str, Any]],
        execution_strategy: str = "sequential"
    ) -> str:
        """Crea un flujo de tareas relacionadas"""
        
        flow_id = str(uuid.uuid4())
        
        # Crear tareas del flujo
        task_ids = []
        for task_def in task_definitions:
            task_id = await self.create_task(**task_def)
            task_ids.append(task_id)
        
        # Determinar orden de ejecución
        if execution_strategy == "sequential":
            execution_order = [[task_id] for task_id in task_ids]
        elif execution_strategy == "parallel":
            execution_order = [task_ids]
        else:  # custom order
            execution_order = task_def.get("execution_order", [[task_id] for task_id in task_ids])
        
        # Configurar dependencias
        for i, group in enumerate(execution_order[1:], 1):
            prev_group = execution_order[i-1]
            for task_id in group:
                if task_id in self.tasks:
                    self.tasks[task_id].dependencies.extend(prev_group)
        
        flow = TaskFlow(
            flow_id=flow_id,
            name=name,
            description=description,
            tasks=task_ids,
            execution_order=execution_order,
            status=TaskStatus.PENDING
        )
        
        self.task_flows[flow_id] = flow
        
        # Emitir evento
        await self._emit_event("flow_created", {"flow_id": flow_id, "flow": flow})
        
        self.logger.info(f"🔄 Flujo creado: {name} ({len(task_ids)} tareas)")
        
        return flow_id
    
    async def execute_task(self, task_id: str) -> Dict[str, Any]:
        """Ejecuta una tarea específica"""
        
        if task_id not in self.tasks:
            raise ValueError(f"Tarea no encontrada: {task_id}")
        
        task = self.tasks[task_id]
        
        # Verificar dependencias
        if not await self._check_dependencies(task):
            return {
                "success": False,
                "error": "Dependencias no satisfechas",
                "task_id": task_id
            }
        
        # Restaurar contexto si existe
        if task.context and self.config["context_preservation"]:
            await self._restore_context(task.context)
        
        # Marcar como en progreso
        task.status = TaskStatus.IN_PROGRESS
        task.started_at = datetime.now()
        
        # Emitir evento
        await self._emit_event("task_started", {"task_id": task_id, "task": task})
        
        try:
            # Ejecutar la tarea
            if task.function:
                result = await self._execute_function(task)
            elif task.command:
                result = await self._execute_command(task)
            else:
                raise ValueError("Tarea sin función o comando definido")
            
            # Marcar como completada
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now()
            task.actual_duration = task.completed_at - task.started_at
            task.result = result
            
            self.metrics["tasks_completed"] += 1
            
            # Actualizar tiempo promedio de ejecución
            if task.actual_duration:
                total_time = (
                    self.metrics["average_execution_time"] * 
                    (self.metrics["tasks_completed"] - 1) +
                    task.actual_duration.total_seconds()
                )
                self.metrics["average_execution_time"] = total_time / self.metrics["tasks_completed"]
            
            # Emitir evento
            await self._emit_event("task_completed", {"task_id": task_id, "task": task, "result": result})
            
            self.logger.info(f"✅ Tarea completada: {task.name} ({task_id[:8]})")
            
            return {
                "success": True,
                "result": result,
                "task_id": task_id,
                "execution_time": task.actual_duration.total_seconds() if task.actual_duration else 0
            }
            
        except Exception as e:
            # Marcar como fallida
            task.status = TaskStatus.FAILED
            task.error = str(e)
            task.completed_at = datetime.now()
            
            self.metrics["tasks_failed"] += 1
            
            # Emitir evento
            await self._emit_event("task_failed", {"task_id": task_id, "task": task, "error": str(e)})
            
            self.logger.error(f"❌ Tarea fallida: {task.name} ({task_id[:8]}) - {e}")
            
            # Intentar reintento si está configurado
            if task.retry_count < task.max_retries and self.config["auto_retry_failed"]:
                await self._schedule_retry(task)
            
            return {
                "success": False,
                "error": str(e),
                "task_id": task_id
            }
        
        finally:
            # Guardar estado
            await self._save_persistent_state()
    
    async def execute_flow(self, flow_id: str) -> Dict[str, Any]:
        """Ejecuta un flujo de tareas"""
        
        if flow_id not in self.task_flows:
            raise ValueError(f"Flujo no encontrado: {flow_id}")
        
        flow = self.task_flows[flow_id]
        flow.status = TaskStatus.IN_PROGRESS
        flow.started_at = datetime.now()
        
        # Emitir evento
        await self._emit_event("flow_started", {"flow_id": flow_id, "flow": flow})
        
        try:
            results = {}
            
            # Ejecutar grupos de tareas en orden
            for group in flow.execution_order:
                # Ejecutar tareas del grupo en paralelo
                group_tasks = []
                for task_id in group:
                    if task_id in self.tasks:
                        group_tasks.append(self.execute_task(task_id))
                
                # Esperar a que todas las tareas del grupo terminen
                group_results = await asyncio.gather(*group_tasks, return_exceptions=True)
                
                # Procesar resultados del grupo
                for i, result in enumerate(group_results):
                    task_id = group[i]
                    if isinstance(result, Exception):
                        results[task_id] = {"success": False, "error": str(result)}
                        # Si una tarea falla, el flujo falla
                        raise result
                    else:
                        results[task_id] = result
            
            # Marcar flujo como completado
            flow.status = TaskStatus.COMPLETED
            flow.completed_at = datetime.now()
            
            # Emitir evento
            await self._emit_event("flow_completed", {"flow_id": flow_id, "flow": flow, "results": results})
            
            self.logger.info(f"🎯 Flujo completado: {flow.name} ({flow_id[:8]})")
            
            return {
                "success": True,
                "results": results,
                "flow_id": flow_id,
                "execution_time": (flow.completed_at - flow.started_at).total_seconds()
            }
            
        except Exception as e:
            # Marcar flujo como fallido
            flow.status = TaskStatus.FAILED
            flow.completed_at = datetime.now()
            
            # Emitir evento
            await self._emit_event("flow_failed", {"flow_id": flow_id, "flow": flow, "error": str(e)})
            
            self.logger.error(f"💥 Flujo fallido: {flow.name} ({flow_id[:8]}) - {e}")
            
            return {
                "success": False,
                "error": str(e),
                "flow_id": flow_id
            }
    
    async def pause_task(self, task_id: str) -> bool:
        """Pausa una tarea en ejecución"""
        
        if task_id not in self.tasks:
            return False
        
        task = self.tasks[task_id]
        
        if task.status == TaskStatus.IN_PROGRESS:
            task.status = TaskStatus.PAUSED
            
            # Cancelar tarea asyncio si existe
            if task_id in self.running_tasks:
                self.running_tasks[task_id].cancel()
                del self.running_tasks[task_id]
            
            # Emitir evento
            await self._emit_event("task_paused", {"task_id": task_id, "task": task})
            
            self.logger.info(f"⏸️ Tarea pausada: {task.name} ({task_id[:8]})")
            return True
        
        return False
    
    async def resume_task(self, task_id: str) -> bool:
        """Reanuda una tarea pausada"""
        
        if task_id not in self.tasks:
            return False
        
        task = self.tasks[task_id]
        
        if task.status == TaskStatus.PAUSED:
            task.status = TaskStatus.PENDING
            self.task_queue.append(task_id)
            
            # Emitir evento
            await self._emit_event("task_resumed", {"task_id": task_id, "task": task})
            
            self.logger.info(f"▶️ Tarea reanudada: {task.name} ({task_id[:8]})")
            return True
        
        return False
    
    async def cancel_task(self, task_id: str) -> bool:
        """Cancela una tarea"""
        
        if task_id not in self.tasks:
            return False
        
        task = self.tasks[task_id]
        
        # Cancelar si está en ejecución
        if task_id in self.running_tasks:
            self.running_tasks[task_id].cancel()
            del self.running_tasks[task_id]
        
        # Remover de la cola si está pendiente
        if task_id in self.task_queue:
            self.task_queue.remove(task_id)
        
        task.status = TaskStatus.CANCELLED
        task.completed_at = datetime.now()
        
        # Emitir evento
        await self._emit_event("task_cancelled", {"task_id": task_id, "task": task})
        
        self.logger.info(f"🚫 Tarea cancelada: {task.name} ({task_id[:8]})")
        return True
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene el estado de una tarea"""
        
        if task_id not in self.tasks:
            return None
        
        task = self.tasks[task_id]
        
        return {
            "task_id": task_id,
            "name": task.name,
            "status": task.status.value,
            "priority": task.priority.value,
            "type": task.task_type.value,
            "created_at": task.created_at.isoformat(),
            "started_at": task.started_at.isoformat() if task.started_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "progress": self._calculate_task_progress(task),
            "estimated_duration": task.estimated_duration.total_seconds() if task.estimated_duration else None,
            "actual_duration": task.actual_duration.total_seconds() if task.actual_duration else None,
            "retry_count": task.retry_count,
            "error": task.error,
            "tags": task.tags
        }
    
    def get_system_status(self) -> Dict[str, Any]:
        """Obtiene el estado del sistema de tareas"""
        
        # Contar tareas por estado
        status_counts = defaultdict(int)
        for task in self.tasks.values():
            status_counts[task.status.value] += 1
        
        # Contar tareas por tipo
        type_counts = defaultdict(int)
        for task in self.tasks.values():
            type_counts[task.task_type.value] += 1
        
        return {
            "total_tasks": len(self.tasks),
            "total_flows": len(self.task_flows),
            "running_tasks": len(self.running_tasks),
            "queued_tasks": len(self.task_queue),
            "status_distribution": dict(status_counts),
            "type_distribution": dict(type_counts),
            "metrics": self.metrics,
            "config": self.config,
            "processing_active": self.processing_active
        }
    
    def add_event_handler(self, event_type: str, handler: Callable):
        """Agrega un manejador de eventos"""
        
        self.event_handlers[event_type].append(handler)
        self.logger.debug(f"📡 Handler agregado para evento: {event_type}")
    
    def remove_event_handler(self, event_type: str, handler: Callable):
        """Remueve un manejador de eventos"""
        
        if handler in self.event_handlers[event_type]:
            self.event_handlers[event_type].remove(handler)
            self.logger.debug(f"📡 Handler removido para evento: {event_type}")
    
    # Métodos auxiliares
    
    async def _process_task_queue(self):
        """Procesa la cola de tareas continuamente"""
        
        while self.processing_active:
            try:
                # Verificar si hay espacio para más tareas
                if len(self.running_tasks) >= self.config["max_concurrent_tasks"]:
                    await asyncio.sleep(1)
                    continue
                
                # Obtener siguiente tarea de la cola
                if not self.task_queue:
                    await asyncio.sleep(1)
                    continue
                
                task_id = self.task_queue.popleft()
                
                # Verificar que la tarea aún existe y está pendiente
                if task_id not in self.tasks:
                    continue
                
                task = self.tasks[task_id]
                if task.status != TaskStatus.PENDING:
                    continue
                
                # Verificar dependencias
                if not await self._check_dependencies(task):
                    # Volver a encolar si las dependencias no están listas
                    self.task_queue.append(task_id)
                    await asyncio.sleep(1)
                    continue
                
                # Ejecutar tarea
                async_task = asyncio.create_task(self.execute_task(task_id))
                self.running_tasks[task_id] = async_task
                
                # Configurar callback para limpiar cuando termine
                async_task.add_done_callback(
                    lambda t, tid=task_id: self.running_tasks.pop(tid, None)
                )
                
            except Exception as e:
                self.logger.error(f"Error en procesamiento de cola: {e}")
                await asyncio.sleep(5)
    
    async def _check_dependencies(self, task: Task) -> bool:
        """Verifica si las dependencias de una tarea están satisfechas"""
        
        for dep_id in task.dependencies:
            if dep_id not in self.tasks:
                return False
            
            dep_task = self.tasks[dep_id]
            if dep_task.status != TaskStatus.COMPLETED:
                return False
        
        return True
    
    async def _capture_current_context(self, task_id: str) -> TaskContext:
        """Captura el contexto actual del proyecto"""
        
        try:
            # Capturar estado del proyecto
            project_state = await self._get_project_state()
            
            # Capturar estados de archivos (hashes)
            file_states = await self._get_file_states()
            
            # Capturar variables de entorno relevantes
            env_vars = await self._get_relevant_env_vars()
            
            # Identificar dependencias
            dependencies = await self._identify_dependencies()
            
            # Generar claves de caché
            cache_keys = await self._generate_cache_keys(project_state, file_states)
            
            context = TaskContext(
                task_id=task_id,
                project_state=project_state,
                file_states=file_states,
                environment_vars=env_vars,
                dependencies=dependencies,
                cache_keys=cache_keys
            )
            
            # Guardar contexto en caché y disco
            self.context_cache[task_id] = context
            await self._save_context(context)
            
            self.metrics["context_cache_misses"] += 1
            
            return context
            
        except Exception as e:
            self.logger.error(f"Error capturando contexto: {e}")
            return TaskContext(
                task_id=task_id,
                project_state={},
                file_states={},
                environment_vars={},
                dependencies=[],
                cache_keys=[]
            )
    
    async def _restore_context(self, context: TaskContext):
        """Restaura el contexto de una tarea"""
        
        try:
            # Verificar si el contexto está en caché
            if context.task_id in self.context_cache:
                self.metrics["context_cache_hits"] += 1
            else:
                # Cargar desde disco
                context = await self._load_context(context.task_id)
                if context:
                    self.context_cache[context.task_id] = context
                    self.metrics["context_cache_misses"] += 1
            
            # Restaurar estado del proyecto
            await self._restore_project_state(context.project_state)
            
            # Verificar y restaurar archivos si es necesario
            await self._verify_file_states(context.file_states)
            
            # Configurar variables de entorno
            await self._set_environment_vars(context.environment_vars)
            
            self.logger.debug(f"🔄 Contexto restaurado para tarea: {context.task_id[:8]}")
            
        except Exception as e:
            self.logger.error(f"Error restaurando contexto: {e}")
    
    async def _execute_function(self, task: Task) -> Any:
        """Ejecuta una función de tarea"""
        
        if not task.function:
            raise ValueError("No hay función definida para la tarea")
        
        # Preparar parámetros
        params = task.parameters.copy()
        params['task_id'] = task.task_id
        params['task_context'] = task.context
        
        # Ejecutar función
        if asyncio.iscoroutinefunction(task.function):
            result = await task.function(**params)
        else:
            result = task.function(**params)
        
        return result
    
    async def _execute_command(self, task: Task) -> Dict[str, Any]:
        """Ejecuta un comando de tarea"""
        
        if not task.command:
            raise ValueError("No hay comando definido para la tarea")
        
        # Crear proceso
        process = await asyncio.create_subprocess_shell(
            task.command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        # Ejecutar con timeout
        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=self.config["task_timeout"]
            )
            
            return {
                "return_code": process.returncode,
                "stdout": stdout.decode('utf-8', errors='ignore'),
                "stderr": stderr.decode('utf-8', errors='ignore')
            }
            
        except asyncio.TimeoutError:
            process.kill()
            raise TimeoutError(f"Comando excedió timeout de {self.config['task_timeout']} segundos")
    
    async def _schedule_retry(self, task: Task):
        """Programa un reintento de tarea"""
        
        task.retry_count += 1
        task.status = TaskStatus.PENDING
        
        # Esperar delay antes de reencolar
        await asyncio.sleep(task.retry_delay.total_seconds())
        
        self.task_queue.append(task.task_id)
        
        self.logger.info(f"🔄 Reintento programado para: {task.name} ({task.retry_count}/{task.max_retries})")
    
    async def _emit_event(self, event_type: str, data: Dict[str, Any]):
        """Emite un evento a los manejadores registrados"""
        
        for handler in self.event_handlers.get(event_type, []):
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(data)
                else:
                    handler(data)
            except Exception as e:
                self.logger.error(f"Error en handler de evento {event_type}: {e}")
    
    def _calculate_task_progress(self, task: Task) -> float:
        """Calcula el progreso de una tarea"""
        
        if task.status == TaskStatus.COMPLETED:
            return 100.0
        elif task.status == TaskStatus.FAILED or task.status == TaskStatus.CANCELLED:
            return 0.0
        elif task.status == TaskStatus.IN_PROGRESS:
            if task.estimated_duration and task.started_at:
                elapsed = datetime.now() - task.started_at
                progress = (elapsed.total_seconds() / task.estimated_duration.total_seconds()) * 100
                return min(progress, 95.0)  # Máximo 95% hasta completar
            return 50.0  # Progreso estimado si no hay duración estimada
        else:
            return 0.0
    
    async def _save_persistent_state(self):
        """Guarda el estado persistente"""
        
        try:
            # Guardar tareas
            tasks_data = {}
            for task_id, task in self.tasks.items():
                task_dict = asdict(task)
                # Convertir función a string si existe
                if task.function:
                    task_dict['function'] = f"{task.function.__module__}.{task.function.__name__}"
                else:
                    task_dict['function'] = None
                tasks_data[task_id] = task_dict
            
            with open(self.tasks_file, 'w', encoding='utf-8') as f:
                json.dump(tasks_data, f, indent=2, ensure_ascii=False, default=str)
            
            # Guardar flujos
            flows_data = {flow_id: asdict(flow) for flow_id, flow in self.task_flows.items()}
            
            with open(self.flows_file, 'w', encoding='utf-8') as f:
                json.dump(flows_data, f, indent=2, ensure_ascii=False, default=str)
            
        except Exception as e:
            self.logger.error(f"Error guardando estado persistente: {e}")
    
    async def _load_persistent_state(self):
        """Carga el estado persistente"""
        
        try:
            # Cargar tareas
            if self.tasks_file.exists():
                with open(self.tasks_file, 'r', encoding='utf-8') as f:
                    tasks_data = json.load(f)
                
                for task_id, task_dict in tasks_data.items():
                    # Convertir strings de fecha a datetime
                    for date_field in ['created_at', 'started_at', 'completed_at']:
                        if task_dict.get(date_field):
                            task_dict[date_field] = datetime.fromisoformat(task_dict[date_field])
                    
                    # Convertir enums
                    task_dict['task_type'] = TaskType(task_dict['task_type'])
                    task_dict['priority'] = TaskPriority(task_dict['priority'])
                    task_dict['status'] = TaskStatus(task_dict['status'])
                    
                    # Manejar función (no se puede restaurar, se debe reconfigurar)
                    task_dict['function'] = None
                    
                    # Crear tarea
                    task = Task(**task_dict)
                    self.tasks[task_id] = task
                    
                    # Reencolar tareas pendientes
                    if task.status == TaskStatus.PENDING:
                        self.task_queue.append(task_id)
            
            # Cargar flujos
            if self.flows_file.exists():
                with open(self.flows_file, 'r', encoding='utf-8') as f:
                    flows_data = json.load(f)
                
                for flow_id, flow_dict in flows_data.items():
                    # Convertir strings de fecha a datetime
                    for date_field in ['created_at', 'started_at', 'completed_at']:
                        if flow_dict.get(date_field):
                            flow_dict[date_field] = datetime.fromisoformat(flow_dict[date_field])
                    
                    # Convertir enum
                    flow_dict['status'] = TaskStatus(flow_dict['status'])
                    
                    # Crear flujo
                    flow = TaskFlow(**flow_dict)
                    self.task_flows[flow_id] = flow
            
            self.logger.info(f"📂 Estado cargado: {len(self.tasks)} tareas, {len(self.task_flows)} flujos")
            
        except Exception as e:
            self.logger.error(f"Error cargando estado persistente: {e}")
    
    async def shutdown(self):
        """Cierra el gestor de tareas limpiamente"""
        
        self.processing_active = False
        
        # Cancelar tareas en ejecución
        for task_id, async_task in self.running_tasks.items():
            async_task.cancel()
            self.logger.info(f"🛑 Tarea cancelada: {task_id[:8]}")
        
        # Esperar a que termine el procesamiento
        if hasattr(self, 'processing_task'):
            self.processing_task.cancel()
            try:
                await self.processing_task
            except asyncio.CancelledError:
                pass
        
        # Guardar estado final
        await self._save_persistent_state()
        
        self.logger.info("🛑 Task Manager cerrado")

# Funciones auxiliares para implementar en el contexto real del proyecto

async def _get_project_state() -> Dict[str, Any]:
    """Obtiene el estado actual del proyecto"""
    return {
        "git_branch": "main",
        "git_commit": "abc123",
        "package_versions": {},
        "config_state": {}
    }

async def _get_file_states() -> Dict[str, str]:
    """Obtiene hashes de archivos importantes"""
    return {}

async def _get_relevant_env_vars() -> Dict[str, str]:
    """Obtiene variables de entorno relevantes"""
    return {}

async def _identify_dependencies() -> List[str]:
    """Identifica dependencias del proyecto"""
    return []

async def _generate_cache_keys(project_state: Dict, file_states: Dict) -> List[str]:
    """Genera claves de caché basadas en el estado"""
    return []

async def _save_context(context: TaskContext):
    """Guarda contexto en disco"""
    pass

async def _load_context(task_id: str) -> Optional[TaskContext]:
    """Carga contexto desde disco"""
    return None

async def _restore_project_state(project_state: Dict[str, Any]):
    """Restaura el estado del proyecto"""
    pass

async def _verify_file_states(file_states: Dict[str, str]):
    """Verifica y restaura estados de archivos"""
    pass

async def _set_environment_vars(env_vars: Dict[str, str]):
    """Configura variables de entorno"""
    pass

def main():
    """Función principal para testing"""
    async def test_task_manager():
        manager = TaskManager()
        
        # Crear tarea de prueba
        task_id = await manager.create_task(
            name="Test Task",
            description="Tarea de prueba",
            task_type=TaskType.DEVELOPMENT,
            priority=TaskPriority.HIGH,
            command="echo 'Hello World'"
        )
        
        print(f"📝 Tarea creada: {task_id}")
        
        # Obtener estado
        status = manager.get_task_status(task_id)
        print(f"📊 Estado: {status}")
        
        # Esperar un poco para que se procese
        await asyncio.sleep(2)
        
        # Obtener estado del sistema
        system_status = manager.get_system_status()
        print(f"🖥️ Sistema: {system_status}")
        
        # Cerrar manager
        await manager.shutdown()
    
    asyncio.run(test_task_manager())

if __name__ == "__main__":
    main()