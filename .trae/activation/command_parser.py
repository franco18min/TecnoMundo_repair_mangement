#!/usr/bin/env python3
"""
🤖 NEXUS - Parser de Comandos Naturales
Procesamiento avanzado de intenciones en español para TecnoMundo
"""

import re
import json
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

@dataclass
class CommandIntent:
    """Representa una intención detectada en un comando natural"""
    text: str
    category: str
    action: str
    target: str
    confidence: float
    parameters: Dict[str, str]
    context_required: List[str]
    estimated_tokens: int

class NaturalCommandParser:
    """Parser inteligente de comandos naturales en español"""
    
    def __init__(self, config_path: str = ".trae/activation/activation_config.json"):
        self.config_path = Path(config_path)
        self.patterns = self._load_patterns()
        self.context_cache = {}
        self.command_history = []
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def _load_patterns(self) -> Dict:
        """Carga patrones de reconocimiento de comandos"""
        return {
            "development": {
                "create": [
                    r"crear|hacer|generar\s+(un\s+)?(componente|endpoint|api|crud|modelo|esquema|servicio)",
                    r"implementar\s+(login|dashboard|autenticación|registro|perfil)",
                    r"desarrollar\s+(frontend|backend|interfaz|sistema)",
                    r"construir\s+(aplicación|sistema|módulo)"
                ],
                "modify": [
                    r"modificar|cambiar|actualizar\s+(el|la|los|las)\s+(\w+)",
                    r"agregar|añadir\s+(\w+)\s+a\s+(\w+)",
                    r"editar\s+(archivo|componente|endpoint|modelo)",
                    r"mejorar\s+(funcionalidad|diseño|código)"
                ],
                "connect": [
                    r"conectar\s+(con|a)\s+(base\s+de\s+datos|api|servicio)",
                    r"integrar\s+(\w+)\s+con\s+(\w+)",
                    r"vincular\s+(frontend|backend|componente)"
                ]
            },
            
            "debugging": {
                "error": [
                    r"hay|tengo\s+(un\s+)?error\s+(en|con)\s+(\w+)",
                    r"no\s+funciona\s+(el|la|los|las)\s+(\w+)",
                    r"problema\s+(con|en)\s+(el|la)\s+(\w+)",
                    r"falla\s+(el|la)\s+(\w+)"
                ],
                "fix": [
                    r"arreglar|solucionar|corregir\s+(error|problema|bug)",
                    r"reparar\s+(el|la)\s+(\w+)",
                    r"debuggear|depurar\s+(código|sistema|componente)",
                    r"resolver\s+(issue|problema|error)"
                ],
                "investigate": [
                    r"investigar\s+(por\s+qué|qué\s+pasa\s+con)\s+(\w+)",
                    r"analizar\s+(error|problema|comportamiento)",
                    r"revisar\s+(logs|código|configuración)"
                ]
            },
            
            "optimization": {
                "performance": [
                    r"optimizar|mejorar\s+(rendimiento|performance|velocidad)",
                    r"hacer\s+más\s+(rápido|eficiente|ligero)\s+(el|la)\s+(\w+)",
                    r"acelerar\s+(sistema|aplicación|api|carga)",
                    r"reducir\s+(tiempo|latencia|carga|peso)"
                ],
                "code": [
                    r"refactorizar|refactor\s+(código|componente|función)",
                    r"limpiar\s+(código|archivos|estructura)",
                    r"reorganizar\s+(proyecto|archivos|componentes)",
                    r"simplificar\s+(lógica|código|estructura)"
                ],
                "resources": [
                    r"reducir\s+(uso\s+de\s+memoria|consumo|tamaño)",
                    r"optimizar\s+(bundle|build|compilación)",
                    r"minimizar\s+(tokens|requests|queries)"
                ]
            },
            
            "testing": {
                "create": [
                    r"crear|hacer|escribir\s+tests?\s+(para|de)\s+(\w+)",
                    r"implementar\s+(pruebas|testing)\s+(unitarias|integración)",
                    r"agregar\s+(cobertura|tests)\s+a\s+(\w+)"
                ],
                "run": [
                    r"ejecutar|correr|probar\s+(tests?|pruebas)",
                    r"testear\s+(sistema|componente|funcionalidad|api)",
                    r"verificar\s+que\s+(.+)\s+funcione"
                ],
                "validate": [
                    r"validar\s+(funcionalidad|comportamiento|respuesta)",
                    r"comprobar\s+(si|que)\s+(.+)",
                    r"asegurar\s+que\s+(.+)"
                ]
            },
            
            "documentation": {
                "create": [
                    r"documentar\s+(sistema|api|componente|código|función)",
                    r"crear\s+(documentación|readme|guía)\s+(para|de)\s+(\w+)",
                    r"escribir\s+(docs|documentación)\s+(de|para)\s+(\w+)"
                ],
                "explain": [
                    r"explicar\s+(cómo|qué|por\s+qué)\s+(.+)",
                    r"describir\s+(el\s+funcionamiento\s+de|cómo\s+funciona)\s+(\w+)",
                    r"detallar\s+(proceso|funcionamiento|implementación)"
                ],
                "generate": [
                    r"generar\s+(readme|changelog|api\s+docs)",
                    r"crear\s+(guía|manual|tutorial)\s+(de|para)\s+(\w+)",
                    r"producir\s+(documentación|specs|especificaciones)"
                ]
            }
        }
    
    def parse_command(self, text: str) -> Optional[CommandIntent]:
        """Parsea un comando natural y extrae la intención"""
        try:
            # Limpiar y normalizar texto
            clean_text = self._normalize_text(text)
            
            # Detectar categoría y acción
            category, action, confidence = self._detect_category_action(clean_text)
            
            if confidence < 0.6:
                return None
            
            # Extraer target y parámetros
            target = self._extract_target(clean_text, category, action)
            parameters = self._extract_parameters(clean_text, category, action)
            
            # Determinar contexto requerido
            context_required = self._determine_context(category, action, target)
            
            # Estimar tokens necesarios
            estimated_tokens = self._estimate_tokens(category, action, parameters)
            
            return CommandIntent(
                text=text,
                category=category,
                action=action,
                target=target,
                confidence=confidence,
                parameters=parameters,
                context_required=context_required,
                estimated_tokens=estimated_tokens
            )
            
        except Exception as e:
            self.logger.error(f"Error parseando comando: {e}")
            return None
    
    def _normalize_text(self, text: str) -> str:
        """Normaliza el texto para mejor procesamiento"""
        # Convertir a minúsculas
        text = text.lower().strip()
        
        # Remover prefijos comunes
        prefixes = ["ai ", "nexus ", "por favor ", "puedes ", "podrías "]
        for prefix in prefixes:
            if text.startswith(prefix):
                text = text[len(prefix):].strip()
        
        # Normalizar espacios
        text = re.sub(r'\s+', ' ', text)
        
        return text
    
    def _detect_category_action(self, text: str) -> Tuple[str, str, float]:
        """Detecta la categoría y acción del comando"""
        best_match = ("unknown", "generic", 0.0)
        
        for category, actions in self.patterns.items():
            for action, patterns in actions.items():
                for pattern in patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        # Calcular confianza basada en la longitud del match
                        confidence = len(match.group(0)) / len(text)
                        confidence = min(confidence * 1.5, 1.0)  # Boost pero cap a 1.0
                        
                        if confidence > best_match[2]:
                            best_match = (category, action, confidence)
        
        return best_match
    
    def _extract_target(self, text: str, category: str, action: str) -> str:
        """Extrae el objetivo/target del comando"""
        # Patrones comunes para extraer targets
        target_patterns = [
            r"(componente|endpoint|api|modelo|esquema|servicio|función)\s+(\w+)",
            r"(el|la|los|las)\s+(\w+)",
            r"para\s+(\w+)",
            r"de\s+(\w+)",
            r"en\s+(\w+)"
        ]
        
        for pattern in target_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(-1)  # Último grupo capturado
        
        # Fallback: buscar palabras técnicas comunes
        tech_words = [
            "login", "dashboard", "usuario", "autenticación", "api", "base de datos",
            "frontend", "backend", "componente", "endpoint", "modelo", "esquema"
        ]
        
        for word in tech_words:
            if word in text:
                return word
        
        return "sistema"  # Default fallback
    
    def _extract_parameters(self, text: str, category: str, action: str) -> Dict[str, str]:
        """Extrae parámetros adicionales del comando"""
        parameters = {}
        
        # Extraer tecnologías mencionadas
        technologies = {
            "react": r"\b(react|jsx|componente)\b",
            "fastapi": r"\b(fastapi|api|endpoint)\b",
            "postgresql": r"\b(postgresql|postgres|base\s+de\s+datos|bd)\b",
            "jwt": r"\b(jwt|token|autenticación|auth)\b",
            "tailwind": r"\b(tailwind|css|estilos)\b"
        }
        
        for tech, pattern in technologies.items():
            if re.search(pattern, text, re.IGNORECASE):
                parameters["technology"] = tech
                break
        
        # Extraer prioridad
        if any(word in text for word in ["urgente", "rápido", "inmediato", "ya"]):
            parameters["priority"] = "high"
        elif any(word in text for word in ["cuando puedas", "no urgente", "después"]):
            parameters["priority"] = "low"
        else:
            parameters["priority"] = "medium"
        
        # Extraer contexto de archivo/ubicación
        file_patterns = [
            r"en\s+(el\s+archivo|la\s+carpeta|el\s+directorio)\s+(\S+)",
            r"archivo\s+(\S+\.\w+)",
            r"carpeta\s+(\S+)"
        ]
        
        for pattern in file_patterns:
            match = re.search(pattern, text)
            if match:
                parameters["location"] = match.group(-1)
                break
        
        return parameters
    
    def _determine_context(self, category: str, action: str, target: str) -> List[str]:
        """Determina qué contexto se necesita cargar"""
        context_map = {
            "development": {
                "create": ["project_structure", "existing_components", "coding_standards"],
                "modify": ["current_file", "related_files", "dependencies"],
                "connect": ["api_endpoints", "database_schema", "configuration"]
            },
            "debugging": {
                "error": ["error_logs", "recent_changes", "system_status"],
                "fix": ["error_patterns", "similar_fixes", "code_context"],
                "investigate": ["full_logs", "system_metrics", "recent_activity"]
            },
            "optimization": {
                "performance": ["performance_metrics", "bottlenecks", "resource_usage"],
                "code": ["code_quality", "duplication", "complexity"],
                "resources": ["bundle_analysis", "memory_usage", "network_requests"]
            },
            "testing": {
                "create": ["existing_tests", "test_patterns", "coverage_report"],
                "run": ["test_configuration", "test_environment", "dependencies"],
                "validate": ["expected_behavior", "test_data", "validation_rules"]
            },
            "documentation": {
                "create": ["code_structure", "api_specs", "usage_examples"],
                "explain": ["implementation_details", "architecture", "dependencies"],
                "generate": ["project_metadata", "api_endpoints", "configuration"]
            }
        }
        
        return context_map.get(category, {}).get(action, ["basic_context"])
    
    def _estimate_tokens(self, category: str, action: str, parameters: Dict[str, str]) -> int:
        """Estima tokens necesarios basado en el tipo de comando"""
        base_tokens = {
            "development": {"create": 400, "modify": 300, "connect": 350},
            "debugging": {"error": 500, "fix": 600, "investigate": 700},
            "optimization": {"performance": 450, "code": 400, "resources": 350},
            "testing": {"create": 300, "run": 200, "validate": 250},
            "documentation": {"create": 350, "explain": 400, "generate": 300}
        }
        
        base = base_tokens.get(category, {}).get(action, 300)
        
        # Ajustar por prioridad
        priority_multiplier = {
            "high": 0.8,    # Menos tokens para respuestas rápidas
            "medium": 1.0,  # Tokens normales
            "low": 1.2      # Más tokens para respuestas detalladas
        }
        
        multiplier = priority_multiplier.get(parameters.get("priority", "medium"), 1.0)
        
        return int(base * multiplier)
    
    def get_execution_strategy(self, intent: CommandIntent) -> Dict[str, any]:
        """Determina la estrategia de ejecución para un comando"""
        return {
            "use_cache": intent.confidence > 0.8,
            "load_full_context": intent.category in ["debugging", "optimization"],
            "auto_execute": intent.confidence > 0.9 and intent.category != "debugging",
            "require_confirmation": intent.category == "debugging" and "error" in intent.action,
            "estimated_time": self._estimate_execution_time(intent),
            "suggested_tools": self._suggest_tools(intent)
        }
    
    def _estimate_execution_time(self, intent: CommandIntent) -> str:
        """Estima tiempo de ejecución"""
        time_map = {
            "development": "2-5 minutos",
            "debugging": "3-10 minutos", 
            "optimization": "5-15 minutos",
            "testing": "1-3 minutos",
            "documentation": "2-5 minutos"
        }
        return time_map.get(intent.category, "2-5 minutos")
    
    def _suggest_tools(self, intent: CommandIntent) -> List[str]:
        """Sugiere herramientas necesarias"""
        tool_map = {
            "development": ["edit_file_fast_apply", "write_to_file", "search_codebase"],
            "debugging": ["search_by_regex", "view_files", "run_command"],
            "optimization": ["search_codebase", "run_command", "view_files"],
            "testing": ["run_command", "write_to_file", "view_files"],
            "documentation": ["write_to_file", "search_codebase", "view_files"]
        }
        return tool_map.get(intent.category, ["search_codebase", "view_files"])

def main():
    """Función principal para testing"""
    parser = NaturalCommandParser()
    
    # Comandos de prueba
    test_commands = [
        "crear componente de login",
        "hay error en la autenticación",
        "optimizar rendimiento del dashboard",
        "probar sistema de órdenes",
        "documentar API de usuarios"
    ]
    
    for command in test_commands:
        intent = parser.parse_command(command)
        if intent:
            strategy = parser.get_execution_strategy(intent)
            print(f"\n🤖 Comando: {command}")
            print(f"   Categoría: {intent.category}")
            print(f"   Acción: {intent.action}")
            print(f"   Target: {intent.target}")
            print(f"   Confianza: {intent.confidence:.2f}")
            print(f"   Tokens estimados: {intent.estimated_tokens}")
            print(f"   Estrategia: {strategy}")

if __name__ == "__main__":
    main()