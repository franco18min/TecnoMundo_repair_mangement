# 🧠 Context Cache - TecnoMundo Repair Management

> **Propósito**: Mantener contexto de desarrollo sin revisar archivos completos repetidamente
> **Última actualización**: $(Get-Date -Format "yyyy-MM-dd HH:mm")

## 📋 Estado Actual del Proyecto

### 🏗️ Arquitectura Principal
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (Puerto 8001)
- **Frontend**: React + Vite + TailwindCSS (Puerto 5173)
- **Base de Datos**: PostgreSQL con schemas `customer` y `system`
- **Autenticación**: JWT tokens
- **Comunicación**: WebSocket para notificaciones en tiempo real

### 🔧 Funcionalidades Implementadas
- ✅ Sistema de autenticación completo
- ✅ CRUD de órdenes de reparación
- ✅ Gestión de usuarios y roles
- ✅ Sistema de sucursales
- ✅ Notificaciones en tiempo real
- ✅ Configuración de tickets por sucursal
- ✅ Sistema de checklist predefinido

## 🎯 Sesión de Desarrollo Actual

### 📁 Archivos en Foco
<!-- Actualizar esta sección en cada sesión -->
```
ARCHIVOS_ACTIVOS: []
FUNCIONES_EN_DESARROLLO: []
ERRORES_PENDIENTES: []
ULTIMA_MODIFICACION: ""
```

### 🐛 Contexto de Errores
<!-- Mantener historial de errores y soluciones -->
```
ERROR_ACTUAL: ""
ARCHIVO_AFECTADO: ""
LINEAS_PROBLEMA: ""
SOLUCION_INTENTADA: ""
ESTADO: "pendiente|resuelto|investigando"
```

### 🔄 Cambios Recientes
<!-- Últimos 3 cambios significativos -->
1. **[FECHA]** - **[ARCHIVO]**: [DESCRIPCIÓN_BREVE]
2. **[FECHA]** - **[ARCHIVO]**: [DESCRIPCIÓN_BREVE]
3. **[FECHA]** - **[ARCHIVO]**: [DESCRIPCIÓN_BREVE]

## 🚀 Comandos Rápidos de Contexto

### Para la IA - Uso Inmediato
```bash
# Revisar solo cambios recientes
git diff HEAD~1 --name-only

# Estado actual de desarrollo
cat .trae/context_cache.md | grep -A 5 "ARCHIVOS_ACTIVOS"

# Errores pendientes
cat .trae/context_cache.md | grep -A 10 "ERROR_ACTUAL"
```

### Patrones de Archivos Frecuentes
```
FRONTEND_ORDERS: frontend/src/components/orders/
BACKEND_ORDERS: backend/app/api/endpoints/repair_orders.py
MODELS: backend/app/models/
SCHEMAS: backend/app/schemas/
API_CLIENT: frontend/src/api/
```

## 📝 Notas de Desarrollo

### Convenciones del Proyecto
- Todos los textos en español
- Estados de órdenes: Pending, In Process, Completed, Delivered, Cancelled
- Roles: Administrator, Technician, Manager
- Prefijos de componentes: Order*, User*, Branch*, Config*

### Dependencias Clave
```javascript
// Frontend
- React 18+
- Vite
- TailwindCSS
- Axios
- React Router

// Backend  
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT
- WebSocket
```

## 🎯 Instrucciones para la IA

### Al iniciar nueva sesión:
1. Leer este archivo primero
2. Revisar sección "ARCHIVOS_ACTIVOS" 
3. Verificar "ERROR_ACTUAL" si existe
4. Continuar desde "ULTIMA_MODIFICACION"

### Al encontrar errores:
1. Actualizar sección "ERROR_ACTUAL"
2. Agregar a "ARCHIVOS_ACTIVOS" si es nuevo
3. NO revisar archivos completos, usar contexto aquí

### Al completar tareas:
1. Actualizar "CAMBIOS_RECIENTES"
2. Limpiar "ERROR_ACTUAL" si se resolvió
3. Actualizar "ULTIMA_MODIFICACION"

---
**💡 Tip**: Usar este archivo como única fuente de contexto para optimizar tokens