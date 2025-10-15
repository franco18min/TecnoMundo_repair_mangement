#!/usr/bin/env python3
"""
🤖 NEXUS - Adaptive Learning System (ML Integration)
Sistema de aprendizaje automático para adaptación dinámica y mejora continua
TecnoMundo Repair Management - Trae 2.0
"""

import json
import numpy as np
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict, deque
import pickle
import hashlib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

@dataclass
class LearningPattern:
    """Patrón de aprendizaje identificado"""
    pattern_id: str
    pattern_type: str
    features: Dict[str, float]
    success_rate: float
    confidence: float
    usage_count: int
    last_updated: datetime
    improvement_trend: float

@dataclass
class UserBehaviorProfile:
    """Perfil de comportamiento del usuario"""
    user_id: str
    command_preferences: Dict[str, float]
    context_preferences: Dict[str, float]
    time_patterns: Dict[str, List[int]]  # hora -> frecuencia
    success_patterns: Dict[str, float]
    learning_velocity: float
    adaptation_score: float

@dataclass
class PredictionModel:
    """Modelo de predicción entrenado"""
    model_id: str
    model_type: str
    model_object: Any
    features_used: List[str]
    accuracy: float
    last_trained: datetime
    training_samples: int

class AdaptiveLearningSystem:
    """Sistema de aprendizaje adaptativo con ML"""
    
    def __init__(self, data_dir: str = ".trae/optimization/ml"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Archivos de datos
        self.patterns_file = self.data_dir / "learning_patterns.json"
        self.profiles_file = self.data_dir / "user_profiles.json"
        self.models_dir = self.data_dir / "models"
        self.models_dir.mkdir(exist_ok=True)
        
        # Estado del sistema
        self.learning_patterns: Dict[str, LearningPattern] = {}
        self.user_profiles: Dict[str, UserBehaviorProfile] = {}
        self.prediction_models: Dict[str, PredictionModel] = {}
        
        # Datos de entrenamiento
        self.interaction_history: deque = deque(maxlen=10000)
        self.feature_vectors: List[np.ndarray] = []
        self.target_values: List[float] = []
        
        # Vectorizadores y transformadores
        self.text_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.command_clusterer = KMeans(n_clusters=10, random_state=42)
        
        # Métricas de aprendizaje
        self.learning_metrics = {
            "patterns_discovered": 0,
            "models_trained": 0,
            "prediction_accuracy": 0.0,
            "adaptation_improvements": 0,
            "user_satisfaction_trend": 0.0
        }
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Cargar estado existente
        self._load_learning_data()
        self._initialize_base_models()
    
    def learn_from_interaction(self, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Aprende de una interacción del usuario"""
        
        try:
            # Extraer características de la interacción
            features = self._extract_interaction_features(interaction_data)
            
            # Actualizar historial
            self.interaction_history.append({
                **interaction_data,
                "features": features,
                "timestamp": datetime.now(),
                "processed": False
            })
            
            # Identificar patrones emergentes
            new_patterns = self._identify_emerging_patterns(interaction_data, features)
            
            # Actualizar perfil de usuario
            user_id = interaction_data.get("user_id", "default")
            self._update_user_profile(user_id, interaction_data, features)
            
            # Evaluar necesidad de reentrenamiento
            retrain_needed = self._evaluate_retrain_necessity()
            
            # Generar recomendaciones adaptativas
            adaptive_recommendations = self._generate_adaptive_recommendations(user_id, features)
            
            learning_result = {
                "patterns_identified": len(new_patterns),
                "profile_updated": True,
                "retrain_recommended": retrain_needed,
                "adaptive_recommendations": adaptive_recommendations,
                "learning_confidence": self._calculate_learning_confidence(features),
                "improvement_suggestions": self._generate_improvement_suggestions(interaction_data)
            }
            
            # Actualizar métricas
            self._update_learning_metrics(learning_result)
            
            self.logger.info(f"🧠 Aprendizaje completado - Patrones: {len(new_patterns)}, Confianza: {learning_result['learning_confidence']:.2f}")
            return learning_result
            
        except Exception as e:
            self.logger.error(f"Error en aprendizaje: {e}")
            return {"success": False, "error": str(e)}
    
    def predict_user_needs(self, user_id: str, current_context: Dict[str, Any]) -> Dict[str, Any]:
        """Predice las necesidades del usuario basado en patrones aprendidos"""
        
        try:
            # Obtener perfil del usuario
            user_profile = self.user_profiles.get(user_id)
            if not user_profile:
                return self._generate_default_predictions(current_context)
            
            # Extraer características del contexto actual
            context_features = self._extract_context_features(current_context)
            
            # Usar modelos de predicción
            predictions = {}
            
            # Predicción de comando probable
            if "command_predictor" in self.prediction_models:
                command_prediction = self._predict_next_command(user_profile, context_features)
                predictions["next_command"] = command_prediction
            
            # Predicción de contexto necesario
            if "context_predictor" in self.prediction_models:
                context_prediction = self._predict_required_context(user_profile, context_features)
                predictions["required_context"] = context_prediction
            
            # Predicción de tiempo de sesión
            if "time_predictor" in self.prediction_models:
                time_prediction = self._predict_session_duration(user_profile, context_features)
                predictions["estimated_session_time"] = time_prediction
            
            # Predicción de éxito
            success_probability = self._predict_success_probability(user_profile, context_features)
            predictions["success_probability"] = success_probability
            
            # Generar recomendaciones proactivas
            proactive_recommendations = self._generate_proactive_recommendations(
                user_profile, predictions, context_features
            )
            
            result = {
                "user_id": user_id,
                "predictions": predictions,
                "proactive_recommendations": proactive_recommendations,
                "confidence_scores": self._calculate_prediction_confidence(predictions),
                "adaptation_level": user_profile.adaptation_score,
                "personalization_strength": self._calculate_personalization_strength(user_profile)
            }
            
            self.logger.info(f"🔮 Predicciones generadas para {user_id} - Confianza promedio: {np.mean(list(result['confidence_scores'].values())):.2f}")
            return result
            
        except Exception as e:
            self.logger.error(f"Error prediciendo necesidades para {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    def adapt_system_behavior(self, performance_metrics: Dict[str, float], 
                            user_feedback: Dict[str, Any] = None) -> Dict[str, Any]:
        """Adapta el comportamiento del sistema basado en métricas y feedback"""
        
        try:
            # Analizar métricas de rendimiento
            performance_analysis = self._analyze_performance_metrics(performance_metrics)
            
            # Procesar feedback del usuario si está disponible
            feedback_analysis = {}
            if user_feedback:
                feedback_analysis = self._analyze_user_feedback(user_feedback)
            
            # Identificar áreas de mejora
            improvement_areas = self._identify_improvement_areas(performance_analysis, feedback_analysis)
            
            # Generar adaptaciones específicas
            adaptations = {}
            
            # Adaptación de tokens
            if "token_usage" in improvement_areas:
                token_adaptation = self._adapt_token_strategy(performance_metrics)
                adaptations["token_optimization"] = token_adaptation
            
            # Adaptación de contexto
            if "context_relevance" in improvement_areas:
                context_adaptation = self._adapt_context_strategy(performance_metrics)
                adaptations["context_optimization"] = context_adaptation
            
            # Adaptación de patrones
            if "pattern_effectiveness" in improvement_areas:
                pattern_adaptation = self._adapt_pattern_strategy(performance_metrics)
                adaptations["pattern_optimization"] = pattern_adaptation
            
            # Aplicar adaptaciones
            application_results = self._apply_adaptations(adaptations)
            
            # Calcular impacto esperado
            expected_impact = self._calculate_expected_impact(adaptations, performance_metrics)
            
            adaptation_result = {
                "adaptations_applied": len(adaptations),
                "improvement_areas": improvement_areas,
                "adaptations": adaptations,
                "application_results": application_results,
                "expected_impact": expected_impact,
                "confidence_level": self._calculate_adaptation_confidence(adaptations),
                "monitoring_recommendations": self._generate_monitoring_recommendations(adaptations)
            }
            
            # Actualizar métricas de adaptación
            self.learning_metrics["adaptation_improvements"] += len(adaptations)
            
            self.logger.info(f"🔄 Sistema adaptado - {len(adaptations)} adaptaciones aplicadas")
            return adaptation_result
            
        except Exception as e:
            self.logger.error(f"Error adaptando sistema: {e}")
            return {"success": False, "error": str(e)}
    
    def train_prediction_models(self, force_retrain: bool = False) -> Dict[str, Any]:
        """Entrena o reentrena los modelos de predicción"""
        
        try:
            if len(self.interaction_history) < 50 and not force_retrain:
                return {
                    "success": False,
                    "reason": "Datos insuficientes para entrenamiento",
                    "required_samples": 50,
                    "current_samples": len(self.interaction_history)
                }
            
            training_results = {}
            
            # Preparar datos de entrenamiento
            training_data = self._prepare_training_data()
            
            # Entrenar modelo de predicción de comandos
            command_model_result = self._train_command_predictor(training_data)
            training_results["command_predictor"] = command_model_result
            
            # Entrenar modelo de predicción de contexto
            context_model_result = self._train_context_predictor(training_data)
            training_results["context_predictor"] = context_model_result
            
            # Entrenar modelo de predicción de tiempo
            time_model_result = self._train_time_predictor(training_data)
            training_results["time_predictor"] = time_model_result
            
            # Entrenar modelo de predicción de éxito
            success_model_result = self._train_success_predictor(training_data)
            training_results["success_predictor"] = success_model_result
            
            # Evaluar modelos entrenados
            evaluation_results = self._evaluate_trained_models(training_data)
            
            # Guardar modelos
            self._save_trained_models()
            
            # Actualizar métricas
            self.learning_metrics["models_trained"] += len(training_results)
            self.learning_metrics["prediction_accuracy"] = np.mean([
                result.get("accuracy", 0) for result in training_results.values()
            ])
            
            result = {
                "success": True,
                "models_trained": len(training_results),
                "training_results": training_results,
                "evaluation_results": evaluation_results,
                "training_samples": len(training_data["features"]),
                "overall_accuracy": self.learning_metrics["prediction_accuracy"],
                "improvement_over_previous": self._calculate_improvement_over_previous()
            }
            
            self.logger.info(f"🎯 Modelos entrenados - Precisión promedio: {result['overall_accuracy']:.2f}")
            return result
            
        except Exception as e:
            self.logger.error(f"Error entrenando modelos: {e}")
            return {"success": False, "error": str(e)}
    
    def discover_usage_patterns(self, time_window_days: int = 30) -> Dict[str, Any]:
        """Descubre patrones de uso en una ventana de tiempo"""
        
        try:
            # Filtrar interacciones por ventana de tiempo
            cutoff_date = datetime.now() - timedelta(days=time_window_days)
            recent_interactions = [
                interaction for interaction in self.interaction_history
                if interaction.get("timestamp", datetime.now()) > cutoff_date
            ]
            
            if len(recent_interactions) < 10:
                return {
                    "success": False,
                    "reason": "Datos insuficientes en ventana de tiempo",
                    "interactions_found": len(recent_interactions)
                }
            
            # Análisis temporal
            temporal_patterns = self._analyze_temporal_patterns(recent_interactions)
            
            # Análisis de comandos
            command_patterns = self._analyze_command_patterns(recent_interactions)
            
            # Análisis de contexto
            context_patterns = self._analyze_context_patterns(recent_interactions)
            
            # Análisis de éxito/fallo
            success_patterns = self._analyze_success_patterns(recent_interactions)
            
            # Clustering de comportamientos
            behavior_clusters = self._cluster_user_behaviors(recent_interactions)
            
            # Identificar tendencias emergentes
            emerging_trends = self._identify_emerging_trends(recent_interactions)
            
            # Calcular métricas de descubrimiento
            discovery_metrics = self._calculate_discovery_metrics(
                temporal_patterns, command_patterns, context_patterns, success_patterns
            )
            
            patterns_discovered = {
                "analysis_period": f"{time_window_days} días",
                "interactions_analyzed": len(recent_interactions),
                "temporal_patterns": temporal_patterns,
                "command_patterns": command_patterns,
                "context_patterns": context_patterns,
                "success_patterns": success_patterns,
                "behavior_clusters": behavior_clusters,
                "emerging_trends": emerging_trends,
                "discovery_metrics": discovery_metrics,
                "actionable_insights": self._generate_actionable_insights(
                    temporal_patterns, command_patterns, context_patterns
                )
            }
            
            # Actualizar patrones de aprendizaje
            self._update_learning_patterns_from_discovery(patterns_discovered)
            
            self.logger.info(f"🔍 Patrones descubiertos - {len(behavior_clusters)} clusters, {len(emerging_trends)} tendencias")
            return patterns_discovered
            
        except Exception as e:
            self.logger.error(f"Error descubriendo patrones: {e}")
            return {"success": False, "error": str(e)}
    
    def get_learning_insights(self) -> Dict[str, Any]:
        """Obtiene insights del sistema de aprendizaje"""
        
        # Calcular estadísticas generales
        total_interactions = len(self.interaction_history)
        total_patterns = len(self.learning_patterns)
        total_users = len(self.user_profiles)
        
        # Análisis de tendencias
        recent_performance = self._analyze_recent_performance()
        learning_velocity = self._calculate_learning_velocity()
        adaptation_effectiveness = self._calculate_adaptation_effectiveness()
        
        # Top patrones y usuarios
        top_patterns = self._get_top_learning_patterns(5)
        most_active_users = self._get_most_active_users(5)
        
        # Predicciones del sistema
        system_predictions = self._generate_system_predictions()
        
        return {
            "system_overview": {
                "total_interactions": total_interactions,
                "learning_patterns": total_patterns,
                "user_profiles": total_users,
                "models_active": len(self.prediction_models)
            },
            "performance_metrics": self.learning_metrics,
            "learning_velocity": learning_velocity,
            "adaptation_effectiveness": adaptation_effectiveness,
            "recent_performance": recent_performance,
            "top_patterns": top_patterns,
            "most_active_users": most_active_users,
            "system_predictions": system_predictions,
            "improvement_recommendations": self._generate_system_improvement_recommendations(),
            "health_score": self._calculate_system_health_score()
        }
    
    # Métodos auxiliares para procesamiento de datos
    
    def _extract_interaction_features(self, interaction_data: Dict[str, Any]) -> Dict[str, float]:
        """Extrae características numéricas de una interacción"""
        features = {}
        
        # Características temporales
        now = datetime.now()
        features["hour_of_day"] = now.hour
        features["day_of_week"] = now.weekday()
        features["is_weekend"] = 1.0 if now.weekday() >= 5 else 0.0
        
        # Características del comando
        command = interaction_data.get("command", "")
        features["command_length"] = len(command)
        features["command_complexity"] = len(command.split())
        
        # Características de contexto
        context_type = interaction_data.get("context_type", "")
        context_mapping = {
            "development": 1.0, "debugging": 2.0, "optimization": 3.0,
            "testing": 4.0, "documentation": 5.0
        }
        features["context_type_numeric"] = context_mapping.get(context_type, 0.0)
        
        # Características de rendimiento
        features["processing_time"] = interaction_data.get("processing_time", 0.0)
        features["tokens_used"] = interaction_data.get("tokens_used", 0.0)
        features["success_score"] = interaction_data.get("success_score", 0.5)
        
        return features
    
    def _identify_emerging_patterns(self, interaction_data: Dict[str, Any], 
                                  features: Dict[str, float]) -> List[LearningPattern]:
        """Identifica patrones emergentes en los datos"""
        new_patterns = []
        
        # Crear hash único para el patrón
        pattern_signature = hashlib.md5(
            json.dumps(features, sort_keys=True).encode()
        ).hexdigest()[:8]
        
        pattern_id = f"pattern_{pattern_signature}"
        
        if pattern_id not in self.learning_patterns:
            # Crear nuevo patrón
            new_pattern = LearningPattern(
                pattern_id=pattern_id,
                pattern_type=interaction_data.get("context_type", "general"),
                features=features,
                success_rate=features.get("success_score", 0.5),
                confidence=0.5,  # Inicial
                usage_count=1,
                last_updated=datetime.now(),
                improvement_trend=0.0
            )
            
            self.learning_patterns[pattern_id] = new_pattern
            new_patterns.append(new_pattern)
            self.learning_metrics["patterns_discovered"] += 1
        else:
            # Actualizar patrón existente
            existing_pattern = self.learning_patterns[pattern_id]
            existing_pattern.usage_count += 1
            existing_pattern.last_updated = datetime.now()
            
            # Actualizar tasa de éxito con promedio móvil
            alpha = 0.1  # Factor de aprendizaje
            existing_pattern.success_rate = (
                (1 - alpha) * existing_pattern.success_rate + 
                alpha * features.get("success_score", 0.5)
            )
        
        return new_patterns
    
    def _update_user_profile(self, user_id: str, interaction_data: Dict[str, Any], 
                           features: Dict[str, float]):
        """Actualiza el perfil de comportamiento del usuario"""
        
        if user_id not in self.user_profiles:
            # Crear nuevo perfil
            self.user_profiles[user_id] = UserBehaviorProfile(
                user_id=user_id,
                command_preferences={},
                context_preferences={},
                time_patterns=defaultdict(list),
                success_patterns={},
                learning_velocity=0.5,
                adaptation_score=0.5
            )
        
        profile = self.user_profiles[user_id]
        
        # Actualizar preferencias de comando
        command_type = interaction_data.get("context_type", "general")
        if command_type not in profile.command_preferences:
            profile.command_preferences[command_type] = 0.0
        profile.command_preferences[command_type] += 1.0
        
        # Actualizar patrones temporales
        hour = features.get("hour_of_day", 12)
        profile.time_patterns[str(int(hour))].append(datetime.now().timestamp())
        
        # Actualizar patrones de éxito
        success_score = features.get("success_score", 0.5)
        if command_type not in profile.success_patterns:
            profile.success_patterns[command_type] = []
        profile.success_patterns[command_type].append(success_score)
        
        # Mantener solo los últimos 50 scores por tipo
        if len(profile.success_patterns[command_type]) > 50:
            profile.success_patterns[command_type] = profile.success_patterns[command_type][-50:]
    
    def _prepare_training_data(self) -> Dict[str, Any]:
        """Prepara datos para entrenamiento de modelos"""
        
        features = []
        command_targets = []
        context_targets = []
        time_targets = []
        success_targets = []
        
        for interaction in self.interaction_history:
            if "features" in interaction:
                feature_vector = list(interaction["features"].values())
                features.append(feature_vector)
                
                # Targets para diferentes modelos
                command_targets.append(interaction.get("context_type", "general"))
                context_targets.append(interaction.get("required_context", []))
                time_targets.append(interaction.get("processing_time", 0.0))
                success_targets.append(interaction.get("success_score", 0.5))
        
        return {
            "features": np.array(features),
            "command_targets": command_targets,
            "context_targets": context_targets,
            "time_targets": np.array(time_targets),
            "success_targets": np.array(success_targets)
        }
    
    def _train_command_predictor(self, training_data: Dict[str, Any]) -> Dict[str, Any]:
        """Entrena modelo predictor de comandos"""
        
        try:
            # Usar Random Forest para clasificación
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            
            X = training_data["features"]
            y = training_data["command_targets"]
            
            # Dividir datos (80% entrenamiento, 20% validación)
            split_idx = int(0.8 * len(X))
            X_train, X_val = X[:split_idx], X[split_idx:]
            y_train, y_val = y[:split_idx], y[split_idx:]
            
            # Entrenar modelo
            model.fit(X_train, y_train)
            
            # Evaluar
            y_pred = model.predict(X_val)
            accuracy = accuracy_score(y_val, y_pred)
            
            # Guardar modelo
            model_obj = PredictionModel(
                model_id="command_predictor",
                model_type="RandomForestClassifier",
                model_object=model,
                features_used=list(range(X.shape[1])),
                accuracy=accuracy,
                last_trained=datetime.now(),
                training_samples=len(X_train)
            )
            
            self.prediction_models["command_predictor"] = model_obj
            
            return {
                "success": True,
                "accuracy": accuracy,
                "training_samples": len(X_train),
                "validation_samples": len(X_val)
            }
            
        except Exception as e:
            self.logger.error(f"Error entrenando predictor de comandos: {e}")
            return {"success": False, "error": str(e)}
    
    def _train_time_predictor(self, training_data: Dict[str, Any]) -> Dict[str, Any]:
        """Entrena modelo predictor de tiempo"""
        
        try:
            # Usar regresión lineal para predicción de tiempo
            model = LinearRegression()
            
            X = training_data["features"]
            y = training_data["time_targets"]
            
            # Dividir datos
            split_idx = int(0.8 * len(X))
            X_train, X_val = X[:split_idx], X[split_idx:]
            y_train, y_val = y[:split_idx], y[split_idx:]
            
            # Entrenar modelo
            model.fit(X_train, y_train)
            
            # Evaluar
            y_pred = model.predict(X_val)
            mse = mean_squared_error(y_val, y_pred)
            
            # Guardar modelo
            model_obj = PredictionModel(
                model_id="time_predictor",
                model_type="LinearRegression",
                model_object=model,
                features_used=list(range(X.shape[1])),
                accuracy=1.0 / (1.0 + mse),  # Convertir MSE a score de precisión
                last_trained=datetime.now(),
                training_samples=len(X_train)
            )
            
            self.prediction_models["time_predictor"] = model_obj
            
            return {
                "success": True,
                "mse": mse,
                "accuracy": model_obj.accuracy,
                "training_samples": len(X_train)
            }
            
        except Exception as e:
            self.logger.error(f"Error entrenando predictor de tiempo: {e}")
            return {"success": False, "error": str(e)}
    
    def _save_trained_models(self):
        """Guarda modelos entrenados en disco"""
        
        for model_id, model_obj in self.prediction_models.items():
            model_file = self.models_dir / f"{model_id}.pkl"
            
            try:
                with open(model_file, 'wb') as f:
                    pickle.dump(model_obj, f)
                
                self.logger.debug(f"💾 Modelo guardado: {model_id}")
                
            except Exception as e:
                self.logger.error(f"Error guardando modelo {model_id}: {e}")
    
    def _load_learning_data(self):
        """Carga datos de aprendizaje desde archivos"""
        
        # Cargar patrones de aprendizaje
        if self.patterns_file.exists():
            try:
                with open(self.patterns_file, 'r', encoding='utf-8') as f:
                    patterns_data = json.load(f)
                
                for pattern_id, pattern_data in patterns_data.items():
                    pattern = LearningPattern(
                        pattern_id=pattern_data["pattern_id"],
                        pattern_type=pattern_data["pattern_type"],
                        features=pattern_data["features"],
                        success_rate=pattern_data["success_rate"],
                        confidence=pattern_data["confidence"],
                        usage_count=pattern_data["usage_count"],
                        last_updated=datetime.fromisoformat(pattern_data["last_updated"]),
                        improvement_trend=pattern_data["improvement_trend"]
                    )
                    self.learning_patterns[pattern_id] = pattern
                
                self.logger.info(f"📚 Cargados {len(self.learning_patterns)} patrones de aprendizaje")
                
            except Exception as e:
                self.logger.error(f"Error cargando patrones: {e}")
        
        # Cargar modelos entrenados
        for model_file in self.models_dir.glob("*.pkl"):
            try:
                with open(model_file, 'rb') as f:
                    model_obj = pickle.load(f)
                
                self.prediction_models[model_obj.model_id] = model_obj
                self.logger.debug(f"🤖 Modelo cargado: {model_obj.model_id}")
                
            except Exception as e:
                self.logger.error(f"Error cargando modelo {model_file}: {e}")
    
    def _initialize_base_models(self):
        """Inicializa modelos base si no existen"""
        
        if not self.prediction_models:
            self.logger.info("🚀 Inicializando modelos base...")
            
            # Crear datos sintéticos mínimos para inicialización
            synthetic_data = self._generate_synthetic_training_data()
            
            if len(synthetic_data["features"]) > 0:
                self._train_command_predictor(synthetic_data)
                self._train_time_predictor(synthetic_data)
    
    def _generate_synthetic_training_data(self) -> Dict[str, Any]:
        """Genera datos sintéticos para inicialización de modelos"""
        
        # Generar 100 muestras sintéticas
        n_samples = 100
        n_features = 8
        
        features = np.random.rand(n_samples, n_features)
        command_targets = np.random.choice(
            ["development", "debugging", "optimization", "testing"], 
            n_samples
        )
        time_targets = np.random.exponential(5.0, n_samples)  # Tiempos exponenciales
        success_targets = np.random.beta(2, 1, n_samples)  # Sesgado hacia éxito
        
        return {
            "features": features,
            "command_targets": command_targets,
            "context_targets": [[] for _ in range(n_samples)],
            "time_targets": time_targets,
            "success_targets": success_targets
        }
    
    def get_system_status(self) -> Dict[str, Any]:
        """Obtiene el estado actual del sistema de aprendizaje"""
        
        return {
            "learning_patterns": len(self.learning_patterns),
            "user_profiles": len(self.user_profiles),
            "prediction_models": len(self.prediction_models),
            "interaction_history": len(self.interaction_history),
            "learning_metrics": self.learning_metrics,
            "system_health": self._calculate_system_health_score(),
            "last_training": max([
                model.last_trained for model in self.prediction_models.values()
            ], default=datetime.min).isoformat() if self.prediction_models else None
        }

def main():
    """Función principal para testing"""
    learning_system = AdaptiveLearningSystem()
    
    # Simular algunas interacciones
    test_interactions = [
        {
            "user_id": "test_user",
            "command": "crear componente login",
            "context_type": "development",
            "processing_time": 2.5,
            "tokens_used": 350,
            "success_score": 0.9
        },
        {
            "user_id": "test_user",
            "command": "hay error en autenticación",
            "context_type": "debugging",
            "processing_time": 1.8,
            "tokens_used": 280,
            "success_score": 0.8
        }
    ]
    
    # Procesar interacciones
    for interaction in test_interactions:
        result = learning_system.learn_from_interaction(interaction)
        print(f"✅ Interacción procesada: {result.get('patterns_identified', 0)} patrones")
    
    # Entrenar modelos
    training_result = learning_system.train_prediction_models(force_retrain=True)
    print(f"🎯 Entrenamiento: {training_result.get('success', False)}")
    
    # Obtener insights
    insights = learning_system.get_learning_insights()
    print(f"\n📊 Sistema de Aprendizaje:")
    print(json.dumps(insights, indent=2, ensure_ascii=False, default=str))

if __name__ == "__main__":
    main()