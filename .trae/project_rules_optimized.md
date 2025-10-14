# 🏗️ Project Rules - TecnoMundo Repair Management (Optimizado)

> **Sistema de Gestión de Reparaciones con Optimización Extrema de Tokens**

## 🎯 Información del Proyecto

### Descripción General
```yaml
nombre: "TecnoMundo Repair Management"
tipo: "Sistema de gestión de reparaciones de dispositivos electrónicos"
arquitectura: "Full-stack web application"
estado: "En desarrollo activo"
optimizacion: "Sistema de caché avanzado implementado"
```

### Stack Tecnológico
```yaml
frontend:
  framework: "React 18 + Vite"
  styling: "TailwindCSS"
  routing: "React Router v6"
  state: "Context API + useState"
  websocket: "WebSocket nativo"
  
backend:
  framework: "FastAPI"
  database: "PostgreSQL"
  orm: "SQLAlchemy"
  auth: "JWT + bcrypt"
  websocket: "FastAPI WebSocket"
  
desarrollo:
  package_manager: "npm"
  python_env: "venv"
  database_client: "pgAdmin / psql"
```

## 🚀 Comandos de Inicio Rápido

### Desarrollo Local
```bash
# Backend (Puerto 8001)
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8001

# Frontend (Puerto 5173)
cd frontend
npm run dev

# Verificación rápida
curl http://localhost:8001/docs
curl http://localhost:5173
```

### Comandos de Caché (OBLIGATORIOS)
```bash
# Inicializar contexto automáticamente
.\auto_init.ps1

# Verificar estado del sistema
.\auto_init.ps1 -action status

# Manejar errores automáticamente
.\error_handler.ps1 -action detect

# Actualizar caché después de cambios
.\update_cache.ps1 -action "descripción" -file "archivo" -status "completado"
```

## 🔐 Credenciales de Desarrollo

### Usuario Administrador
```yaml
username: "admin"
password: "admin123"
email: "admin@tecnomundo.com"
role: "Administrator"
permissions: "Acceso completo al sistema"
branch: "Todas las sucursales"
```

### Usuario Técnico
```yaml
username: "tecnico1"
password: "tecnico123"
email: "tecnico1@tecnomundo.com"
role: "Technician"
permissions: "Solo órdenes asignadas"
branch: "Sucursal Principal"
```

## 📊 Estructura de Base de Datos

### Schemas Principales
```yaml
customer:
  - repair_orders (órdenes de reparación)
  - customers (clientes)
  - devices (dispositivos)
  - order_history (historial)
  
system:
  - users (usuarios del sistema)
  - branches (sucursales)
  - notifications (notificaciones)
  - system_config (configuración)
```

### Estados de Órdenes
```yaml
estados:
  pending: "Pendiente"
  in_process: "En Proceso"
  completed: "Completada"
  delivered: "Entregada"
  cancelled: "Cancelada"
```

## 🏢 Configuración de Sucursales

### Sucursales Disponibles
```yaml
sucursales:
  principal:
    name: "Sucursal Principal"
    code: "SP"
    address: "Dirección principal"
    
  norte:
    name: "Sucursal Norte"
    code: "SN"
    address: "Dirección norte"
    
  sur:
    name: "Sucursal Sur"
    code: "SS"
    address: "Dirección sur"
```

## 🔧 Configuración de Desarrollo

### Puertos y URLs
```yaml
desarrollo:
  backend_api: "http://localhost:8001"
  backend_docs: "http://localhost:8001/docs"
  frontend: "http://localhost:5173"
  websocket: "ws://localhost:8001/ws"
  
produccion:
  backend_api: "https://api.tecnomundo.com"
  frontend: "https://tecnomundo.com"
  websocket: "wss://api.tecnomundo.com/ws"
```

### Variables de Entorno
```yaml
backend:
  DATABASE_URL: "postgresql://user:pass@localhost/tecnomundo"
  SECRET_KEY: "your-secret-key"
  ALGORITHM: "HS256"
  ACCESS_TOKEN_EXPIRE_MINUTES: 1440
  
frontend:
  VITE_API_URL: "http://localhost:8001"
  VITE_WS_URL: "ws://localhost:8001/ws"
```

## 🧪 Flujos de Testing Principales

### 1. Autenticación Completa
```yaml
pasos:
  1: "Login con admin/admin123"
  2: "Verificar acceso a todas las secciones"
  3: "Probar logout"
  4: "Re-login con tecnico1/tecnico123"
  5: "Verificar restricciones de rol"
```

### 2. Gestión de Órdenes
```yaml
pasos:
  1: "Crear nueva orden de reparación"
  2: "Asignar técnico específico"
  3: "Actualizar estado (pending → in_process)"
  4: "Transferir entre sucursales"
  5: "Completar y marcar como entregada"
  6: "Verificar historial completo"
```

### 3. Notificaciones WebSocket
```yaml
pasos:
  1: "Abrir dos ventanas del navegador"
  2: "Login con usuarios diferentes"
  3: "Crear/actualizar orden en ventana 1"
  4: "Verificar notificación en ventana 2"
  5: "Confirmar persistencia de notificaciones"
```

## 🎯 Sistema de Caché Avanzado

### Archivos de Caché (CRÍTICOS)
```yaml
context_cache.md:
  proposito: "Contexto general del proyecto"
  contenido: "Arquitectura, funcionalidades, estado actual"
  actualizacion: "Automática con cada cambio significativo"
  
session_tracker.md:
  proposito: "Estado específico de la sesión"
  contenido: "Objetivos, archivos en progreso, errores"
  actualizacion: "Tiempo real durante desarrollo"
  
ai_instructions.md:
  proposito: "Instrucciones para la IA"
  contenido: "Protocolos, comandos, optimizaciones"
  actualizacion: "Manual cuando se mejoran procesos"
```

### Comandos de Optimización
```bash
# SIEMPRE usar estos comandos en lugar de cargar archivos completos
grep -n "FUNCION_OBJETIVO" . -r | head -3
find . -name "*.jsx" -newer .trae/last_update.txt
git log --oneline -5 --since="1 hour ago"
```

### Protocolo de Uso de Caché
```yaml
inicio_sesion:
  1: "Leer .trae/session_tracker.md"
  2: "Leer .trae/context_cache.md"
  3: "Ejecutar .\auto_init.ps1 si necesario"
  
durante_desarrollo:
  1: "Usar comandos específicos de quick_commands.md"
  2: "NUNCA cargar archivos completos"
  3: "Documentar cambios inmediatamente"
  
fin_sesion:
  1: "Ejecutar .\update_cache.ps1 con resumen"
  2: "Marcar tareas completadas"
  3: "Documentar errores pendientes"
```

## 🚨 Manejo Automático de Errores

### Base de Conocimiento de Errores
```yaml
errores_comunes:
  ImportError:
    pattern: "ModuleNotFoundError|ImportError"
    solucion: "Verificar imports y dependencias"
    comando: "npm install | pip install"
    
  SyntaxError:
    pattern: "SyntaxError|Unexpected token"
    solucion: "Revisar sintaxis y brackets"
    comando: "eslint --fix | python -m py_compile"
    
  ComponentError:
    pattern: "Cannot read property|undefined"
    solucion: "Verificar props y estado"
    comando: "grep -n 'useState\\|useEffect' archivo.jsx"
    
  APIError:
    pattern: "404|500|Connection refused"
    solucion: "Verificar endpoints y servidor"
    comando: "curl -I http://localhost:8001/health"
```

### Auto-Resolución
```yaml
proceso:
  1: "Detectar patrón de error automáticamente"
  2: "Buscar en base de conocimiento"
  3: "Aplicar comandos de diagnóstico"
  4: "Sugerir solución específica"
  5: "Documentar resolución para futuro"
```

## 📁 Estructura de Archivos Críticos

### Frontend (src/)
```yaml
componentes_principales:
  - "components/auth/LoginForm.jsx"
  - "components/orders/OrderModal.jsx"
  - "components/orders/OrderList.jsx"
  - "components/layout/Navbar.jsx"
  - "components/notifications/NotificationCenter.jsx"
  
contextos:
  - "context/AuthContext.jsx"
  - "context/OrderContext.jsx"
  - "context/NotificationContext.jsx"
  
hooks_personalizados:
  - "hooks/useAuth.js"
  - "hooks/useOrders.js"
  - "hooks/useWebSocket.js"
```

### Backend (app/)
```yaml
modelos_principales:
  - "models/user.py"
  - "models/repair_order.py"
  - "models/customer.py"
  - "models/branch.py"
  
api_endpoints:
  - "api/auth.py"
  - "api/orders.py"
  - "api/users.py"
  - "api/websocket.py"
  
servicios:
  - "services/auth_service.py"
  - "services/order_service.py"
  - "services/notification_service.py"
```

## 🎨 Estándares de UI/UX

### Componentes Reutilizables
```yaml
botones:
  primary: "bg-blue-600 hover:bg-blue-700 text-white"
  secondary: "bg-gray-600 hover:bg-gray-700 text-white"
  danger: "bg-red-600 hover:bg-red-700 text-white"
  
inputs:
  base: "border border-gray-300 rounded-lg px-3 py-2"
  focus: "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  error: "border-red-500 focus:ring-red-500"
  
cards:
  base: "bg-white rounded-lg shadow-sm border border-gray-200"
  hover: "hover:shadow-md transition-shadow"
```

### Layout Responsivo
```yaml
breakpoints:
  mobile: "max-width: 640px"
  tablet: "641px - 1024px"
  desktop: "1025px+"
  
grid_system:
  mobile: "grid-cols-1"
  tablet: "grid-cols-2"
  desktop: "grid-cols-3"
```

## 🔒 Configuración de Seguridad

### Autenticación JWT
```yaml
configuracion:
  algorithm: "HS256"
  expiration: "24 horas"
  refresh_token: "7 días"
  
validacion:
  - "Verificar token en cada request protegido"
  - "Validar roles antes de acciones sensibles"
  - "Logout automático al expirar token"
```

### Validación de Datos
```yaml
frontend:
  - "Validación de formularios con react-hook-form"
  - "Sanitización de inputs del usuario"
  - "Validación de tipos de archivo"
  
backend:
  - "Pydantic schemas para validación"
  - "Sanitización de queries SQL"
  - "Rate limiting en endpoints críticos"
```

## 📊 Métricas de Rendimiento

### Objetivos de Optimización
```yaml
tokens:
  peticion_simple: "<400 tokens"
  peticion_compleja: "<800 tokens"
  reduccion_objetivo: "70-90%"
  
desarrollo:
  tiempo_respuesta: "<30 segundos"
  cache_hit_rate: ">80%"
  errores_auto_resueltos: ">70%"
```

### Monitoreo Continuo
```yaml
comandos_verificacion:
  - ".\auto_init.ps1 -action metrics"
  - ".\error_handler.ps1 -action report"
  - ".\update_cache.ps1 -action status"
```

## 🚀 Comandos de Emergencia

### Recuperación Rápida
```bash
# Reiniciar sistema completo
.\auto_init.ps1 -action emergency

# Limpiar caché corrupto
Remove-Item .trae\*.md -Force && .\auto_init.ps1 -action init

# Backup de emergencia
Copy-Item .trae\*.md .trae\backup\$(Get-Date -Format "yyyyMMdd_HHmmss")\ -Force
```

### Diagnóstico Rápido
```bash
# Estado del sistema
netstat -an | findstr ":8001\|:5173"

# Logs de errores
Get-Content .trae\error_log.csv | Select-Object -Last 10

# Contexto actual
Get-Content .trae\session_tracker.md | Select-String "OBJETIVO\|ERROR\|PROGRESO"
```

## 🎯 Activación del Sistema Optimizado

### Para la IA (OBLIGATORIO)
```yaml
protocolo_inicio:
  1: "Leer .trae/ai_instructions.md"
  2: "Ejecutar .\auto_init.ps1"
  3: "Verificar contexto en session_tracker.md"
  4: "Usar SOLO comandos específicos de quick_commands.md"
  
protocolo_desarrollo:
  1: "NUNCA cargar archivos completos"
  2: "SIEMPRE usar caché existente"
  3: "SIEMPRE documentar cambios"
  4: "SIEMPRE manejar errores automáticamente"
```

### Resultado Esperado
```yaml
eficiencia:
  - "Reducción de tokens: 70-90%"
  - "Velocidad de desarrollo: +300%"
  - "Errores auto-resueltos: >80%"
  - "Contexto mantenido: 100%"
  
calidad:
  - "Código consistente y limpio"
  - "Documentación automática"
  - "Testing continuo"
  - "Seguridad garantizada"
```

## 📝 Notas Críticas

1. **OBLIGATORIO**: Usar sistema de caché para TODAS las operaciones
2. **PROHIBIDO**: Cargar archivos completos sin usar caché
3. **REQUERIDO**: Documentar automáticamente todos los cambios
4. **ESENCIAL**: Manejar errores con sistema automático
5. **CRÍTICO**: Mantener contexto entre sesiones para desarrollo continuo

**Este sistema está diseñado para desarrollo autónomo y eficiente con mínimo consumo de tokens.**