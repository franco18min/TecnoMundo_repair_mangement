#!/usr/bin/env python3
"""
⚙️ NEXUS - Workflow Engine
Motor de flujos de trabajo inteligente con preservación de contexto
TecnoMundo Repair Management - Trae 2.0
"""

import json
import asyncio
import threading
from typing import Dict, List, Optional, Any, Callable, Union, Set
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from pathlib import Path
from enum import Enum
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor, Future
import traceback
import yaml

class WorkflowStatus(Enum):
    """Estados del workflow"""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class StepStatus(Enum):
    """Estados del paso"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    RETRYING = "retrying"

class TriggerType(Enum):
    """Tipos de triggers"""
    MANUAL = "manual"
    SCHEDULED = "scheduled"
    EVENT = "event"
    CONDITION = "condition"
    WEBHOOK = "webhook"

@dataclass
class WorkflowStep:
    """Paso individual del workflow"""
    step_id: str
    name: str
    action: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)
    conditions: List[Dict[str, Any]] = field(default_factory=list)
    retry_config: Dict[str, Any] = field(default_factory=dict)
    timeout: Optional[int] = None
    status: StepStatus = StepStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    execution_time: Optional[float] = None
    retry_count: int = 0
    context_requirements: List[str] = field(default_factory=list)
    context_outputs: List[str] = field(default_factory=list)

@dataclass
class WorkflowTrigger:
    """Trigger del workflow"""
    trigger_id: str
    trigger_type: TriggerType
    config: Dict[str, Any] = field(default_factory=dict)
    enabled: bool = True
    last_triggered: Optional[datetime] = None

@dataclass
class Workflow:
    """Definición completa del workflow"""
    workflow_id: str
    name: str
    description: str
    version: str = "1.0.0"
    steps: List[WorkflowStep] = field(default_factory=list)
    triggers: List[WorkflowTrigger] = field(default_factory=list)
    variables: Dict[str, Any] = field(default_factory=dict)
    context_config: Dict[str, Any] = field(default_factory=dict)
    status: WorkflowStatus = WorkflowStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    execution_time: Optional[float] = None
    current_step: Optional[str] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class WorkflowExecution:
    """Ejecución específica de un workflow"""
    execution_id: str
    workflow_id: str
    status: WorkflowStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    triggered_by: str = "manual"
    input_data: Dict[str, Any] = field(default_factory=dict)
    output_data: Dict[str, Any] = field(default_factory=dict)
    step_results: Dict[str, Any] = field(default_factory=dict)
    context_snapshots: List[str] = field(default_factory=list)
    error_log: List[str] = field(default_factory=list)

class WorkflowEngine:
    """Motor de workflows inteligente"""
    
    def __init__(self, config_dir: str = ".trae/automation"):
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # Directorios
        self.workflows_dir = self.config_dir / "workflows"
        self.executions_dir = self.config_dir / "executions"
        self.templates_dir = self.config_dir / "templates"
        
        for directory in [self.workflows_dir, self.executions_dir, self.templates_dir]:
            directory.mkdir(exist_ok=True)
        
        # Estado del motor
        self.workflows: Dict[str, Workflow] = {}
        self.active_executions: Dict[str, WorkflowExecution] = {}
        self.step_handlers: Dict[str, Callable] = {}
        self.condition_evaluators: Dict[str, Callable] = {}
        
        # Configuración
        self.config = {
            "max_concurrent_workflows": 10,
            "max_concurrent_steps": 5,
            "default_timeout": 300,  # 5 minutos
            "retry_delay": 5,  # segundos
            "max_retries": 3,
            "context_preservation": True,
            "auto_cleanup": True,
            "cleanup_after_days": 7,
            "enable_webhooks": True,
            "webhook_timeout": 30
        }
        
        # Executors
        self.workflow_executor = ThreadPoolExecutor(
            max_workers=self.config["max_concurrent_workflows"],
            thread_name_prefix="workflow"
        )
        self.step_executor = ThreadPoolExecutor(
            max_workers=self.config["max_concurrent_steps"],
            thread_name_prefix="step"
        )
        
        # Sistema de eventos
        self.event_handlers: Dict[str, List[Callable]] = {}
        self.event_queue = asyncio.Queue()
        
        # Métricas
        self.metrics = {
            "workflows_executed": 0,
            "workflows_completed": 0,
            "workflows_failed": 0,
            "steps_executed": 0,
            "steps_completed": 0,
            "steps_failed": 0,
            "average_execution_time": 0.0,
            "total_execution_time": 0.0
        }
        
        # Logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Cargar workflows existentes
        self._load_existing_workflows()
        
        # Registrar handlers básicos
        self._register_default_handlers()
        
        # Iniciar procesamiento de eventos
        self._start_event_processing()
        
        self.logger.info("⚙️ Workflow Engine iniciado")
    
    async def create_workflow(
        self,
        name: str,
        description: str,
        steps: List[Dict[str, Any]],
        triggers: Optional[List[Dict[str, Any]]] = None,
        variables: Optional[Dict[str, Any]] = None,
        context_config: Optional[Dict[str, Any]] = None
    ) -> str:
        """Crea un nuevo workflow"""
        
        try:
            workflow_id = str(uuid.uuid4())
            
            # Convertir steps a objetos WorkflowStep
            workflow_steps = []
            for step_data in steps:
                step = WorkflowStep(
                    step_id=step_data.get("step_id", str(uuid.uuid4())),
                    name=step_data["name"],
                    action=step_data["action"],
                    parameters=step_data.get("parameters", {}),
                    dependencies=step_data.get("dependencies", []),
                    conditions=step_data.get("conditions", []),
                    retry_config=step_data.get("retry_config", {}),
                    timeout=step_data.get("timeout"),
                    context_requirements=step_data.get("context_requirements", []),
                    context_outputs=step_data.get("context_outputs", [])
                )
                workflow_steps.append(step)
            
            # Convertir triggers a objetos WorkflowTrigger
            workflow_triggers = []
            if triggers:
                for trigger_data in triggers:
                    trigger = WorkflowTrigger(
                        trigger_id=trigger_data.get("trigger_id", str(uuid.uuid4())),
                        trigger_type=TriggerType(trigger_data["type"]),
                        config=trigger_data.get("config", {}),
                        enabled=trigger_data.get("enabled", True)
                    )
                    workflow_triggers.append(trigger)
            
            # Crear workflow
            workflow = Workflow(
                workflow_id=workflow_id,
                name=name,
                description=description,
                steps=workflow_steps,
                triggers=workflow_triggers,
                variables=variables or {},
                context_config=context_config or {}
            )
            
            # Validar workflow
            validation_result = await self._validate_workflow(workflow)
            if not validation_result["valid"]:
                raise ValueError(f"Workflow inválido: {validation_result['errors']}")
            
            # Almacenar workflow
            self.workflows[workflow_id] = workflow
            await self._save_workflow(workflow)
            
            # Registrar triggers
            await self._register_workflow_triggers(workflow)
            
            self.logger.info(f"📋 Workflow creado: {name} ({workflow_id})")
            
            return workflow_id
            
        except Exception as e:
            self.logger.error(f"Error creando workflow: {e}")
            raise
    
    async def execute_workflow(
        self,
        workflow_id: str,
        input_data: Optional[Dict[str, Any]] = None,
        triggered_by: str = "manual"
    ) -> str:
        """Ejecuta un workflow"""
        
        try:
            if workflow_id not in self.workflows:
                raise ValueError(f"Workflow no encontrado: {workflow_id}")
            
            workflow = self.workflows[workflow_id]
            
            # Verificar si ya hay demasiadas ejecuciones activas
            if len(self.active_executions) >= self.config["max_concurrent_workflows"]:
                raise RuntimeError("Demasiadas ejecuciones activas")
            
            # Crear ejecución
            execution_id = str(uuid.uuid4())
            execution = WorkflowExecution(
                execution_id=execution_id,
                workflow_id=workflow_id,
                status=WorkflowStatus.PENDING,
                started_at=datetime.now(),
                triggered_by=triggered_by,
                input_data=input_data or {}
            )
            
            # Registrar ejecución activa
            self.active_executions[execution_id] = execution
            
            # Ejecutar workflow en background
            future = self.workflow_executor.submit(
                self._execute_workflow_sync,
                execution_id
            )
            
            # Manejar resultado asíncrono
            asyncio.create_task(self._handle_workflow_completion(execution_id, future))
            
            self.logger.info(f"🚀 Workflow iniciado: {workflow.name} ({execution_id})")
            
            return execution_id
            
        except Exception as e:
            self.logger.error(f"Error ejecutando workflow: {e}")
            raise
    
    async def pause_workflow(self, execution_id: str) -> bool:
        """Pausa una ejecución de workflow"""
        
        try:
            if execution_id not in self.active_executions:
                return False
            
            execution = self.active_executions[execution_id]
            execution.status = WorkflowStatus.PAUSED
            
            await self._emit_event("workflow_paused", {
                "execution_id": execution_id,
                "workflow_id": execution.workflow_id
            })
            
            self.logger.info(f"⏸️ Workflow pausado: {execution_id}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error pausando workflow: {e}")
            return False
    
    async def resume_workflow(self, execution_id: str) -> bool:
        """Reanuda una ejecución de workflow"""
        
        try:
            if execution_id not in self.active_executions:
                return False
            
            execution = self.active_executions[execution_id]
            if execution.status != WorkflowStatus.PAUSED:
                return False
            
            execution.status = WorkflowStatus.RUNNING
            
            await self._emit_event("workflow_resumed", {
                "execution_id": execution_id,
                "workflow_id": execution.workflow_id
            })
            
            self.logger.info(f"▶️ Workflow reanudado: {execution_id}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error reanudando workflow: {e}")
            return False
    
    async def cancel_workflow(self, execution_id: str) -> bool:
        """Cancela una ejecución de workflow"""
        
        try:
            if execution_id not in self.active_executions:
                return False
            
            execution = self.active_executions[execution_id]
            execution.status = WorkflowStatus.CANCELLED
            execution.completed_at = datetime.now()
            
            # Mover a historial
            await self._archive_execution(execution)
            del self.active_executions[execution_id]
            
            await self._emit_event("workflow_cancelled", {
                "execution_id": execution_id,
                "workflow_id": execution.workflow_id
            })
            
            self.logger.info(f"❌ Workflow cancelado: {execution_id}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error cancelando workflow: {e}")
            return False
    
    async def get_workflow_status(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene el estado de una ejecución"""
        
        try:
            if execution_id in self.active_executions:
                execution = self.active_executions[execution_id]
                workflow = self.workflows[execution.workflow_id]
                
                # Calcular progreso
                total_steps = len(workflow.steps)
                completed_steps = sum(
                    1 for step in workflow.steps
                    if step.status == StepStatus.COMPLETED
                )
                progress = (completed_steps / total_steps) * 100 if total_steps > 0 else 0
                
                return {
                    "execution_id": execution_id,
                    "workflow_id": execution.workflow_id,
                    "workflow_name": workflow.name,
                    "status": execution.status.value,
                    "progress": progress,
                    "started_at": execution.started_at.isoformat(),
                    "current_step": workflow.current_step,
                    "total_steps": total_steps,
                    "completed_steps": completed_steps,
                    "step_results": execution.step_results,
                    "error_log": execution.error_log
                }
            
            # Buscar en historial
            return await self._get_archived_execution_status(execution_id)
            
        except Exception as e:
            self.logger.error(f"Error obteniendo estado: {e}")
            return None
    
    async def list_workflows(self) -> List[Dict[str, Any]]:
        """Lista todos los workflows"""
        
        try:
            workflows_list = []
            
            for workflow in self.workflows.values():
                # Contar ejecuciones activas
                active_executions = sum(
                    1 for exec in self.active_executions.values()
                    if exec.workflow_id == workflow.workflow_id
                )
                
                workflows_list.append({
                    "workflow_id": workflow.workflow_id,
                    "name": workflow.name,
                    "description": workflow.description,
                    "version": workflow.version,
                    "status": workflow.status.value,
                    "steps_count": len(workflow.steps),
                    "triggers_count": len(workflow.triggers),
                    "active_executions": active_executions,
                    "created_at": workflow.created_at.isoformat()
                })
            
            return workflows_list
            
        except Exception as e:
            self.logger.error(f"Error listando workflows: {e}")
            return []
    
    async def create_workflow_template(
        self,
        template_name: str,
        workflow_id: str,
        description: str = ""
    ) -> bool:
        """Crea un template a partir de un workflow existente"""
        
        try:
            if workflow_id not in self.workflows:
                return False
            
            workflow = self.workflows[workflow_id]
            
            # Crear template
            template = {
                "name": template_name,
                "description": description,
                "version": "1.0.0",
                "created_at": datetime.now().isoformat(),
                "workflow_definition": {
                    "name": "{{workflow_name}}",
                    "description": "{{workflow_description}}",
                    "steps": [asdict(step) for step in workflow.steps],
                    "triggers": [asdict(trigger) for trigger in workflow.triggers],
                    "variables": workflow.variables,
                    "context_config": workflow.context_config
                },
                "parameters": [
                    {"name": "workflow_name", "type": "string", "required": True},
                    {"name": "workflow_description", "type": "string", "required": False}
                ]
            }
            
            # Guardar template
            template_file = self.templates_dir / f"{template_name}.yaml"
            with open(template_file, 'w', encoding='utf-8') as f:
                yaml.dump(template, f, default_flow_style=False, allow_unicode=True)
            
            self.logger.info(f"📄 Template creado: {template_name}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error creando template: {e}")
            return False
    
    async def create_workflow_from_template(
        self,
        template_name: str,
        parameters: Dict[str, Any]
    ) -> Optional[str]:
        """Crea un workflow a partir de un template"""
        
        try:
            template_file = self.templates_dir / f"{template_name}.yaml"
            
            if not template_file.exists():
                raise ValueError(f"Template no encontrado: {template_name}")
            
            # Cargar template
            with open(template_file, 'r', encoding='utf-8') as f:
                template = yaml.safe_load(f)
            
            # Procesar parámetros
            workflow_def = template["workflow_definition"]
            
            # Reemplazar placeholders
            def replace_placeholders(obj, params):
                if isinstance(obj, str):
                    for key, value in params.items():
                        obj = obj.replace(f"{{{{{key}}}}}", str(value))
                    return obj
                elif isinstance(obj, dict):
                    return {k: replace_placeholders(v, params) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [replace_placeholders(item, params) for item in obj]
                return obj
            
            processed_def = replace_placeholders(workflow_def, parameters)
            
            # Crear workflow
            workflow_id = await self.create_workflow(
                name=processed_def["name"],
                description=processed_def["description"],
                steps=processed_def["steps"],
                triggers=processed_def.get("triggers"),
                variables=processed_def.get("variables"),
                context_config=processed_def.get("context_config")
            )
            
            self.logger.info(f"📋 Workflow creado desde template: {template_name}")
            
            return workflow_id
            
        except Exception as e:
            self.logger.error(f"Error creando workflow desde template: {e}")
            return None
    
    def register_step_handler(self, action: str, handler: Callable):
        """Registra un handler para un tipo de acción"""
        
        self.step_handlers[action] = handler
        self.logger.debug(f"🔧 Handler registrado: {action}")
    
    def register_condition_evaluator(self, condition_type: str, evaluator: Callable):
        """Registra un evaluador de condiciones"""
        
        self.condition_evaluators[condition_type] = evaluator
        self.logger.debug(f"🔍 Evaluador registrado: {condition_type}")
    
    def register_event_handler(self, event_type: str, handler: Callable):
        """Registra un handler de eventos"""
        
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        
        self.event_handlers[event_type].append(handler)
        self.logger.debug(f"📡 Event handler registrado: {event_type}")
    
    async def get_workflow_metrics(self) -> Dict[str, Any]:
        """Obtiene métricas del motor de workflows"""
        
        try:
            # Métricas básicas
            active_count = len(self.active_executions)
            total_workflows = len(self.workflows)
            
            # Métricas de rendimiento
            if self.metrics["workflows_executed"] > 0:
                success_rate = (self.metrics["workflows_completed"] / 
                              self.metrics["workflows_executed"]) * 100
                avg_execution_time = (self.metrics["total_execution_time"] / 
                                    self.metrics["workflows_executed"])
            else:
                success_rate = 0
                avg_execution_time = 0
            
            # Distribución por estado
            status_distribution = {}
            for execution in self.active_executions.values():
                status = execution.status.value
                status_distribution[status] = status_distribution.get(status, 0) + 1
            
            return {
                "overview": {
                    "total_workflows": total_workflows,
                    "active_executions": active_count,
                    "success_rate": success_rate,
                    "average_execution_time": avg_execution_time
                },
                "execution_metrics": self.metrics.copy(),
                "status_distribution": status_distribution,
                "resource_usage": {
                    "workflow_threads": self.workflow_executor._threads,
                    "step_threads": self.step_executor._threads,
                    "event_queue_size": self.event_queue.qsize()
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error obteniendo métricas: {e}")
            return {"error": str(e)}
    
    # Métodos internos
    
    def _execute_workflow_sync(self, execution_id: str):
        """Ejecuta workflow de forma síncrona (en thread pool)"""
        
        try:
            execution = self.active_executions[execution_id]
            workflow = self.workflows[execution.workflow_id]
            
            execution.status = WorkflowStatus.RUNNING
            workflow.status = WorkflowStatus.RUNNING
            workflow.started_at = datetime.now()
            
            self.metrics["workflows_executed"] += 1
            
            # Crear contexto de ejecución
            execution_context = {
                "execution_id": execution_id,
                "workflow_id": execution.workflow_id,
                "input_data": execution.input_data,
                "variables": workflow.variables.copy(),
                "step_results": {}
            }
            
            # Ejecutar pasos en orden de dependencias
            step_execution_order = self._calculate_execution_order(workflow.steps)
            
            for step in step_execution_order:
                if execution.status == WorkflowStatus.CANCELLED:
                    break
                
                # Esperar si está pausado
                while execution.status == WorkflowStatus.PAUSED:
                    asyncio.sleep(1)
                
                # Verificar condiciones del paso
                if not self._evaluate_step_conditions(step, execution_context):
                    step.status = StepStatus.SKIPPED
                    continue
                
                # Ejecutar paso
                success = self._execute_step_sync(step, execution_context)
                
                if not success and not step.retry_config.get("continue_on_failure", False):
                    execution.status = WorkflowStatus.FAILED
                    workflow.status = WorkflowStatus.FAILED
                    break
            
            # Finalizar ejecución
            if execution.status == WorkflowStatus.RUNNING:
                execution.status = WorkflowStatus.COMPLETED
                workflow.status = WorkflowStatus.COMPLETED
                self.metrics["workflows_completed"] += 1
            elif execution.status == WorkflowStatus.FAILED:
                self.metrics["workflows_failed"] += 1
            
            execution.completed_at = datetime.now()
            workflow.completed_at = datetime.now()
            
            # Calcular tiempo de ejecución
            execution_time = (execution.completed_at - execution.started_at).total_seconds()
            execution.execution_time = execution_time
            workflow.execution_time = execution_time
            self.metrics["total_execution_time"] += execution_time
            
            return execution.status == WorkflowStatus.COMPLETED
            
        except Exception as e:
            self.logger.error(f"Error en ejecución de workflow: {e}")
            execution.status = WorkflowStatus.FAILED
            execution.error_log.append(str(e))
            self.metrics["workflows_failed"] += 1
            return False
    
    def _execute_step_sync(self, step: WorkflowStep, context: Dict[str, Any]) -> bool:
        """Ejecuta un paso de forma síncrona"""
        
        try:
            step.status = StepStatus.RUNNING
            step.started_at = datetime.now()
            
            self.metrics["steps_executed"] += 1
            
            # Obtener handler
            if step.action not in self.step_handlers:
                raise ValueError(f"Handler no encontrado para acción: {step.action}")
            
            handler = self.step_handlers[step.action]
            
            # Preparar parámetros
            step_params = {
                **step.parameters,
                "context": context,
                "step_id": step.step_id
            }
            
            # Ejecutar con timeout
            timeout = step.timeout or self.config["default_timeout"]
            
            future = self.step_executor.submit(handler, **step_params)
            result = future.result(timeout=timeout)
            
            # Procesar resultado
            step.result = result
            step.status = StepStatus.COMPLETED
            step.completed_at = datetime.now()
            step.execution_time = (step.completed_at - step.started_at).total_seconds()
            
            # Actualizar contexto
            context["step_results"][step.step_id] = result
            
            self.metrics["steps_completed"] += 1
            
            return True
            
        except Exception as e:
            step.error = str(e)
            step.status = StepStatus.FAILED
            step.completed_at = datetime.now()
            
            self.metrics["steps_failed"] += 1
            
            # Intentar retry si está configurado
            max_retries = step.retry_config.get("max_retries", self.config["max_retries"])
            
            if step.retry_count < max_retries:
                step.retry_count += 1
                step.status = StepStatus.RETRYING
                
                # Esperar antes del retry
                retry_delay = step.retry_config.get("delay", self.config["retry_delay"])
                asyncio.sleep(retry_delay)
                
                return self._execute_step_sync(step, context)
            
            return False
    
    def _calculate_execution_order(self, steps: List[WorkflowStep]) -> List[WorkflowStep]:
        """Calcula el orden de ejecución basado en dependencias"""
        
        # Implementación simple de ordenamiento topológico
        ordered_steps = []
        remaining_steps = steps.copy()
        
        while remaining_steps:
            # Buscar pasos sin dependencias pendientes
            ready_steps = []
            
            for step in remaining_steps:
                dependencies_met = all(
                    any(s.step_id == dep_id and s.status == StepStatus.COMPLETED 
                        for s in ordered_steps)
                    for dep_id in step.dependencies
                ) if step.dependencies else True
                
                if dependencies_met:
                    ready_steps.append(step)
            
            if not ready_steps:
                # Dependencias circulares o no resueltas
                raise ValueError("Dependencias circulares detectadas en workflow")
            
            # Agregar pasos listos al orden
            for step in ready_steps:
                ordered_steps.append(step)
                remaining_steps.remove(step)
        
        return ordered_steps
    
    def _evaluate_step_conditions(self, step: WorkflowStep, context: Dict[str, Any]) -> bool:
        """Evalúa las condiciones de un paso"""
        
        if not step.conditions:
            return True
        
        for condition in step.conditions:
            condition_type = condition.get("type")
            
            if condition_type in self.condition_evaluators:
                evaluator = self.condition_evaluators[condition_type]
                
                if not evaluator(condition, context):
                    return False
            else:
                self.logger.warning(f"Evaluador de condición no encontrado: {condition_type}")
        
        return True
    
    def _register_default_handlers(self):
        """Registra handlers por defecto"""
        
        # Handler para ejecutar comandos
        def execute_command_handler(**params):
            import subprocess
            
            command = params.get("command")
            if not command:
                raise ValueError("Comando no especificado")
            
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=params.get("timeout", 60)
            )
            
            return {
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "success": result.returncode == 0
            }
        
        # Handler para crear archivos
        def create_file_handler(**params):
            file_path = params.get("file_path")
            content = params.get("content", "")
            
            if not file_path:
                raise ValueError("Ruta de archivo no especificada")
            
            Path(file_path).parent.mkdir(parents=True, exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return {"file_created": file_path, "size": len(content)}
        
        # Handler para HTTP requests
        def http_request_handler(**params):
            import requests
            
            url = params.get("url")
            method = params.get("method", "GET").upper()
            headers = params.get("headers", {})
            data = params.get("data")
            
            if not url:
                raise ValueError("URL no especificada")
            
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                timeout=params.get("timeout", 30)
            )
            
            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "content": response.text,
                "success": response.status_code < 400
            }
        
        # Registrar handlers
        self.register_step_handler("execute_command", execute_command_handler)
        self.register_step_handler("create_file", create_file_handler)
        self.register_step_handler("http_request", http_request_handler)
        
        # Evaluadores de condiciones por defecto
        def variable_condition_evaluator(condition, context):
            variable = condition.get("variable")
            operator = condition.get("operator", "equals")
            value = condition.get("value")
            
            if variable not in context["variables"]:
                return False
            
            var_value = context["variables"][variable]
            
            if operator == "equals":
                return var_value == value
            elif operator == "not_equals":
                return var_value != value
            elif operator == "greater_than":
                return var_value > value
            elif operator == "less_than":
                return var_value < value
            
            return False
        
        self.register_condition_evaluator("variable", variable_condition_evaluator)
    
    async def _emit_event(self, event_type: str, data: Dict[str, Any]):
        """Emite un evento"""
        
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.event_queue.put(event)
    
    def _start_event_processing(self):
        """Inicia el procesamiento de eventos"""
        
        async def process_events():
            while True:
                try:
                    event = await self.event_queue.get()
                    
                    # Procesar handlers para este tipo de evento
                    handlers = self.event_handlers.get(event["type"], [])
                    
                    for handler in handlers:
                        try:
                            await handler(event)
                        except Exception as e:
                            self.logger.error(f"Error en event handler: {e}")
                    
                    self.event_queue.task_done()
                    
                except Exception as e:
                    self.logger.error(f"Error procesando eventos: {e}")
        
        # Iniciar procesamiento en background
        asyncio.create_task(process_events())
    
    async def _handle_workflow_completion(self, execution_id: str, future: Future):
        """Maneja la finalización de un workflow"""
        
        try:
            success = await asyncio.wrap_future(future)
            
            if execution_id in self.active_executions:
                execution = self.active_executions[execution_id]
                
                # Archivar ejecución
                await self._archive_execution(execution)
                
                # Remover de activas
                del self.active_executions[execution_id]
                
                # Emitir evento
                event_type = "workflow_completed" if success else "workflow_failed"
                await self._emit_event(event_type, {
                    "execution_id": execution_id,
                    "workflow_id": execution.workflow_id,
                    "success": success
                })
            
        except Exception as e:
            self.logger.error(f"Error manejando finalización de workflow: {e}")
    
    async def _save_workflow(self, workflow: Workflow):
        """Guarda un workflow en disco"""
        
        workflow_file = self.workflows_dir / f"{workflow.workflow_id}.json"
        
        # Convertir a dict serializable
        workflow_dict = asdict(workflow)
        
        # Convertir datetimes a strings
        def convert_datetime(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            elif isinstance(obj, dict):
                return {k: convert_datetime(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_datetime(item) for item in obj]
            return obj
        
        workflow_dict = convert_datetime(workflow_dict)
        
        with open(workflow_file, 'w', encoding='utf-8') as f:
            json.dump(workflow_dict, f, indent=2, ensure_ascii=False)
    
    def _load_existing_workflows(self):
        """Carga workflows existentes desde disco"""
        
        try:
            for workflow_file in self.workflows_dir.glob("*.json"):
                with open(workflow_file, 'r', encoding='utf-8') as f:
                    workflow_dict = json.load(f)
                
                # Convertir de vuelta a objetos
                # (Implementación simplificada)
                workflow_id = workflow_dict["workflow_id"]
                self.workflows[workflow_id] = workflow_dict  # Simplificado
                
        except Exception as e:
            self.logger.error(f"Error cargando workflows: {e}")
    
    async def shutdown(self):
        """Cierra el motor de workflows limpiamente"""
        
        # Cancelar ejecuciones activas
        for execution_id in list(self.active_executions.keys()):
            await self.cancel_workflow(execution_id)
        
        # Cerrar executors
        self.workflow_executor.shutdown(wait=True)
        self.step_executor.shutdown(wait=True)
        
        self.logger.info("🛑 Workflow Engine cerrado")

def main():
    """Función principal para testing"""
    async def test_workflow_engine():
        engine = WorkflowEngine()
        
        # Crear workflow de prueba
        steps = [
            {
                "name": "Crear archivo",
                "action": "create_file",
                "parameters": {
                    "file_path": "test_output.txt",
                    "content": "Hola desde workflow!"
                }
            },
            {
                "name": "Ejecutar comando",
                "action": "execute_command",
                "parameters": {
                    "command": "echo 'Workflow ejecutado correctamente'"
                },
                "dependencies": ["crear_archivo"]
            }
        ]
        
        workflow_id = await engine.create_workflow(
            name="Test Workflow",
            description="Workflow de prueba",
            steps=steps
        )
        
        print(f"📋 Workflow creado: {workflow_id}")
        
        # Ejecutar workflow
        execution_id = await engine.execute_workflow(workflow_id)
        print(f"🚀 Ejecución iniciada: {execution_id}")
        
        # Esperar un poco y verificar estado
        await asyncio.sleep(2)
        
        status = await engine.get_workflow_status(execution_id)
        print(f"📊 Estado: {status}")
        
        # Obtener métricas
        metrics = await engine.get_workflow_metrics()
        print(f"📈 Métricas: {metrics}")
        
        # Cerrar engine
        await engine.shutdown()
    
    asyncio.run(test_workflow_engine())

if __name__ == "__main__":
    main()