# 🎯 Session Tracker - Desarrollo Activo

> **Sesión iniciada**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
> **Objetivo**: [DEFINIR_OBJETIVO_SESION]

## 📊 Estado de la Sesión Actual

### 🎯 Objetivo Principal
```
TAREA_PRINCIPAL: ""
ARCHIVOS_OBJETIVO: []
FUNCIONES_OBJETIVO: []
PROGRESO: "0% - iniciando"
```

### 🔧 Archivos en Trabajo
```yaml
archivo_principal:
  path: ""
  lineas_modificadas: []
  funciones_afectadas: []
  estado: "sin_cambios|modificando|completado"

archivos_relacionados:
  - path: ""
    relacion: "importa|usa|extiende"
    estado: "revisado|pendiente"
```

### 🐛 Errores de Esta Sesión
```yaml
error_1:
  mensaje: ""
  archivo: ""
  linea: ""
  solucion: ""
  estado: "activo|resuelto"

error_2:
  mensaje: ""
  archivo: ""
  linea: ""
  solucion: ""
  estado: "activo|resuelto"
```

### ✅ Completado en Esta Sesión
- [ ] [TAREA_1]
- [ ] [TAREA_2]
- [ ] [TAREA_3]

## 🚀 Comandos de Contexto Rápido

### Para continuar desarrollo:
```bash
# Leer estado actual
cat .trae/session_tracker.md

# Ver cambios de esta sesión
git diff --name-only

# Verificar errores pendientes
grep -A 3 "estado: activo" .trae/session_tracker.md
```

### Para la IA:
```
CONTEXTO_RAPIDO: "Leer solo session_tracker.md y context_cache.md"
NO_REVISAR: "Archivos completos, solo usar cache de contexto"
ENFOQUE: "Continuar desde último error/modificación registrada"
```

## 📝 Log de Acciones

### Última acción realizada:
```
TIMESTAMP: ""
ACCION: ""
ARCHIVO: ""
RESULTADO: "exitoso|error|pendiente"
SIGUIENTE_PASO: ""
```

### Historial de esta sesión:
1. **[HORA]** - [ACCION] en [ARCHIVO] - [RESULTADO]
2. **[HORA]** - [ACCION] en [ARCHIVO] - [RESULTADO]
3. **[HORA]** - [ACCION] en [ARCHIVO] - [RESULTADO]

---
**🎯 Instrucción para IA**: Actualizar este archivo después de cada acción significativa