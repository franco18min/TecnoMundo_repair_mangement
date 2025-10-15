#!/usr/bin/env python3
"""
🔗 NEXUS - Full Stack Integration
Integración completa con el proyecto TecnoMundo Repair Management
Trae 2.0 - Sistema Autónomo
"""

import json
import asyncio
import aiohttp
import websockets
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
import logging
import subprocess
import psutil
import sqlite3
import threading
from concurrent.futures import ThreadPoolExecutor
import yaml
import os
import sys

# Importar módulos NEXUS
sys.path.append(str(Path(__file__).parent.parent))
from automation.context_handler import ContextHandler
from automation.workflow_engine import WorkflowEngine
from automation.task_manager import TaskManager
from optimization.token_optimizer import TokenOptimizer
from optimization.performance_optimizer import PerformanceOptimizer
from optimization.mcp.memory_manager import MemoryManager
from optimization.ml.adaptive_learning import AdaptiveLearningSystem

@dataclass
class ProjectState:
    """Estado del proyecto full stack"""
    frontend_status: str = "unknown"
    backend_status: str = "unknown"
    database_status: str = "unknown"
    frontend_port: int = 5173
    backend_port: int = 8001
    database_port: int = 5432
    last_updated: datetime = field(default_factory=datetime.now)
    active_processes: Dict[str, int] = field(default_factory=dict)
    health_checks: Dict[str, bool] = field(default_factory=dict)
    performance_metrics: Dict[str, float] = field(default_factory=dict)

@dataclass
class IntegrationConfig:
    """Configuración de integración"""
    project_root: str
    frontend_dir: str = "frontend"
    backend_dir: str = "backend"
    database_config: Dict[str, Any] = field(default_factory=dict)
    auto_start_services: bool = True
    health_check_interval: int = 30
    performance_monitoring: bool = True
    websocket_enabled: bool = True
    api_integration: bool = True
    hot_reload: bool = True

class NexusIntegration:
    """Integración principal de NEXUS con el proyecto full stack"""
    
    def __init__(self, config_path: str = ".trae/integration/config.yaml"):
        self.config_path = Path(config_path)
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Cargar configuración
        self.config = self._load_config()
        
        # Estado del proyecto
        self.project_state = ProjectState()
        
        # Componentes NEXUS
        self.context_handler = ContextHandler()
        self.workflow_engine = WorkflowEngine()
        self.task_manager = TaskManager()
        self.token_optimizer = TokenOptimizer()
        self.performance_optimizer = PerformanceOptimizer()
        self.memory_manager = MemoryManager()
        self.learning_system = AdaptiveLearningSystem()
        
        # Servicios de integración
        self.websocket_server = None
        self.api_client = None
        self.process_monitor = None
        
        # Handlers y callbacks
        self.event_handlers: Dict[str, List[Callable]] = {}
        self.api_endpoints: Dict[str, Callable] = {}
        
        # Estado de integración
        self.integration_active = False
        self.monitoring_active = False
        
        # Executor para tareas asíncronas
        self.executor = ThreadPoolExecutor(max_workers=8)
        
        # Logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Inicializar componentes
        self._initialize_components()
        
        self.logger.info("🔗 NEXUS Integration iniciado")
    
    async def start_integration(self) -> bool:
        """Inicia la integración completa"""
        
        try:
            self.logger.info("🚀 Iniciando integración NEXUS...")
            
            # 1. Verificar estructura del proyecto
            if not await self._verify_project_structure():
                raise RuntimeError("Estructura del proyecto inválida")
            
            # 2. Inicializar base de datos de integración
            await self._initialize_integration_database()
            
            # 3. Cargar contexto del proyecto
            await self._load_project_context()
            
            # 4. Iniciar servicios del proyecto si está configurado
            if self.config.auto_start_services:
                await self._start_project_services()
            
            # 5. Iniciar monitoreo
            if self.config.performance_monitoring:
                await self._start_monitoring()
            
            # 6. Configurar WebSocket si está habilitado
            if self.config.websocket_enabled:
                await self._start_websocket_server()
            
            # 7. Configurar integración API
            if self.config.api_integration:
                await self._setup_api_integration()
            
            # 8. Registrar workflows de integración
            await self._register_integration_workflows()
            
            # 9. Iniciar sistema de aprendizaje
            await self._start_learning_system()
            
            self.integration_active = True
            
            # Crear contexto inicial
            await self._create_integration_context()
            
            self.logger.info("✅ Integración NEXUS completada exitosamente")
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Error en integración: {e}")
            await self._cleanup_integration()
            return False
    
    async def stop_integration(self) -> bool:
        """Detiene la integración"""
        
        try:
            self.logger.info("🛑 Deteniendo integración NEXUS...")
            
            # Detener monitoreo
            self.monitoring_active = False
            
            # Cerrar WebSocket server
            if self.websocket_server:
                self.websocket_server.close()
                await self.websocket_server.wait_closed()
            
            # Guardar contexto final
            await self._save_final_context()
            
            # Cerrar componentes NEXUS
            await self._shutdown_components()
            
            # Limpiar recursos
            await self._cleanup_integration()
            
            self.integration_active = False
            
            self.logger.info("✅ Integración NEXUS detenida")
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Error deteniendo integración: {e}")
            return False
    
    async def get_project_status(self) -> Dict[str, Any]:
        """Obtiene el estado completo del proyecto"""
        
        try:
            # Actualizar estado
            await self._update_project_state()
            
            # Obtener métricas de rendimiento
            performance_metrics = await self.performance_optimizer.get_current_metrics()
            
            # Obtener estado de contextos
            context_analytics = await self.context_handler.get_context_analytics()
            
            # Obtener métricas de workflows
            workflow_metrics = await self.workflow_engine.get_workflow_metrics()
            
            # Obtener estado de tareas
            task_status = await self.task_manager.get_system_status()
            
            return {
                "integration_status": {
                    "active": self.integration_active,
                    "monitoring": self.monitoring_active,
                    "last_updated": datetime.now().isoformat()
                },
                "project_state": {
                    "frontend": {
                        "status": self.project_state.frontend_status,
                        "port": self.project_state.frontend_port,
                        "health": self.project_state.health_checks.get("frontend", False)
                    },
                    "backend": {
                        "status": self.project_state.backend_status,
                        "port": self.project_state.backend_port,
                        "health": self.project_state.health_checks.get("backend", False)
                    },
                    "database": {
                        "status": self.project_state.database_status,
                        "port": self.project_state.database_port,
                        "health": self.project_state.health_checks.get("database", False)
                    }
                },
                "performance_metrics": performance_metrics,
                "context_analytics": context_analytics,
                "workflow_metrics": workflow_metrics,
                "task_status": task_status,
                "nexus_components": {
                    "context_handler": self.context_handler.get_system_status(),
                    "memory_manager": await self.memory_manager.get_status(),
                    "learning_system": await self.learning_system.get_system_status()
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error obteniendo estado del proyecto: {e}")
            return {"error": str(e)}
    
    async def execute_natural_command(
        self,
        command: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Ejecuta un comando natural usando NEXUS"""
        
        try:
            self.logger.info(f"🎯 Ejecutando comando natural: {command}")
            
            # Optimizar tokens del comando
            optimized_command = await self.token_optimizer.optimize_prompt(
                command,
                context or {}
            )
            
            # Detectar intención y categoría
            from activation.command_parser import NaturalCommandParser
            parser = NaturalCommandParser()
            
            parsed_command = await parser.parse_command(optimized_command["optimized_prompt"])
            
            # Cargar contexto necesario
            required_contexts = parsed_command.get("required_context", [])
            loaded_context = {}
            
            for context_type in required_contexts:
                context_data = await self._load_context_by_type(context_type)
                if context_data:
                    loaded_context[context_type] = context_data
            
            # Crear workflow para el comando
            workflow_id = await self._create_command_workflow(parsed_command, loaded_context)
            
            # Ejecutar workflow
            execution_id = await self.workflow_engine.execute_workflow(
                workflow_id,
                input_data={
                    "original_command": command,
                    "parsed_command": parsed_command,
                    "context": loaded_context
                },
                triggered_by="natural_command"
            )
            
            # Esperar resultado (con timeout)
            result = await self._wait_for_workflow_completion(execution_id, timeout=300)
            
            # Aprender del resultado
            await self.learning_system.learn_from_interaction(
                user_input=command,
                system_response=result,
                context=loaded_context,
                success=result.get("success", False)
            )
            
            # Actualizar contexto
            await self._update_command_context(command, result)
            
            return {
                "success": True,
                "command": command,
                "parsed_command": parsed_command,
                "execution_id": execution_id,
                "result": result,
                "token_optimization": optimized_command.get("optimization_stats", {}),
                "context_used": list(loaded_context.keys())
            }
            
        except Exception as e:
            self.logger.error(f"Error ejecutando comando natural: {e}")
            
            # Aprender del error
            await self.learning_system.learn_from_interaction(
                user_input=command,
                system_response={"error": str(e)},
                context=context or {},
                success=False
            )
            
            return {
                "success": False,
                "command": command,
                "error": str(e)
            }
    
    async def start_development_session(
        self,
        session_name: str,
        focus_areas: Optional[List[str]] = None
    ) -> str:
        """Inicia una sesión de desarrollo optimizada"""
        
        try:
            self.logger.info(f"🎯 Iniciando sesión de desarrollo: {session_name}")
            
            # Crear contexto de sesión
            session_context = {
                "session_name": session_name,
                "focus_areas": focus_areas or [],
                "started_at": datetime.now().isoformat(),
                "project_state": await self.get_project_status()
            }
            
            # Almacenar contexto de sesión
            session_id = f"dev_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            await self.context_handler.store_context(
                context_id=session_id,
                context_type="development_session",
                data=session_context,
                tags=["development", "session"] + (focus_areas or [])
            )
            
            # Crear snapshot inicial
            snapshot_id = await self.context_handler.create_snapshot(
                snapshot_id=f"{session_id}_initial"
            )
            
            # Optimizar rendimiento para desarrollo
            await self.performance_optimizer.optimize_for_development()
            
            # Precargar contextos relevantes
            await self._preload_development_contexts(focus_areas)
            
            # Configurar monitoreo específico
            await self._setup_development_monitoring(session_id)
            
            self.logger.info(f"✅ Sesión de desarrollo iniciada: {session_id}")
            
            return session_id
            
        except Exception as e:
            self.logger.error(f"Error iniciando sesión de desarrollo: {e}")
            raise
    
    async def optimize_project_performance(self) -> Dict[str, Any]:
        """Optimiza el rendimiento del proyecto completo"""
        
        try:
            self.logger.info("⚡ Iniciando optimización de rendimiento...")
            
            optimization_results = {}
            
            # 1. Optimizar contextos
            context_optimization = await self.context_handler.optimize_contexts()
            optimization_results["context_optimization"] = context_optimization
            
            # 2. Optimizar memoria
            memory_optimization = await self.memory_manager.optimize_memory()
            optimization_results["memory_optimization"] = memory_optimization
            
            # 3. Optimizar rendimiento del sistema
            system_optimization = await self.performance_optimizer.optimize_system()
            optimization_results["system_optimization"] = system_optimization
            
            # 4. Limpiar recursos no utilizados
            cleanup_results = await self._cleanup_unused_resources()
            optimization_results["cleanup_results"] = cleanup_results
            
            # 5. Optimizar base de datos
            db_optimization = await self._optimize_database()
            optimization_results["database_optimization"] = db_optimization
            
            # 6. Optimizar archivos del proyecto
            file_optimization = await self._optimize_project_files()
            optimization_results["file_optimization"] = file_optimization
            
            # Crear reporte de optimización
            optimization_report = {
                "timestamp": datetime.now().isoformat(),
                "total_optimizations": len(optimization_results),
                "results": optimization_results,
                "performance_improvement": await self._calculate_performance_improvement(),
                "recommendations": await self._generate_optimization_recommendations()
            }
            
            # Almacenar reporte
            await self.context_handler.store_context(
                context_id=f"optimization_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                context_type="optimization_report",
                data=optimization_report,
                tags=["optimization", "performance", "report"]
            )
            
            self.logger.info("✅ Optimización de rendimiento completada")
            
            return optimization_report
            
        except Exception as e:
            self.logger.error(f"Error en optimización de rendimiento: {e}")
            return {"error": str(e)}
    
    async def handle_project_error(
        self,
        error_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Maneja errores del proyecto automáticamente"""
        
        try:
            self.logger.info(f"🔧 Manejando error del proyecto: {error_info.get('type', 'unknown')}")
            
            # Analizar error con ML
            error_analysis = await self.learning_system.analyze_error(error_info)
            
            # Buscar soluciones conocidas
            known_solutions = await self._find_known_solutions(error_info)
            
            # Generar plan de resolución
            resolution_plan = await self._generate_resolution_plan(
                error_info,
                error_analysis,
                known_solutions
            )
            
            # Ejecutar plan de resolución
            resolution_results = await self._execute_resolution_plan(resolution_plan)
            
            # Verificar si el error fue resuelto
            error_resolved = await self._verify_error_resolution(error_info)
            
            # Aprender de la resolución
            await self.learning_system.learn_from_error_resolution(
                error_info,
                resolution_plan,
                resolution_results,
                error_resolved
            )
            
            # Crear reporte de resolución
            resolution_report = {
                "error_info": error_info,
                "analysis": error_analysis,
                "known_solutions": known_solutions,
                "resolution_plan": resolution_plan,
                "resolution_results": resolution_results,
                "error_resolved": error_resolved,
                "timestamp": datetime.now().isoformat()
            }
            
            # Almacenar reporte
            await self.context_handler.store_context(
                context_id=f"error_resolution_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                context_type="error_resolution",
                data=resolution_report,
                tags=["error", "resolution", error_info.get("type", "unknown")]
            )
            
            return resolution_report
            
        except Exception as e:
            self.logger.error(f"Error manejando error del proyecto: {e}")
            return {"error": str(e), "original_error": error_info}
    
    # Métodos auxiliares
    
    def _load_config(self) -> IntegrationConfig:
        """Carga la configuración de integración"""
        
        default_config = {
            "project_root": str(Path.cwd()),
            "frontend_dir": "frontend",
            "backend_dir": "backend",
            "database_config": {
                "host": "localhost",
                "port": 5432,
                "database": "tecnomundo_repair",
                "user": "postgres"
            },
            "auto_start_services": True,
            "health_check_interval": 30,
            "performance_monitoring": True,
            "websocket_enabled": True,
            "api_integration": True,
            "hot_reload": True
        }
        
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    loaded_config = yaml.safe_load(f)
                    default_config.update(loaded_config)
            except Exception as e:
                self.logger.warning(f"Error cargando configuración: {e}")
        else:
            # Crear archivo de configuración por defecto
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_path, 'w', encoding='utf-8') as f:
                yaml.dump(default_config, f, default_flow_style=False)
        
        return IntegrationConfig(**default_config)
    
    def _initialize_components(self):
        """Inicializa los componentes NEXUS"""
        
        # Configurar handlers de eventos
        self.workflow_engine.register_event_handler(
            "workflow_completed",
            self._handle_workflow_completion
        )
        
        self.workflow_engine.register_event_handler(
            "workflow_failed",
            self._handle_workflow_failure
        )
        
        # Registrar handlers de pasos personalizados
        self._register_custom_step_handlers()
    
    def _register_custom_step_handlers(self):
        """Registra handlers de pasos personalizados para el proyecto"""
        
        # Handler para comandos npm
        async def npm_command_handler(**params):
            command = params.get("command")
            cwd = params.get("cwd", self.config.project_root)
            
            if not command:
                raise ValueError("Comando npm no especificado")
            
            full_command = f"npm {command}"
            
            result = subprocess.run(
                full_command,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=params.get("timeout", 300)
            )
            
            return {
                "command": full_command,
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "success": result.returncode == 0
            }
        
        # Handler para comandos Python/FastAPI
        async def python_command_handler(**params):
            command = params.get("command")
            cwd = params.get("cwd", self.config.project_root)
            virtual_env = params.get("virtual_env", "venv")
            
            if not command:
                raise ValueError("Comando Python no especificado")
            
            # Activar entorno virtual si existe
            venv_path = Path(cwd) / virtual_env
            if venv_path.exists():
                if os.name == 'nt':  # Windows
                    activate_script = venv_path / "Scripts" / "activate.bat"
                    full_command = f'"{activate_script}" && {command}'
                else:  # Unix/Linux
                    activate_script = venv_path / "bin" / "activate"
                    full_command = f'source "{activate_script}" && {command}'
            else:
                full_command = command
            
            result = subprocess.run(
                full_command,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=params.get("timeout", 300)
            )
            
            return {
                "command": full_command,
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "success": result.returncode == 0
            }
        
        # Handler para operaciones de base de datos
        async def database_operation_handler(**params):
            operation = params.get("operation")
            query = params.get("query")
            
            if not operation:
                raise ValueError("Operación de base de datos no especificada")
            
            # Implementar operaciones básicas de BD
            # (Simplificado para el ejemplo)
            
            return {
                "operation": operation,
                "success": True,
                "message": f"Operación {operation} ejecutada"
            }
        
        # Registrar handlers
        self.workflow_engine.register_step_handler("npm_command", npm_command_handler)
        self.workflow_engine.register_step_handler("python_command", python_command_handler)
        self.workflow_engine.register_step_handler("database_operation", database_operation_handler)
    
    async def _verify_project_structure(self) -> bool:
        """Verifica la estructura del proyecto"""
        
        project_root = Path(self.config.project_root)
        
        required_paths = [
            project_root / self.config.frontend_dir,
            project_root / self.config.backend_dir,
            project_root / self.config.frontend_dir / "package.json",
            project_root / self.config.backend_dir / "main.py"
        ]
        
        for path in required_paths:
            if not path.exists():
                self.logger.error(f"Ruta requerida no encontrada: {path}")
                return False
        
        return True
    
    async def _start_project_services(self):
        """Inicia los servicios del proyecto"""
        
        try:
            # Iniciar backend
            backend_process = await self._start_backend_service()
            if backend_process:
                self.project_state.active_processes["backend"] = backend_process.pid
                self.project_state.backend_status = "running"
            
            # Esperar un poco para que el backend se inicie
            await asyncio.sleep(3)
            
            # Iniciar frontend
            frontend_process = await self._start_frontend_service()
            if frontend_process:
                self.project_state.active_processes["frontend"] = frontend_process.pid
                self.project_state.frontend_status = "running"
            
            # Verificar base de datos
            db_status = await self._check_database_status()
            self.project_state.database_status = "running" if db_status else "stopped"
            
        except Exception as e:
            self.logger.error(f"Error iniciando servicios: {e}")
    
    async def _start_backend_service(self) -> Optional[subprocess.Popen]:
        """Inicia el servicio backend"""
        
        try:
            backend_dir = Path(self.config.project_root) / self.config.backend_dir
            
            # Comando para iniciar FastAPI
            command = [
                "uvicorn",
                "main:app",
                "--reload",
                f"--port={self.project_state.backend_port}",
                "--host=0.0.0.0"
            ]
            
            process = subprocess.Popen(
                command,
                cwd=backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            self.logger.info(f"🚀 Backend iniciado en puerto {self.project_state.backend_port}")
            
            return process
            
        except Exception as e:
            self.logger.error(f"Error iniciando backend: {e}")
            return None
    
    async def _start_frontend_service(self) -> Optional[subprocess.Popen]:
        """Inicia el servicio frontend"""
        
        try:
            frontend_dir = Path(self.config.project_root) / self.config.frontend_dir
            
            # Comando para iniciar Vite
            command = ["npm", "run", "dev"]
            
            process = subprocess.Popen(
                command,
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            self.logger.info(f"🚀 Frontend iniciado en puerto {self.project_state.frontend_port}")
            
            return process
            
        except Exception as e:
            self.logger.error(f"Error iniciando frontend: {e}")
            return None
    
    async def _check_database_status(self) -> bool:
        """Verifica el estado de la base de datos"""
        
        try:
            # Intentar conexión a PostgreSQL
            import psycopg2
            
            conn = psycopg2.connect(
                host=self.config.database_config["host"],
                port=self.config.database_config["port"],
                database=self.config.database_config["database"],
                user=self.config.database_config["user"],
                connect_timeout=5
            )
            
            conn.close()
            return True
            
        except Exception:
            return False
    
    async def shutdown(self):
        """Cierra la integración limpiamente"""
        
        await self.stop_integration()
        
        # Cerrar componentes NEXUS
        await self.context_handler.shutdown()
        await self.workflow_engine.shutdown()
        await self.task_manager.shutdown()
        await self.memory_manager.shutdown()
        
        # Cerrar executor
        self.executor.shutdown(wait=True)
        
        self.logger.info("🛑 NEXUS Integration cerrado")

def main():
    """Función principal para testing"""
    async def test_integration():
        integration = NexusIntegration()
        
        # Iniciar integración
        success = await integration.start_integration()
        print(f"🔗 Integración iniciada: {success}")
        
        if success:
            # Obtener estado del proyecto
            status = await integration.get_project_status()
            print(f"📊 Estado del proyecto: {status}")
            
            # Ejecutar comando natural de prueba
            result = await integration.execute_natural_command(
                "crear componente de login para el frontend"
            )
            print(f"🎯 Comando ejecutado: {result}")
            
            # Optimizar rendimiento
            optimization = await integration.optimize_project_performance()
            print(f"⚡ Optimización: {optimization}")
        
        # Cerrar integración
        await integration.shutdown()
    
    asyncio.run(test_integration())

if __name__ == "__main__":
    main()