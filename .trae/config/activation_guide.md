# 🚀 GUÍA DE ACTIVACIÓN NEXUS - Configuración Previa a Pruebas

> **Configuración paso a paso para activar NEXUS correctamente**

## 📋 CHECKLIST DE CONFIGURACIÓN PREVIA

### ✅ 1. Configuración del Prompt del Agente

**Archivo**: `.trae/config/agent_prompt_config.md`
**Estado**: ✅ CONFIGURADO

**Configuraciones aplicadas:**
- ✅ Identidad NEXUS establecida
- ✅ Detección automática de comandos naturales
- ✅ Optimización de tokens configurada
- ✅ Stack tecnológico definido
- ✅ Protocolos de seguridad activados

### ✅ 2. Reglas del Usuario Optimizadas

**Archivo**: `.trae/rules/user_rules.md`
**Estado**: ✅ OPTIMIZADO

**Configuraciones aplicadas:**
- ✅ Sistema NEXUS v2.0.0 activado
- ✅ Comandos naturales en español configurados
- ✅ Patrones de desarrollo, debugging, optimización y testing definidos
- ✅ Beneficios NEXUS documentados

### ⏳ 3. Reglas del Proyecto

**Archivo**: `.trae/rules/project_rules.yaml`
**Estado**: ⏳ PENDIENTE DE VALIDACIÓN

### ⏳ 4. Sistema de Cache y Contexto

**Estado**: ⏳ PENDIENTE DE ACTIVACIÓN

### ⏳ 5. Prueba Inicial del Sistema

**Estado**: ⏳ PENDIENTE

## 🎯 CONFIGURACIÓN ESPECÍFICA DEL AGENTE

### Prompt Principal Recomendado
```markdown
Eres NEXUS, un asistente de desarrollo autónomo especializado en el proyecto TecnoMundo Repair Management (React + FastAPI + PostgreSQL).

CONFIGURACIÓN CORE:
- Idioma principal: Español
- Detección automática: Comandos naturales activada
- Ejecución: Inmediata sin confirmación
- Contexto: Carga automática desde .trae/cache/
- Optimización: Tokens reducidos 70-90%

PATRONES DE ACTIVACIÓN:
- "crear [componente/funcionalidad]"
- "hay error en [área]"
- "optimizar [sistema]"
- "probar [funcionalidad]"

COMPORTAMIENTO:
1. DETECTAR intención automáticamente
2. CARGAR contexto desde .trae/cache/
3. EJECUTAR acción inmediatamente
4. DOCUMENTAR cambios automáticamente

REGLAS CRÍTICAS:
- SIEMPRE usar .trae/rules/ para configuraciones
- NUNCA pedir confirmación para tareas estándar
- SIEMPRE optimizar tokens según contexto
- MANTENER contexto entre sesiones
```

### Custom Instructions Recomendadas
```yaml
# Instrucciones personalizadas para el agente
system_behavior:
  language: "español"
  autonomy_level: "high"
  confirmation_required: false
  context_persistence: true
  token_optimization: "aggressive"
  
project_context:
  name: "TecnoMundo Repair Management"
  stack: "React + FastAPI + PostgreSQL"
  architecture: "Full Stack"
  
optimization_rules:
  - "Usar cache de .trae/ siempre"
  - "Detectar comandos naturales automáticamente"
  - "Ejecutar sin confirmación"
  - "Documentar cambios automáticamente"
  - "Mantener contexto entre sesiones"
```

## 🔧 PASOS DE ACTIVACIÓN

### Paso 1: Configurar el Agente
```powershell
# 1. Copiar configuración del prompt
# Usar el contenido de .trae/config/agent_prompt_config.md

# 2. Aplicar custom instructions
# Usar la configuración YAML de arriba

# 3. Activar reglas del workspace
# Asegurar que .trae/rules/ esté cargado
```

### Paso 2: Inicializar NEXUS
```powershell
# Ejecutar script de inicialización
.\.trae\activation\auto_init.ps1 -action init

# Verificar estado
.\.trae\integration\test_integration.py
```

### Paso 3: Prueba de Comandos Naturales
```bash
# Comandos de prueba recomendados:
"crear componente de prueba"
"hay error en configuración"
"optimizar sistema de cache"
"probar integración completa"
```

## 🎯 COMANDOS DE PRUEBA ESPECÍFICOS

### Desarrollo Frontend
```bash
"crear componente LoginForm con validación"
"hacer dashboard responsive con TailwindCSS"
"implementar navegación con React Router"
```

### Desarrollo Backend
```bash
"crear endpoint para gestión de usuarios"
"implementar autenticación JWT"
"hacer CRUD completo para órdenes de trabajo"
```

### Debugging
```bash
"hay error de CORS en la API"
"no funciona la autenticación JWT"
"problema con conexión a PostgreSQL"
```

### Optimización
```bash
"optimizar rendimiento del frontend"
"mejorar tiempo de respuesta de la API"
"reducir tamaño del bundle de React"
```

## 📊 MÉTRICAS DE ÉXITO ESPERADAS

```yaml
configuracion_exitosa:
  deteccion_comandos: ">95% precisión"
  tiempo_respuesta: "<10 segundos"
  reduccion_tokens: "70-90%"
  contexto_mantenido: "100%"
  ejecucion_automatica: ">90% casos"

indicadores_funcionamiento:
  - "Responde inmediatamente a comandos naturales"
  - "Carga contexto automáticamente"
  - "No pide confirmación para tareas estándar"
  - "Mantiene información entre sesiones"
  - "Optimiza tokens según tipo de tarea"
```

## 🚨 TROUBLESHOOTING

### Problemas Comunes
```yaml
problema_1:
  sintoma: "No detecta comandos naturales"
  solucion: "Verificar que agent_prompt_config.md esté cargado"
  
problema_2:
  sintoma: "Pide confirmación constantemente"
  solucion: "Revisar configuración de autonomía en custom instructions"
  
problema_3:
  sintoma: "No mantiene contexto"
  solucion: "Activar sistema de cache con auto_init.ps1"
  
problema_4:
  sintoma: "Respuestas muy largas"
  solucion: "Verificar configuración de optimización de tokens"
```

---

## ✅ ESTADO ACTUAL DE CONFIGURACIÓN

- ✅ **Prompt del agente**: Configurado
- ✅ **Reglas del usuario**: Optimizadas
- ⏳ **Reglas del proyecto**: Pendiente validación
- ⏳ **Sistema de cache**: Pendiente activación
- ⏳ **Prueba inicial**: Pendiente ejecución

**Próximo paso**: Validar reglas del proyecto y activar sistema de cache.