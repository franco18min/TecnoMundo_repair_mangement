# 🏗️ Reglas del Proyecto TecnoMundo Repair Management
# Sistema de contexto inteligente para Trae 2.0

project_info:
  name: "TecnoMundo Repair Management"
  type: "fullstack"
  version: "2.0"
  stack:
    frontend: "React 18 + Vite + TailwindCSS"
    backend: "FastAPI + SQLAlchemy + PostgreSQL"
    auth: "JWT + bcrypt"
    ports:
      frontend: 5173
      backend: 8001
      database: 5432

# 🎯 Configuración de Desarrollo
development:
  auto_reload: true
  hot_reload: true
  debug_mode: true
  cors_enabled: true
  
  paths:
    frontend: "./frontend"
    backend: "./backend"
    database_scripts: "./backend/scripts"
    
  commands:
    start_frontend: "cd frontend && npm run dev"
    start_backend: "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001"
    install_frontend: "cd frontend && npm install"
    install_backend: "cd backend && pip install -r requirements.txt"

# 🧠 Reglas de IA y Contexto
ai_behavior:
  language: "español"
  auto_execution: true
  context_loading: "automatic"
  token_optimization: "aggressive"
  
  natural_commands:
    enabled: true
    patterns:
      - "crear/hacer/generar [componente]"
      - "hay/tengo error en [área]"
      - "necesito/quiero [funcionalidad]"
      - "optimizar/mejorar [sistema]"
      - "probar/testear [funcionalidad]"
      - "documentar [componente]"
  
  context_rules:
    - "SIEMPRE cargar contexto desde .trae/cache/"
    - "NUNCA pedir confirmación para tareas estándar"
    - "MANTENER contexto entre sesiones"
    - "OPTIMIZAR tokens según contexto detectado"
    - "EJECUTAR comandos naturales inmediatamente"

# 📁 Estructura de Archivos
file_structure:
  frontend:
    components: "./frontend/src/components"
    pages: "./frontend/src/pages"
    services: "./frontend/src/services"
    hooks: "./frontend/src/hooks"
    context: "./frontend/src/context"
    utils: "./frontend/src/utils"
    
  backend:
    api: "./backend/app/api"
    models: "./backend/app/models"
    schemas: "./backend/app/schemas"
    crud: "./backend/app/crud"
    services: "./backend/app/services"
    core: "./backend/app/core"
    db: "./backend/app/db"

# 🔧 Patrones de Código
code_patterns:
  frontend:
    component_style: "functional_components"
    state_management: "context_api"
    styling: "tailwindcss"
    routing: "react_router"
    
  backend:
    api_style: "fastapi_router"
    database: "sqlalchemy_orm"
    validation: "pydantic"
    auth: "jwt_bearer"

# 🚨 Reglas de Calidad
quality_rules:
  - "Código consistente con patrones existentes"
  - "Documentación automática y concisa"
  - "Testing automático cuando sea posible"
  - "Manejo de errores robusto"
  - "Seguridad por defecto"
  - "Performance optimizado"

# 🔄 Flujo de Trabajo
workflow:
  task_execution:
    - "Detectar intención automáticamente"
    - "Cargar contexto desde caché"
    - "Ejecutar acción inmediatamente"
    - "Actualizar mapeos automáticamente"
    - "Documentar cambios"
  
  error_handling:
    - "Detección automática de errores"
    - "Resolución con soluciones conocidas"
    - "Documentación de errores nuevos"
    - "Actualización de contexto"

# 📊 Métricas y Optimización
metrics:
  tokens:
    simple_request: "<400 tokens"
    complex_request: "<800 tokens"
    reduction_target: "70-90%"
  
  performance:
    response_time: "<30 segundos"
    cache_hit_rate: ">80%"
    auto_resolved_errors: ">70%"