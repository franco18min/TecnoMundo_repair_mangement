# 🚀 Flujo de Trabajo Correcto - Sistema de Caché Optimizado

## 📋 Resumen del Flujo Completo

### 🎯 Objetivo
Trabajar con máxima eficiencia usando **comandos específicos** en lugar de cargar archivos completos, reduciendo el uso de tokens en 70-90%.

---

## 🔄 FLUJO DE TRABAJO PASO A PASO

### 1️⃣ INICIALIZACIÓN (Al comenzar cualquier sesión)

```bash
# SIEMPRE ejecutar al inicio
cd .trae

# Verificar estado del sistema
Get-Content session_tracker.md | Select-String "OBJETIVO|ERROR|PROGRESO"

# Verificar contexto general
Get-Content context_cache.md | Select-String "FUNCIONALIDADES|ESTADO"
```

**¿Qué hace esto?**
- Lee el contexto existente sin cargar archivos completos
- Identifica el objetivo actual de la sesión
- Detecta errores pendientes automáticamente

---

### 2️⃣ NUEVA TAREA (Desarrollo/Debugging/Refactoring)

#### Para Desarrollo de Nuevas Funcionalidades:
```bash
# Buscar patrones similares existentes
Select-String -Pattern "Modal|Form|Component" -Path "../src/components/*.jsx" | Select-Object -First 3

# Verificar estructura de archivos recientes
Get-ChildItem -Recurse -Include "*.jsx","*.py" | Where-Object {$_.LastWriteTime -gt (Get-Date).AddHours(-2)} | Select-Object -First 5

# Buscar funciones específicas
Select-String -Pattern "function|const.*=" -Path "../src/components/orders/*.jsx" | Select-Object -First 3
```

#### Para Debugging:
```bash
# Errores de React
Select-String -Pattern "useState|useEffect|Error" -Path "../src/components/*.jsx" | Select-Object -First 3

# Errores de FastAPI
Select-String -Pattern "async def|HTTPException" -Path "../backend/app/*.py" | Select-Object -First 3

# Estado de servidores
netstat -an | findstr ":8001"
netstat -an | findstr ":5173"
```

#### Para Refactoring:
```bash
# Buscar dependencias específicas
Select-String -Pattern "import.*from" -Path "../src/components/orders/OrderModal.jsx" | Select-Object -First 5

# Verificar uso de funciones
Select-String -Pattern "handleSubmit|validation" -Path "../src/components/*.jsx" | Select-Object -First 3
```

---

### 3️⃣ IMPLEMENTACIÓN (Hacer cambios mínimos)

**REGLA DE ORO**: Usar `edit_file_fast_apply` con SOLO las líneas que cambian:

```javascript
// ❌ MAL - No cargar archivo completo
// ✅ BIEN - Solo las líneas específicas:

// ... existing code ...
const handleSubmit = async (data) => {
  // Nueva validación aquí
  if (!data.customer_name) {
    setError('Nombre del cliente es requerido');
    return;
  }
  // ... resto del código existente
};
// ... existing code ...
```

---

### 4️⃣ DOCUMENTACIÓN (Actualizar caché automáticamente)

```bash
# Documentar el cambio realizado
.\update_cache.ps1 -action "Agregada validación en OrderModal" -file "OrderModal.jsx" -status "completado"

# Verificar que no hay errores
.\error_handler.ps1 -action report
```

---

### 5️⃣ CAMBIO DE TIPO DE TAREA

#### De Desarrollo → Debugging:
```bash
# Documentar tarea actual como completada
.\update_cache.ps1 -action "Funcionalidad X completada" -file "ComponenteX.jsx" -status "completado"

# Cambiar objetivo en session_tracker
.\update_cache.ps1 -action "Iniciando debugging de error Y" -file "session_tracker.md" -status "en_progreso"
```

#### De Debugging → Nueva Funcionalidad:
```bash
# Marcar error como resuelto
.\error_handler.ps1 -action resolve -error_id "ERROR_123"

# Iniciar nueva tarea
.\update_cache.ps1 -action "Iniciando desarrollo de funcionalidad Z" -file "session_tracker.md" -status "en_progreso"
```

#### De Cualquier Tarea → Testing:
```bash
# Documentar tarea actual
.\update_cache.ps1 -action "Tarea completada, iniciando testing" -file "session_tracker.md" -status "testing"

# Comandos específicos para testing
cd ../frontend && npm test
cd ../backend && python -m pytest
```

---

## 🎯 COMANDOS ESPECÍFICOS POR CONTEXTO

### 📊 Estado del Proyecto
```bash
# Objetivo actual
Get-Content session_tracker.md | Select-String "OBJETIVO"

# Errores pendientes
Get-Content session_tracker.md | Select-String "ERROR"

# Archivos en progreso
Get-Content session_tracker.md | Select-String "PROGRESO"
```

### 🔍 Búsqueda de Código
```bash
# Componentes React
Select-String -Pattern "export.*function|export.*const" -Path "../src/components/*.jsx"

# APIs FastAPI
Select-String -Pattern "@app\.(get|post|put|delete)" -Path "../backend/app/api/*.py"

# Modelos de base de datos
Select-String -Pattern "class.*Base|Column" -Path "../backend/app/models/*.py"
```

### 🐛 Debugging Específico
```bash
# Errores de importación
Select-String -Pattern "import.*from|ImportError" -Path "../src/**/*.jsx"

# Errores de API
Select-String -Pattern "fetch|axios|HTTPException" -Path "../src/**/*.js"

# Errores de base de datos
Select-String -Pattern "SQLAlchemy|session\." -Path "../backend/app/**/*.py"
```

---

## 🚨 REGLAS CRÍTICAS

### ❌ NUNCA HACER:
- Cargar archivos completos con `view_files` sin contexto específico
- Usar `search_codebase` para información general
- Implementar cambios sin documentar en el caché
- Cambiar de tarea sin actualizar `session_tracker.md`

### ✅ SIEMPRE HACER:
- Usar comandos específicos de `quick_commands.md`
- Documentar TODOS los cambios con `update_cache.ps1`
- Verificar errores con `error_handler.ps1`
- Mantener contexto actualizado en `session_tracker.md`

---

## 🔄 EJEMPLO COMPLETO DE CAMBIO DE TAREA

### Escenario: De "Arreglar validación en OrderModal" → "Implementar notificaciones WebSocket"

```bash
# 1. Completar tarea actual
.\update_cache.ps1 -action "Validación en OrderModal corregida" -file "OrderModal.jsx" -status "completado"

# 2. Verificar que no hay errores
.\error_handler.ps1 -action report

# 3. Cambiar objetivo
.\update_cache.ps1 -action "Iniciando implementación de notificaciones WebSocket" -file "session_tracker.md" -status "en_progreso"

# 4. Obtener contexto para nueva tarea
Select-String -Pattern "WebSocket|socket|notification" -Path "../src/**/*.jsx" | Select-Object -First 3
Select-String -Pattern "websocket|WebSocket" -Path "../backend/app/**/*.py" | Select-Object -First 3

# 5. Buscar patrones existentes
Select-String -Pattern "useEffect|useState.*notification" -Path "../src/context/*.jsx" | Select-Object -First 3
```

---

## 🎯 MÉTRICAS DE ÉXITO

### Objetivos por Sesión:
- **Tokens por petición**: <800 (objetivo <400)
- **Tiempo de respuesta**: <30 segundos
- **Errores auto-resueltos**: >70%
- **Contexto mantenido**: 100%

### Comandos de Verificación:
```bash
# Verificar eficiencia
Get-Content session_tracker.md | Measure-Object -Line

# Verificar errores resueltos
Get-Content error_log.csv | Select-Object -Last 10

# Estado del caché
Get-ChildItem *.md | Select-Object Name, LastWriteTime
```

---

## 🚀 ACTIVACIÓN RÁPIDA

Para usar este flujo inmediatamente:

1. **Copia este archivo** como referencia
2. **Ejecuta siempre**: `cd .trae` al inicio
3. **Usa comandos específicos** en lugar de cargar archivos
4. **Documenta todo** con `update_cache.ps1`
5. **Cambia de tarea** actualizando `session_tracker.md`

**Resultado: Desarrollo 3-5x más eficiente con mínimo consumo de tokens.**