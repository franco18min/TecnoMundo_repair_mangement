# ⚡ Quick Commands - Contexto Instantáneo

> **Propósito**: Comandos para obtener contexto específico sin cargar archivos completos

## 🔍 Comandos de Contexto por Área

### 📋 Órdenes de Reparación
```bash
# Ver estructura de componentes de órdenes
ls frontend/src/components/orders/ | head -10

# Buscar funciones específicas en OrderModal
grep -n "function\|const.*=" frontend/src/components/orders/OrderModal/OrderModal.jsx | head -5

# Ver endpoints de órdenes
grep -n "router\." backend/app/api/endpoints/repair_orders.py | head -5

# Buscar errores recientes en órdenes
grep -r "error\|Error" frontend/src/components/orders/ --include="*.jsx" | head -3
```

### 👥 Gestión de Usuarios
```bash
# Componentes de usuarios
ls frontend/src/components/config/ | grep -i user

# API de usuarios
grep -n "export.*user" frontend/src/api/ -r | head -3

# Modelos de usuario
grep -n "class.*User" backend/app/models/ -r
```

### 🏢 Sucursales (Branches)
```bash
# Componentes de sucursales
ls frontend/src/components/ -R | grep -i branch

# API de sucursales
grep -n "branch" frontend/src/api/ -r | head -5

# Configuración de sucursales
grep -n "branch" backend/app/schemas/ -r | head -3
```

### 🔧 Configuración
```bash
# Archivos de configuración
find . -name "*config*" -type f | grep -v node_modules | head -5

# Variables de entorno
cat frontend/.env.production | head -5

# Configuración de base de datos
grep -n "DATABASE\|DB_" backend/ -r | head -3
```

## 🐛 Comandos de Debugging

### Errores de Frontend
```bash
# Buscar console.error en componentes
grep -r "console\.error\|console\.log" frontend/src/components/ | head -5

# Verificar imports rotos
grep -r "import.*from" frontend/src/ | grep -v node_modules | head -10

# Buscar useState problemático
grep -r "useState.*undefined\|useState.*null" frontend/src/ | head -3
```

### Errores de Backend
```bash
# Logs de FastAPI
grep -r "raise\|except" backend/app/ | head -5

# Problemas de base de datos
grep -r "session\|query" backend/app/crud/ | head -5

# Validaciones de schemas
grep -r "ValidationError\|validate" backend/app/ | head -3
```

## 📊 Estado del Sistema

### Verificación Rápida de Servicios
```bash
# Backend corriendo
netstat -an | findstr :8001 | head -1

# Frontend corriendo
netstat -an | findstr :5173 | head -1

# Último commit
git log --oneline -1

# Archivos modificados
git status --porcelain | head -5
```

### Información de Dependencias
```bash
# Versión de Node
node --version

# Versión de Python
python --version

# Paquetes de frontend
cat frontend/package.json | grep -A 10 "dependencies" | head -10

# Paquetes de backend
cat backend/requirements.txt | head -10
```

## 🎯 Comandos para la IA

### Obtener contexto sin cargar archivos
```bash
# Contexto de sesión actual
cat .trae/session_tracker.md | grep -A 5 "TAREA_PRINCIPAL\|ERROR_ACTUAL"

# Últimos cambios
cat .trae/context_cache.md | grep -A 3 "CAMBIOS_RECIENTES"

# Archivos en foco
cat .trae/session_tracker.md | grep -A 10 "archivo_principal"

# Estado de errores
grep -A 5 "estado: activo" .trae/session_tracker.md
```

### Búsquedas específicas por función
```bash
# Buscar función específica
grep -n "function NOMBRE_FUNCION\|const NOMBRE_FUNCION" frontend/src/ -r

# Buscar componente específico
find frontend/src/components/ -name "*NOMBRE*.jsx" | head -3

# Buscar endpoint específico
grep -n "ENDPOINT_NAME" backend/app/api/ -r

# Buscar modelo específico
grep -n "class MODELO" backend/app/models/ -r
```

## 💡 Patrones de Uso Optimizado

### Para debugging:
1. `cat .trae/session_tracker.md | grep ERROR`
2. `grep -n "LINEA_ERROR" ARCHIVO_ESPECIFICO`
3. Modificar solo las líneas problemáticas

### Para nuevas funciones:
1. `cat .trae/context_cache.md | grep PATRON_SIMILAR`
2. `grep -n "FUNCION_SIMILAR" DIRECTORIO_OBJETIVO -r`
3. Copiar patrón y adaptar

### Para refactoring:
1. `grep -n "FUNCION_OBJETIVO" . -r | head -5`
2. Identificar dependencias con grep
3. Modificar paso a paso

---
**⚡ Tip**: Estos comandos proporcionan contexto específico en <50 tokens cada uno