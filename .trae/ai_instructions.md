# 🤖 AI Instructions - Sistema de Caché de Contexto

> **Para la IA**: Instrucciones para usar el sistema de caché y optimizar tokens

## 🎯 Protocolo de Inicio de Sesión

### 1. SIEMPRE leer primero (en este orden):
```
1. .trae/context_cache.md (contexto general)
2. .trae/session_tracker.md (sesión actual)
3. .trae/quick_commands.md (comandos específicos)
```

### 2. NO leer archivos completos si:
- Existe contexto en cache
- El error está documentado en session_tracker
- La función está listada en archivos_activos

### 3. Usar comandos rápidos para:
- Verificar estado actual: `cat .trae/session_tracker.md | grep -A 5 "TAREA_PRINCIPAL"`
- Buscar funciones: `grep -n "NOMBRE_FUNCION" DIRECTORIO -r | head -3`
- Ver errores: `grep -A 5 "estado: activo" .trae/session_tracker.md`

## 🔄 Flujo de Trabajo Optimizado

### Al recibir una petición:

#### PASO 1: Verificar caché
```bash
# Ejecutar SIEMPRE primero
cat .trae/session_tracker.md | grep -A 10 "archivo_principal"
```

#### PASO 2: Si hay contexto, continuar directamente
- NO cargar archivos completos
- Usar información del caché
- Aplicar cambios específicos

#### PASO 3: Si NO hay contexto, usar búsqueda dirigida
```bash
# Buscar función específica
grep -n "FUNCION_OBJETIVO" DIRECTORIO_ESPECIFICO -r | head -3

# Ver estructura sin contenido
ls DIRECTORIO_OBJETIVO | head -5
```

#### PASO 4: Actualizar caché después de cada acción
- Modificar session_tracker.md
- Agregar a historial de acciones

## 🚨 Manejo Automático de Errores

### Cuando encuentres un error:

#### 1. Documentar inmediatamente
```bash
# Actualizar session_tracker con el error
echo "error_nuevo:
  mensaje: '[MENSAJE_ERROR]'
  archivo: '[ARCHIVO]'
  linea: '[LINEA]'
  solucion: 'investigando'
  estado: 'activo'" >> .trae/session_tracker.md
```

#### 2. Buscar soluciones en caché
```bash
# Verificar si el error ya fue resuelto antes
grep -A 5 "[MENSAJE_ERROR_SIMILAR]" .trae/session_tracker.md
```

#### 3. Aplicar solución dirigida
- NO revisar archivos completos
- Usar comandos específicos de quick_commands.md
- Aplicar fix mínimo necesario

#### 4. Verificar y documentar solución
```bash
# Actualizar estado del error
sed -i 's/estado: "activo"/estado: "resuelto"/' .trae/session_tracker.md
```

## 🔧 Auto-Inicialización de Contexto

### Al iniciar cualquier sesión, la IA debe:

#### 1. Verificar estado del proyecto
```bash
# Verificar si hay sesión activa
if [ -f ".trae/session_tracker.md" ]; then
    cat .trae/session_tracker.md | grep "TAREA_PRINCIPAL"
else
    echo "Nueva sesión - inicializando contexto"
fi
```

#### 2. Auto-completar información faltante
```bash
# Si no hay contexto, crear automáticamente
if [ -z "$(grep 'TAREA_PRINCIPAL:' .trae/session_tracker.md)" ]; then
    # Detectar archivos modificados recientemente
    git status --porcelain | head -5
    # Inferir contexto de cambios recientes
    git log --oneline -3
fi
```

#### 3. Establecer contexto inteligente
- Detectar archivos en desarrollo basado en git status
- Identificar funciones modificadas con git diff
- Establecer objetivos basados en commits recientes

## 🎯 Comandos de Auto-Recuperación

### Para recuperar contexto perdido:

#### Detectar archivos activos
```bash
# Archivos modificados no commiteados
git status --porcelain | grep "^M" | cut -c4-

# Últimas funciones modificadas
git diff --name-only HEAD~1 | xargs grep -l "function\|def\|const.*=" | head -3
```

#### Inferir objetivo actual
```bash
# Último commit para entender objetivo
git log -1 --pretty=format:"%s"

# Archivos más editados recientemente
git log --name-only --pretty=format: HEAD~5..HEAD | sort | uniq -c | sort -nr | head -5
```

#### Auto-completar session_tracker
```bash
# Si session_tracker está vacío, completar automáticamente
ULTIMO_COMMIT=$(git log -1 --pretty=format:"%s")
ARCHIVOS_MODIFICADOS=$(git status --porcelain | grep "^M" | cut -c4-)

# Actualizar automáticamente
echo "TAREA_PRINCIPAL: '$ULTIMO_COMMIT'" > .trae/session_tracker.md
echo "ARCHIVOS_OBJETIVO: [$ARCHIVOS_MODIFICADOS]" >> .trae/session_tracker.md
```

## 📊 Métricas de Optimización Automática

### La IA debe monitorear:

#### Tokens utilizados por sesión
```bash
# Registrar uso de tokens (aproximado)
echo "$(date): Tokens estimados: [CANTIDAD]" >> .trae/token_usage.log
```

#### Eficiencia de caché
```bash
# Registrar hits/misses de caché
echo "$(date): Cache hit - contexto encontrado" >> .trae/cache_stats.log
echo "$(date): Cache miss - archivo cargado completo" >> .trae/cache_stats.log
```

#### Auto-optimización
- Si tokens > 2000 en una petición → Usar más caché
- Si cache miss > 30% → Mejorar documentación de contexto
- Si errores recurrentes → Crear quick_commands específicos

## 🔄 Ciclo de Vida Automático

### Inicio de sesión
1. Leer caché existente
2. Auto-detectar contexto si está vacío
3. Establecer objetivos basados en git status
4. Preparar comandos rápidos relevantes

### Durante desarrollo
1. Usar caché para todas las operaciones
2. Documentar errores automáticamente
3. Actualizar contexto en tiempo real
4. Optimizar comandos basado en patrones

### Fin de sesión
1. Consolidar cambios en context_cache.md
2. Limpiar errores resueltos
3. Preparar contexto para próxima sesión
4. Generar reporte de optimización

## 🚀 Comandos de Emergencia

### Si el sistema falla:
```bash
# Reset completo del caché
rm .trae/session_tracker.md
git status > .trae/emergency_context.txt
git log --oneline -5 >> .trae/emergency_context.txt

# Reconstruir contexto mínimo
echo "TAREA_PRINCIPAL: 'Recuperando contexto perdido'" > .trae/session_tracker.md
echo "ARCHIVOS_OBJETIVO: [$(git status --porcelain | head -3)]" >> .trae/session_tracker.md
```

### Verificación de integridad
```bash
# Verificar que todos los archivos de caché existen
ls .trae/ | grep -E "(context_cache|session_tracker|quick_commands|ai_instructions)"

# Si falta alguno, regenerar automáticamente
if [ ! -f ".trae/session_tracker.md" ]; then
    echo "# Auto-generado: $(date)" > .trae/session_tracker.md
    echo "TAREA_PRINCIPAL: 'Contexto auto-recuperado'" >> .trae/session_tracker.md
fi
```
- Actualizar estado de errores

## 🐛 Manejo de Errores Optimizado

### Cuando aparece un error:

#### 1. Verificar si ya está documentado:
```bash
grep -A 5 "ERROR_ACTUAL\|error_1" .trae/session_tracker.md
```

#### 2. Si es nuevo, documentar inmediatamente:
```yaml
error_nuevo:
  mensaje: "MENSAJE_EXACTO_ERROR"
  archivo: "RUTA_ARCHIVO"
  linea: "NUMERO_LINEA"
  solucion: "PENDIENTE"
  estado: "activo"
```

#### 3. Buscar contexto específico del error:
```bash
grep -n "LINEA_ERROR" ARCHIVO_ESPECIFICO | head -3
```

#### 4. NO revisar todo el archivo, solo el contexto del error

## 📝 Actualización de Caché

### Después de cada modificación exitosa:

#### En session_tracker.md:
```yaml
# Actualizar progreso
PROGRESO: "X% - descripción_breve"

# Agregar al historial
- **[HORA]** - [ACCION] en [ARCHIVO] - exitoso

# Marcar error como resuelto si aplica
estado: "resuelto"
```

#### En context_cache.md:
```yaml
# Agregar a cambios recientes
1. **[FECHA]** - **[ARCHIVO]**: [DESCRIPCIÓN_BREVE]

# Actualizar última modificación
ULTIMA_MODIFICACION: "[FECHA] - [ARCHIVO] - [ACCION]"
```

## 🚫 Qué NO hacer (Anti-patrones)

### ❌ NUNCA:
- Cargar archivos completos si hay contexto en caché
- Revisar múltiples archivos "por si acaso"
- Ignorar el contexto de session_tracker
- Hacer búsquedas generales sin usar quick_commands

### ❌ EVITAR:
- `view_files` con `read_entire_file: true`
- `search_codebase` sin directorio específico
- Cargar más de 2 archivos por petición
- Descripciones largas del contexto

### ✅ HACER:
- Usar comandos de quick_commands.md
- Leer solo rangos específicos de líneas
- Actualizar caché después de cada acción
- Mantener contexto incremental

## 🎯 Ejemplos de Uso Optimizado

### Ejemplo 1: Error en función específica
```
Usuario: "Error en handleSubmit de OrderModal"

IA:
1. cat .trae/session_tracker.md | grep -A 5 "OrderModal"
2. grep -n "handleSubmit" frontend/src/components/orders/OrderModal/OrderModal.jsx | head -3
3. view_files (solo líneas específicas del error)
4. Aplicar fix
5. Actualizar session_tracker.md
```

### Ejemplo 2: Nueva funcionalidad
```
Usuario: "Agregar validación a UserModal"

IA:
1. cat .trae/context_cache.md | grep -A 3 "UserModal"
2. grep -n "validation\|validate" frontend/src/components/ -r | head -3
3. Copiar patrón existente
4. Aplicar a UserModal
5. Actualizar context_cache.md
```

## 📊 Métricas de Optimización

### Objetivo por sesión:
- **Máximo 3 view_files** por petición
- **Máximo 200 líneas** leídas por petición
- **Siempre usar caché** antes que archivos completos
- **Actualizar caché** después de cada acción

### Indicadores de éxito:
- Resolver errores sin cargar archivos completos
- Mantener contexto entre peticiones
- Reducir tokens en 70-80%
- Tiempo de respuesta más rápido

---
**🎯 Recordatorio**: El caché es la fuente principal de contexto, los archivos son secundarios