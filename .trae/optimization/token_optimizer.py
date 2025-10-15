#!/usr/bin/env python3
"""
🚀 NEXUS - Optimizador Avanzado de Tokens
Técnicas de IA para minimización inteligente de tokens
TecnoMundo Repair Management - Trae 2.0
"""

import re
import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
import hashlib
import pickle

@dataclass
class TokenOptimization:
    """Resultado de optimización de tokens"""
    original_tokens: int
    optimized_tokens: int
    reduction_percentage: float
    optimization_techniques: List[str]
    quality_score: float
    execution_time: float
    cache_hit: bool

@dataclass
class ContextPattern:
    """Patrón de contexto reutilizable"""
    pattern_id: str
    context_type: str
    template: str
    variables: List[str]
    usage_count: int
    success_rate: float
    last_used: datetime

class TokenOptimizer:
    """Optimizador inteligente de tokens con técnicas avanzadas de IA"""
    
    def __init__(self, cache_dir: str = ".trae/cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Archivos de caché
        self.patterns_cache = self.cache_dir / "context_patterns.pkl"
        self.optimization_history = self.cache_dir / "optimization_history.json"
        self.token_metrics = self.cache_dir / "token_metrics.json"
        
        # Cargar patrones y métricas
        self.context_patterns = self._load_patterns()
        self.optimization_stats = self._load_optimization_stats()
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Técnicas de optimización disponibles
        self.optimization_techniques = {
            "context_compression": self._compress_context,
            "pattern_matching": self._apply_pattern_matching,
            "redundancy_removal": self._remove_redundancy,
            "smart_summarization": self._smart_summarize,
            "template_substitution": self._apply_templates,
            "adaptive_detail": self._adaptive_detail_level,
            "cache_utilization": self._utilize_cache,
            "predictive_loading": self._predictive_context_loading
        }
    
    def optimize_prompt(self, 
                       prompt: str, 
                       context: Dict[str, Any], 
                       target_tokens: int = 400,
                       priority: str = "medium") -> Tuple[str, TokenOptimization]:
        """Optimiza un prompt usando técnicas avanzadas de IA"""
        
        start_time = datetime.now()
        original_tokens = self._estimate_tokens(prompt + str(context))
        
        self.logger.info(f"🎯 Optimizando prompt - Tokens originales: {original_tokens}, Target: {target_tokens}")
        
        # Aplicar técnicas de optimización en orden de eficiencia
        optimized_prompt = prompt
        optimized_context = context.copy()
        applied_techniques = []
        cache_hit = False
        
        # 1. Verificar caché de patrones
        pattern_result = self._check_pattern_cache(prompt, context)
        if pattern_result:
            optimized_prompt, optimized_context = pattern_result
            applied_techniques.append("pattern_cache")
            cache_hit = True
        
        # 2. Aplicar técnicas según prioridad
        if priority == "high":
            # Optimización agresiva para respuestas rápidas
            techniques_order = [
                "context_compression", "template_substitution", 
                "redundancy_removal", "cache_utilization"
            ]
        elif priority == "low":
            # Optimización conservadora para respuestas detalladas
            techniques_order = [
                "smart_summarization", "adaptive_detail", 
                "pattern_matching", "predictive_loading"
            ]
        else:
            # Optimización balanceada
            techniques_order = [
                "pattern_matching", "context_compression",
                "redundancy_removal", "template_substitution",
                "adaptive_detail", "cache_utilization"
            ]
        
        current_tokens = self._estimate_tokens(optimized_prompt + str(optimized_context))
        
        for technique_name in techniques_order:
            if current_tokens <= target_tokens:
                break
                
            technique = self.optimization_techniques[technique_name]
            try:
                new_prompt, new_context = technique(optimized_prompt, optimized_context, target_tokens)
                new_tokens = self._estimate_tokens(new_prompt + str(new_context))
                
                if new_tokens < current_tokens:
                    optimized_prompt = new_prompt
                    optimized_context = new_context
                    current_tokens = new_tokens
                    applied_techniques.append(technique_name)
                    
                    self.logger.debug(f"✅ {technique_name}: {current_tokens} tokens")
                
            except Exception as e:
                self.logger.warning(f"⚠️ Error en {technique_name}: {e}")
        
        # Calcular métricas de optimización
        final_tokens = self._estimate_tokens(optimized_prompt + str(optimized_context))
        reduction_percentage = ((original_tokens - final_tokens) / original_tokens) * 100
        quality_score = self._calculate_quality_score(prompt, optimized_prompt, context, optimized_context)
        execution_time = (datetime.now() - start_time).total_seconds()
        
        optimization_result = TokenOptimization(
            original_tokens=original_tokens,
            optimized_tokens=final_tokens,
            reduction_percentage=reduction_percentage,
            optimization_techniques=applied_techniques,
            quality_score=quality_score,
            execution_time=execution_time,
            cache_hit=cache_hit
        )
        
        # Guardar patrón si es exitoso
        if reduction_percentage > 20 and quality_score > 0.8:
            self._save_successful_pattern(prompt, context, optimized_prompt, optimized_context)
        
        # Actualizar estadísticas
        self._update_optimization_stats(optimization_result)
        
        self.logger.info(f"🎉 Optimización completada - Reducción: {reduction_percentage:.1f}%, Calidad: {quality_score:.2f}")
        
        return self._combine_prompt_context(optimized_prompt, optimized_context), optimization_result
    
    def _compress_context(self, prompt: str, context: Dict[str, Any], target_tokens: int) -> Tuple[str, Dict[str, Any]]:
        """Comprime el contexto eliminando información redundante"""
        compressed_context = {}
        
        for key, value in context.items():
            if key in ["project_info", "structure"]:
                # Mantener información esencial
                compressed_context[key] = value
            elif key == "recent_activity" and isinstance(value, list):
                # Limitar actividad reciente a elementos más relevantes
                compressed_context[key] = value[:3] if len(value) > 3 else value
            elif key == "cached_patterns" and isinstance(value, list):
                # Mantener solo patrones más utilizados
                compressed_context[key] = value[:2] if len(value) > 2 else value
            elif isinstance(value, str) and len(value) > 200:
                # Resumir strings largos
                compressed_context[key] = value[:150] + "..."
            else:
                compressed_context[key] = value
        
        return prompt, compressed_context
    
    def _apply_pattern_matching(self, prompt: str, context: Dict[str, Any], target_tokens: int) -> Tuple[str, Dict[str, Any]]:
        """Aplica patrones conocidos para optimizar el contexto"""
        prompt_hash = self._generate_prompt_hash(prompt)
        
        # Buscar patrones similares
        for pattern in self.context_patterns:
            if pattern.context_type in prompt.lower() and pattern.success_rate > 0.7:
                # Aplicar template del patrón
                optimized_context = self._apply_pattern_template(context, pattern)
                pattern.usage_count += 1
                pattern.last_used = datetime.now()
                return prompt, optimized_context
        
        return prompt, context
    
    def _remove_redundancy(self, prompt: str, context: Dict[str, Any], target_tokens: int) -> Tuple[str, Dict[str, Any]]:
        """Elimina información redundante del contexto"""
        cleaned_context = {}
        seen_values = set()
        
        for key, value in context.items():
            value_str = str(value)
            value_hash = hashlib.md5(value_str.encode()).hexdigest()
            
            if value_hash not in seen_values:
                cleaned_context[key] = value
                seen_values.add(value_hash)
        
        # Limpiar prompt de repeticiones
        words = prompt.split()
        cleaned_words = []
        seen_phrases = set()
        
        for i, word in enumerate(words):
            # Verificar frases de 3 palabras
            if i < len(words) - 2:
                phrase = " ".join(words[i:i+3])
                if phrase not in seen_phrases:
                    cleaned_words.append(word)
                    seen_phrases.add(phrase)
                else:
                    continue
            else:
                cleaned_words.append(word)
        
        cleaned_prompt = " ".join(cleaned_words)
        return cleaned_prompt, cleaned_context
    
    def _smart_summarize(self, prompt: str, context: Dict[str, Any], target_tokens: int) -> Tuple[str, Dict[str, Any]]:
        """Resumir inteligentemente manteniendo información clave"""
        # Identificar palabras clave importantes
        key_terms = [
            "crear", "implementar", "error", "optimizar", "probar", "documentar",
            "react", "fastapi", "postgresql", "jwt", "componente", "endpoint", "api"
        ]
        
        # Mantener oraciones que contengan términos clave
        sentences = prompt.split('.')
        important_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if any(term in sentence.lower() for term in key_terms):
                important_sentences.append(sentence)
            elif len(important_sentences) == 0:  # Mantener al menos la primera oración
                important_sentences.append(sentence)
        
        summarized_prompt = '. '.join(important_sentences)
        if not summarized_prompt.endswith('.'):
            summarized_prompt += '.'
        
        # Resumir contexto manteniendo estructura esencial
        summarized_context = {
            "focus": context.get("focus", "Desarrollo general"),
            "tools": context.get("tools", [])[:3],  # Máximo 3 herramientas
            "project_info": {
                "name": context.get("project_info", {}).get("name", "TecnoMundo"),
                "type": context.get("project_info", {}).get("type", "Full Stack")
            }
        }
        
        return summarized_prompt, summarized_context
    
    def _apply_templates(self, prompt: str, context: Dict[str, Any], target_tokens: int) -> Tuple[str, Dict[str, Any]]:
        """Aplica templates predefinidos para contextos comunes"""
        templates = {
            "development": {
                "context": {
                    "focus": "Desarrollo {technology}",
                    "tools": ["edit_file_fast_apply", "write_to_file"],
                    "project": "TecnoMundo Full Stack"
                }
            },
            "debugging": {
                "context": {
                    "focus": "Resolución de errores",
                    "tools": ["search_by_regex", "view_files"],
                    "project": "TecnoMundo Debug"
                }
            },
            "optimization": {
                "context": {
                    "focus": "Optimización de rendimiento",
                    "tools": ["search_codebase", "run_command"],
                    "project": "TecnoMundo Optimization"
                }
            }
        }
        
        # Detectar tipo de contexto
        context_type = None
        for template_type in templates.keys():
            if template_type in prompt.lower():
                context_type = template_type
                break
        
        if context_type and context_type in templates:
            template_context = templates[context_type]["context"].copy()
            
            # Sustituir variables
            if "{technology}" in str(template_context):
                tech = "React" if "react" in prompt.lower() else "FastAPI" if "api" in prompt.lower() else "Full Stack"
                template_context = json.loads(json.dumps(template_context).replace("{technology}", tech))
            
            return prompt, template_context
        
        return prompt, context
    
    def _adaptive_detail_level(self, prompt: str, context: Dict[str, Any], target_tokens: int) -> Tuple[str, Dict[str, Any]]:
        """Adapta el nivel de detalle según el target de tokens"""
        current_tokens = self._estimate_tokens(prompt + str(context))
        
        if current_tokens <= target_tokens:
            return prompt, context
        
        # Calcular factor de reducción necesario
        reduction_factor = target_tokens / current_tokens
        
        if reduction_factor < 0.5:
            # Reducción agresiva - contexto mínimo
            minimal_context = {
                "focus": context.get("focus", "Desarrollo"),
                "tools": context.get("tools", [])[:2]
            }
            return prompt, minimal_context
        
        elif reduction_factor < 0.8:
            # Reducción moderada - contexto esencial
            essential_context = {
                "focus": context.get("focus"),
                "tools": context.get("tools", [])[:3],
                "project_info": {
                    "name": context.get("project_info", {}).get("name"),
                    "type": context.get("project_info", {}).get("type")
                }
            }
            return prompt, essential_context
        
        return prompt, context
    
    def _utilize_cache(self, prompt: str, context: Dict[str, Any], target_tokens: int) -> Tuple[str, Dict[str, Any]]:
        """Utiliza caché para reducir contexto necesario"""
        # Generar referencia a caché
        cache_ref = f"[Contexto en caché: {self._generate_prompt_hash(prompt)[:8]}]"
        
        # Contexto mínimo con referencia a caché
        cached_context = {
            "cache_ref": cache_ref,
            "focus": context.get("focus"),
            "tools": context.get("tools", [])[:2]
        }
        
        return prompt, cached_context
    
    def _predictive_context_loading(self, prompt: str, context: Dict[str, Any], target_tokens: int) -> Tuple[str, Dict[str, Any]]:
        """Carga contexto predictivamente basado en patrones históricos"""
        # Analizar historial para predecir contexto necesario
        predicted_context = {
            "predicted": True,
            "focus": context.get("focus"),
            "likely_tools": self._predict_tools_needed(prompt),
            "confidence": 0.85
        }
        
        return prompt, predicted_context
    
    def _predict_tools_needed(self, prompt: str) -> List[str]:
        """Predice herramientas necesarias basado en el prompt"""
        tool_patterns = {
            "crear|hacer|generar": ["edit_file_fast_apply", "write_to_file"],
            "error|problema|debug": ["search_by_regex", "view_files"],
            "optimizar|mejorar": ["search_codebase", "run_command"],
            "probar|test": ["run_command"],
            "documentar": ["write_to_file", "search_codebase"]
        }
        
        for pattern, tools in tool_patterns.items():
            if re.search(pattern, prompt.lower()):
                return tools[:2]  # Máximo 2 herramientas predichas
        
        return ["search_codebase", "view_files"]  # Default
    
    def _check_pattern_cache(self, prompt: str, context: Dict[str, Any]) -> Optional[Tuple[str, Dict[str, Any]]]:
        """Verifica si existe un patrón en caché para este tipo de prompt"""
        prompt_type = self._classify_prompt_type(prompt)
        
        for pattern in self.context_patterns:
            if pattern.context_type == prompt_type and pattern.success_rate > 0.8:
                # Aplicar patrón desde caché
                cached_context = self._apply_pattern_template(context, pattern)
                return prompt, cached_context
        
        return None
    
    def _classify_prompt_type(self, prompt: str) -> str:
        """Clasifica el tipo de prompt"""
        if any(word in prompt.lower() for word in ["crear", "hacer", "generar", "implementar"]):
            return "development"
        elif any(word in prompt.lower() for word in ["error", "problema", "debug", "arreglar"]):
            return "debugging"
        elif any(word in prompt.lower() for word in ["optimizar", "mejorar", "acelerar"]):
            return "optimization"
        elif any(word in prompt.lower() for word in ["probar", "test", "verificar"]):
            return "testing"
        elif any(word in prompt.lower() for word in ["documentar", "explicar"]):
            return "documentation"
        else:
            return "general"
    
    def _apply_pattern_template(self, context: Dict[str, Any], pattern: ContextPattern) -> Dict[str, Any]:
        """Aplica un template de patrón al contexto"""
        try:
            template_dict = json.loads(pattern.template)
            
            # Sustituir variables del template
            for var in pattern.variables:
                if var in context:
                    template_str = json.dumps(template_dict)
                    template_str = template_str.replace(f"{{{var}}}", str(context[var]))
                    template_dict = json.loads(template_str)
            
            return template_dict
        except:
            return context
    
    def _save_successful_pattern(self, original_prompt: str, original_context: Dict[str, Any], 
                               optimized_prompt: str, optimized_context: Dict[str, Any]):
        """Guarda un patrón exitoso para reutilización futura"""
        pattern_id = self._generate_prompt_hash(original_prompt)
        context_type = self._classify_prompt_type(original_prompt)
        
        pattern = ContextPattern(
            pattern_id=pattern_id,
            context_type=context_type,
            template=json.dumps(optimized_context),
            variables=list(optimized_context.keys()),
            usage_count=1,
            success_rate=1.0,
            last_used=datetime.now()
        )
        
        # Agregar a patrones existentes
        existing_pattern = None
        for i, p in enumerate(self.context_patterns):
            if p.pattern_id == pattern_id:
                existing_pattern = i
                break
        
        if existing_pattern is not None:
            # Actualizar patrón existente
            self.context_patterns[existing_pattern].usage_count += 1
            self.context_patterns[existing_pattern].last_used = datetime.now()
        else:
            # Agregar nuevo patrón
            self.context_patterns.append(pattern)
        
        # Guardar patrones
        self._save_patterns()
    
    def _estimate_tokens(self, text: str) -> int:
        """Estima el número de tokens en un texto"""
        # Estimación aproximada: 1 token ≈ 4 caracteres en español
        return len(text) // 4
    
    def _calculate_quality_score(self, original_prompt: str, optimized_prompt: str, 
                               original_context: Dict[str, Any], optimized_context: Dict[str, Any]) -> float:
        """Calcula un score de calidad de la optimización"""
        # Factores de calidad
        prompt_similarity = self._calculate_similarity(original_prompt, optimized_prompt)
        context_completeness = len(optimized_context) / max(len(original_context), 1)
        
        # Score combinado
        quality_score = (prompt_similarity * 0.6) + (context_completeness * 0.4)
        return min(quality_score, 1.0)
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calcula similitud entre dos textos"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 and not words2:
            return 1.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _combine_prompt_context(self, prompt: str, context: Dict[str, Any]) -> str:
        """Combina prompt y contexto en un string optimizado"""
        context_str = json.dumps(context, ensure_ascii=False, separators=(',', ':'))
        return f"{prompt}\n\nContexto: {context_str}"
    
    def _generate_prompt_hash(self, prompt: str) -> str:
        """Genera hash único para un prompt"""
        return hashlib.md5(prompt.encode()).hexdigest()
    
    def _load_patterns(self) -> List[ContextPattern]:
        """Carga patrones desde caché"""
        if self.patterns_cache.exists():
            try:
                with open(self.patterns_cache, 'rb') as f:
                    return pickle.load(f)
            except:
                pass
        return []
    
    def _save_patterns(self):
        """Guarda patrones en caché"""
        try:
            with open(self.patterns_cache, 'wb') as f:
                pickle.dump(self.context_patterns, f)
        except Exception as e:
            self.logger.error(f"Error guardando patrones: {e}")
    
    def _load_optimization_stats(self) -> Dict[str, Any]:
        """Carga estadísticas de optimización"""
        if self.optimization_history.exists():
            try:
                with open(self.optimization_history, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        
        return {
            "total_optimizations": 0,
            "average_reduction": 0.0,
            "average_quality": 0.0,
            "technique_success_rates": {},
            "last_updated": datetime.now().isoformat()
        }
    
    def _update_optimization_stats(self, result: TokenOptimization):
        """Actualiza estadísticas de optimización"""
        stats = self.optimization_stats
        
        stats["total_optimizations"] += 1
        
        # Actualizar promedios
        total = stats["total_optimizations"]
        stats["average_reduction"] = ((stats["average_reduction"] * (total - 1)) + result.reduction_percentage) / total
        stats["average_quality"] = ((stats["average_quality"] * (total - 1)) + result.quality_score) / total
        
        # Actualizar tasas de éxito por técnica
        for technique in result.optimization_techniques:
            if technique not in stats["technique_success_rates"]:
                stats["technique_success_rates"][technique] = {"uses": 0, "success_rate": 0.0}
            
            technique_stats = stats["technique_success_rates"][technique]
            technique_stats["uses"] += 1
            
            # Considerar exitoso si la reducción es > 10% y calidad > 0.7
            success = result.reduction_percentage > 10 and result.quality_score > 0.7
            current_rate = technique_stats["success_rate"]
            uses = technique_stats["uses"]
            technique_stats["success_rate"] = ((current_rate * (uses - 1)) + (1.0 if success else 0.0)) / uses
        
        stats["last_updated"] = datetime.now().isoformat()
        
        # Guardar estadísticas
        try:
            with open(self.optimization_history, 'w', encoding='utf-8') as f:
                json.dump(stats, f, indent=2, ensure_ascii=False)
        except Exception as e:
            self.logger.error(f"Error guardando estadísticas: {e}")
    
    def get_optimization_report(self) -> Dict[str, Any]:
        """Genera reporte de optimización"""
        stats = self.optimization_stats
        
        return {
            "summary": {
                "total_optimizations": stats["total_optimizations"],
                "average_token_reduction": f"{stats['average_reduction']:.1f}%",
                "average_quality_score": f"{stats['average_quality']:.2f}",
                "active_patterns": len(self.context_patterns)
            },
            "technique_performance": stats["technique_success_rates"],
            "top_patterns": [
                {
                    "type": p.context_type,
                    "usage_count": p.usage_count,
                    "success_rate": f"{p.success_rate:.2f}"
                }
                for p in sorted(self.context_patterns, key=lambda x: x.usage_count, reverse=True)[:5]
            ],
            "recommendations": self._generate_recommendations()
        }
    
    def _generate_recommendations(self) -> List[str]:
        """Genera recomendaciones basadas en estadísticas"""
        recommendations = []
        stats = self.optimization_stats
        
        if stats["average_reduction"] < 30:
            recommendations.append("Considerar técnicas de optimización más agresivas")
        
        if stats["average_quality"] < 0.8:
            recommendations.append("Revisar templates de patrones para mejorar calidad")
        
        if len(self.context_patterns) < 5:
            recommendations.append("Generar más patrones de contexto para mejor caché")
        
        # Analizar técnicas menos exitosas
        for technique, data in stats.get("technique_success_rates", {}).items():
            if data["success_rate"] < 0.6:
                recommendations.append(f"Mejorar técnica '{technique}' (éxito: {data['success_rate']:.1%})")
        
        return recommendations

def main():
    """Función principal para testing"""
    optimizer = TokenOptimizer()
    
    # Prompt de prueba
    test_prompt = "crear componente de login con autenticación JWT para el sistema TecnoMundo"
    test_context = {
        "project_info": {
            "name": "TecnoMundo Repair Management",
            "type": "Full Stack Web Application",
            "frontend": "React + Vite + TailwindCSS",
            "backend": "FastAPI + PostgreSQL"
        },
        "focus": "Desarrollo de componentes React con autenticación",
        "tools": ["edit_file_fast_apply", "write_to_file", "search_codebase"],
        "recent_activity": ["login implementation", "jwt setup", "user management"],
        "cached_patterns": ["auth_component", "jwt_integration", "react_forms"]
    }
    
    # Optimizar
    optimized_result, optimization_info = optimizer.optimize_prompt(
        test_prompt, test_context, target_tokens=300, priority="high"
    )
    
    print(f"\n🤖 NEXUS Token Optimizer - Resultado")
    print(f"{'='*50}")
    print(f"Tokens originales: {optimization_info.original_tokens}")
    print(f"Tokens optimizados: {optimization_info.optimized_tokens}")
    print(f"Reducción: {optimization_info.reduction_percentage:.1f}%")
    print(f"Calidad: {optimization_info.quality_score:.2f}")
    print(f"Técnicas aplicadas: {', '.join(optimization_info.optimization_techniques)}")
    print(f"Tiempo de ejecución: {optimization_info.execution_time:.3f}s")
    print(f"Cache hit: {'✅' if optimization_info.cache_hit else '❌'}")
    
    # Mostrar reporte
    report = optimizer.get_optimization_report()
    print(f"\n📊 Reporte de Optimización:")
    print(json.dumps(report, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()