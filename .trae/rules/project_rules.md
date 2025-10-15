# 📋 Reglas del Proyecto - TecnoMundo Repair Management
# Reglas específicas del proyecto para desarrollo full stack optimizado
# NEXUS v2.0 - Sistema Autónomo Configurado

# CONFIGURACIÓN NEXUS INTEGRADA
nexus_config:
  version: "2.0.0"
  status: "COMPLETAMENTE CONFIGURADO"
  integration: "ACTIVADA"
  natural_commands: "HABILITADO"
  auto_execution: "ACTIVADO"

project_info:
  name: "TecnoMundo Repair Management"
  type: "Sistema de Gestión de Reparaciones"
  architecture: "Full Stack (React + FastAPI)"
  database: "PostgreSQL"
  authentication: "JWT"
  nexus_integration: "COMPLETA"

tech_stack:
  frontend:
    framework: "React 18 + Vite"
    styling: "TailwindCSS"
    state_management: "Context API + useState"
    routing: "React Router v6"
    testing: "Jest + React Testing Library"
    nexus_optimization: "ACTIVADA"
    
  backend:
    framework: "FastAPI"
    orm: "SQLAlchemy"
    database: "PostgreSQL"
    authentication: "JWT + bcrypt"
    testing: "pytest"
    nexus_optimization: "ACTIVADA"
    
  devops:
    containerization: "Docker"
    deployment: "Manual/Local"
    monitoring: "Logs + Performance Metrics + NEXUS Metrics"
    nexus_integration: "COMPLETA"

architecture:
  directory_structure:
    frontend:
      components: "src/components/ - Componentes reutilizables por feature"
      pages: "src/pages/ - Páginas principales de la aplicación"
      context: "src/context/ - Contextos de React para estado global"
      hooks: "src/hooks/ - Custom hooks reutilizables"
      api: "src/api/ - Servicios de API y configuración"
      assets: "src/assets/ - Recursos estáticos"
      
    backend:
      api: "app/api/ - Endpoints de la API REST"
      models: "app/models/ - Modelos de base de datos"
      schemas: "app/schemas/ - Esquemas Pydantic para validación"
      crud: "app/crud/ - Operaciones CRUD"
      services: "app/services/ - Lógica de negocio"
      core: "app/core/ - Configuración y utilidades"
      db: "app/db/ - Configuración de base de datos"

  design_patterns:
    frontend:
      - "Component Composition Pattern"
      - "Custom Hooks Pattern"
      - "Context Provider Pattern"
      - "Compound Components Pattern"
      
    backend:
      - "Repository Pattern (CRUD)"
      - "Service Layer Pattern"
      - "Dependency Injection"
      - "Factory Pattern para modelos"

development_standards:
  naming_conventions:
    files:
      components: "PascalCase.jsx (ej: LoginForm.jsx)"
      pages: "PascalCase.jsx (ej: Dashboard.jsx)"
      hooks: "camelCase.js (ej: useAuth.js)"
      utils: "camelCase.js (ej: formatDate.js)"
      constants: "UPPER_SNAKE_CASE.js (ej: API_ENDPOINTS.js)"
      
    functions:
      react: "camelCase (ej: handleSubmit, fetchData)"
      python: "snake_case (ej: create_user, get_tickets)"
      
    variables:
      javascript: "camelCase (ej: userData, isLoading)"
      python: "snake_case (ej: user_data, is_active)"
      css_classes: "kebab-case (ej: btn-primary, form-input)"

  component_structure:
    react_component:
      imports: "React, hooks, external libs, internal components, styles"
      interfaces: "TypeScript interfaces (si aplica)"
      component: "Función principal del componente"
      styles: "Clases de TailwindCSS inline"
      export: "Export default al final"
      
    fastapi_endpoint:
      imports: "FastAPI, dependencies, models, schemas, services"
      router: "APIRouter instance"
      endpoints: "Funciones de endpoint con decoradores"
      error_handling: "Try-catch con HTTPException"

ui_ux_standards:
  color_system:
    primary: "blue-600"      # Acciones principales
    secondary: "gray-600"    # Acciones secundarias
    success: "green-600"     # Estados de éxito
    warning: "yellow-600"    # Advertencias
    error: "red-600"         # Errores
    info: "blue-500"         # Información
    
  neutral_colors:
    background: "gray-50"    # Fondo principal
    surface: "white"         # Superficies de componentes
    border: "gray-300"       # Bordes
    text_primary: "gray-900" # Texto principal
    text_secondary: "gray-600" # Texto secundario

  base_components:
    buttons:
      primary: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
      danger: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
      
    inputs:
      base: "border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
      error: "border-red-500 focus:ring-red-500"
      
    cards:
      base: "bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      hover: "hover:shadow-md transition-shadow"

  responsiveness:
    breakpoints:
      mobile: "sm: (640px+)"
      tablet: "md: (768px+)"
      desktop: "lg: (1024px+)"
      wide: "xl: (1280px+)"
    strategy: "Mobile-first design"
    grid_system: "CSS Grid + Flexbox"

security_rules:
  authentication:
    jwt_config:
      algorithm: "HS256"
      access_token_expire: "24 horas"
      refresh_token_expire: "7 días"
      secret_key: "Variable de entorno"
      
    roles:
      administrator:
        permissions: "Acceso completo al sistema"
        routes: "Todas las rutas disponibles"
      technician:
        permissions: "Solo órdenes asignadas"
        routes: "Dashboard, órdenes propias, perfil"

  data_handling:
    prohibited_in_logs:
      - "Passwords en texto plano"
      - "Tokens JWT completos"
      - "Información personal de clientes"
      - "Credenciales de base de datos"
      
    required_encrypted:
      - "Passwords de usuarios"
      - "Información sensible de clientes"
      - "Tokens de sesión"
      
    environment_variables:
      - "DATABASE_URL"
      - "JWT_SECRET_KEY"
      - "CORS_ORIGINS"
      - "DEBUG_MODE"

workflows:
  feature_development:
    steps:
      1: "Verificar contexto en caché"
      2: "Buscar patrones similares existentes"
      3: "Implementar usando componentes reutilizables"
      4: "Escribir tests unitarios"
      5: "Probar en desarrollo"
      6: "Documentar cambios en caché"
      7: "Commit con mensaje descriptivo"
      
  error_debugging:
    steps:
      1: "Documentar error con error_handler.ps1"
      2: "Buscar errores similares en caché"
      3: "Aplicar comandos de diagnóstico automáticos"
      4: "Implementar fix mínimo necesario"
      5: "Verificar solución"
      6: "Marcar error como resuelto"
      7: "Actualizar base de conocimiento"

ports_configuration:
  development:
    frontend: 5173
    backend: 8001
    database: 5432
    websocket: 8001
    
  production:
    frontend: 80
    backend: 8000
    database: 5432

testing_standards:
  frontend:
    framework: "Jest + React Testing Library"
    coverage_target: ">80%"
    test_types:
      - "Unit tests para componentes"
      - "Integration tests para hooks"
      - "E2E tests para flujos críticos"
      
  backend:
    framework: "pytest"
    coverage_target: ">80%"
    test_types:
      - "Unit tests para servicios"
      - "Integration tests para APIs"
      - "Database tests para modelos"

performance_standards:
  frontend:
    bundle_size: "<500KB gzipped"
    first_paint: "<2s"
    interactive: "<3s"
    
  backend:
    response_time: "<200ms promedio"
    throughput: ">1000 req/s"
    error_rate: "<1%"

deployment_rules:
  environment_setup:
    - "Usar variables de entorno para configuración"
    - "Separar configuración por ambiente"
    - "Validar configuración al inicio"
    
  database_migrations:
    - "Usar Alembic para migraciones"
    - "Backup antes de migraciones en producción"
    - "Rollback plan para cada migración"
    
  monitoring:
    - "Logs estructurados con niveles apropiados"
    - "Métricas de rendimiento en tiempo real"
    - "Alertas para errores críticos"