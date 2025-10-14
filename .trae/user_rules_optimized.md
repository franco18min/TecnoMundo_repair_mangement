# 📋 User Rules - Optimizado para Sistema de Caché

> **Propósito**: Reglas específicas del usuario optimizadas para máxima eficiencia de tokens

## 🌍 Configuración de Idioma
```yaml
idioma_principal: "español"
regla_obligatoria: "Todas las tareas y órdenes deben ser escritas en español"
excepciones: 
  - "Código fuente puede estar en inglés"
  - "Comentarios técnicos pueden estar en inglés"
  - "Variables y funciones pueden estar en inglés"
```

## 🚀 Reglas de Optimización de Tokens

### Prioridad 1: Uso de Caché
```yaml
cache_obligatorio:
  - "SIEMPRE leer .trae/session_tracker.md antes de cualquier acción"
  - "NUNCA cargar archivos completos si hay contexto en caché"
  - "SIEMPRE usar comandos específicos de .trae/quick_commands.md"
  - "SIEMPRE documentar cambios con .\update_cache.ps1"

tokens_objetivo:
  peticion_simple: "200-400 tokens"
  peticion_media: "400-800 tokens"
  peticion_compleja: "800-1200 tokens"
  limite_maximo: "1500 tokens (solo emergencias)"
```

### Prioridad 2: Flujo de Trabajo Inteligente
```yaml
protocolo_inicio:
  1: "Verificar contexto existente"
  2: "Auto-inicializar si necesario"
  3: "Usar comandos específicos"
  4: "Documentar automáticamente"

manejo_errores:
  - "Auto-documentar con .\error_handler.ps1"
  - "Buscar soluciones en base de conocimiento"
  - "Aplicar comandos de diagnóstico específicos"
  - "Marcar como resuelto automáticamente"
```

## 🎯 Preferencias de Desarrollo

### Estilo de Código
```yaml
frontend:
  framework: "React + Vite"
  styling: "TailwindCSS"
  state_management: "Context API + useState"
  routing: "React Router"
  
backend:
  framework: "FastAPI"
  database: "PostgreSQL + SQLAlchemy"
  authentication: "JWT"
  api_style: "RESTful"

testing:
  frontend: "Jest + React Testing Library"
  backend: "pytest"
  e2e: "Playwright (opcional)"
```

### Convenciones de Naming
```yaml
archivos:
  componentes: "PascalCase.jsx"
  hooks: "use[Name].js"
  utils: "camelCase.js"
  constants: "UPPER_SNAKE_CASE.js"

funciones:
  react: "camelCase"
  python: "snake_case"
  constants: "UPPER_SNAKE_CASE"

variables:
  javascript: "camelCase"
  python: "snake_case"
  css_classes: "kebab-case"
```

## 🔧 Configuración del Proyecto

### Estructura de Directorios
```yaml
frontend:
  components: "src/components/[feature]/[Component].jsx"
  pages: "src/pages/[Page].jsx"
  hooks: "src/hooks/use[Name].js"
  context: "src/context/[Name]Context.jsx"
  api: "src/api/[service].js"

backend:
  models: "app/models/[model].py"
  api: "app/api/[endpoint].py"
  crud: "app/crud/[entity].py"
  schemas: "app/schemas/[schema].py"
  services: "app/services/[service].py"
```

### Configuración de Puertos
```yaml
desarrollo:
  frontend: 5173
  backend: 8001
  database: 5432
  websocket: 8001

produccion:
  frontend: 80
  backend: 8000
  database: 5432
```

## 🎨 Preferencias de UI/UX

### Diseño Visual
```yaml
colores:
  primario: "blue-600"
  secundario: "gray-600"
  exito: "green-600"
  advertencia: "yellow-600"
  error: "red-600"

componentes:
  botones: "rounded-lg shadow-sm hover:shadow-md transition-all"
  inputs: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  cards: "bg-white rounded-lg shadow-sm border border-gray-200"
  modals: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
```

### Responsividad
```yaml
breakpoints:
  mobile: "sm (640px)"
  tablet: "md (768px)"
  desktop: "lg (1024px)"
  wide: "xl (1280px)"

prioridad: "mobile-first design"
```

## 🚨 Reglas de Seguridad

### Autenticación y Autorización
```yaml
jwt_config:
  expiration: "24 horas"
  refresh: "7 días"
  algorithm: "HS256"

roles:
  administrator: "Acceso completo"
  technician: "Solo órdenes asignadas"
  
validacion:
  - "Validar tokens en cada request"
  - "Verificar roles antes de acciones"
  - "Sanitizar inputs del usuario"
  - "Usar HTTPS en producción"
```

### Manejo de Datos Sensibles
```yaml
prohibido:
  - "Logs de passwords"
  - "Tokens en localStorage (usar httpOnly cookies)"
  - "Datos de clientes en logs"
  - "Credenciales en código fuente"

requerido:
  - "Encriptar datos sensibles"
  - "Validar inputs del servidor"
  - "Usar variables de entorno"
  - "Implementar rate limiting"
```

## 📊 Métricas y Monitoreo

### KPIs de Desarrollo
```yaml
eficiencia:
  tokens_por_peticion: "<800 promedio"
  cache_hit_rate: ">80%"
  tiempo_respuesta: "<30 segundos"
  errores_auto_resueltos: ">70%"

calidad:
  test_coverage: ">80%"
  eslint_warnings: "0"
  typescript_errors: "0"
  security_vulnerabilities: "0"
```

### Logging y Debugging
```yaml
logs_requeridos:
  - "Errores de autenticación"
  - "Fallos de API"
  - "Errores de base de datos"
  - "Acciones de administrador"

logs_prohibidos:
  - "Passwords o tokens"
  - "Datos personales de clientes"
  - "Información sensible del sistema"
```

## 🔄 Flujo de Trabajo Preferido

### Desarrollo de Nuevas Funcionalidades
```yaml
proceso:
  1: "Verificar contexto en caché"
  2: "Buscar patrones similares existentes"
  3: "Implementar usando componentes reutilizables"
  4: "Escribir tests unitarios"
  5: "Probar en desarrollo"
  6: "Documentar cambios en caché"
  7: "Commit con mensaje descriptivo"
```

### Debugging de Errores
```yaml
proceso:
  1: "Documentar error con .\error_handler.ps1"
  2: "Buscar errores similares en caché"
  3: "Aplicar comandos de diagnóstico automáticos"
  4: "Implementar fix mínimo necesario"
  5: "Verificar solución"
  6: "Marcar error como resuelto"
  7: "Actualizar base de conocimiento"
```

## 🎯 Comandos Personalizados

### Comandos de Desarrollo Frecuentes
```bash
# Iniciar desarrollo
start_dev: "cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8001 & cd frontend && npm run dev"

# Verificar estado
check_status: ".\auto_init.ps1 -action status && .\error_handler.ps1 -action report"

# Limpiar caché
clean_cache: ".\error_handler.ps1 -action clean && .\auto_init.ps1 -action init -force"

# Backup de contexto
backup_context: "Copy-Item .trae\*.md .trae\backup\ -Force"
```

### Comandos de Testing
```bash
# Tests frontend
test_frontend: "cd frontend && npm test -- --coverage"

# Tests backend
test_backend: "cd backend && python -m pytest --cov=app"

# Tests completos
test_all: "npm run test:frontend && npm run test:backend"
```

## 🚀 Configuración de Optimización Extrema

### Para Máxima Eficiencia
```yaml
cache_config:
  auto_init: true
  auto_error_handling: true
  auto_documentation: true
  token_optimization: "aggressive"

ai_behavior:
  prefer_cache: true
  minimize_file_reads: true
  use_specific_commands: true
  auto_update_context: true
```

### Métricas de Éxito
```yaml
objetivos:
  reduccion_tokens: "70-90%"
  velocidad_desarrollo: "+50%"
  errores_auto_resueltos: ">80%"
  contexto_mantenido: "100%"
```

## 📝 Notas Importantes

1. **Idioma**: Todas las respuestas, tareas y documentación en español
2. **Optimización**: Priorizar eficiencia de tokens sobre completitud
3. **Caché**: Usar sistema de caché para TODAS las operaciones
4. **Errores**: Documentar automáticamente para aprendizaje continuo
5. **Contexto**: Mantener estado entre sesiones para desarrollo continuo

## 🎯 Activación

Para activar estas reglas optimizadas, la IA debe:

1. Leer este archivo al inicio de cada sesión
2. Aplicar configuraciones automáticamente
3. Usar comandos específicos del sistema de caché
4. Documentar todas las acciones para mejora continua

**Resultado esperado**: Desarrollo 3-5x más eficiente con máxima calidad.