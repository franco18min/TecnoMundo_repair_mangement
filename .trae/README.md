# 🚀 Sistema .trae para TecnoMundo Repair Management

## 📋 Descripción General

Este sistema de contexto inteligente está diseñado específicamente para **Trae 2.0**, proporcionando un agente de IA autónomo (**NEXUS**) que aprovecha todas las capacidades avanzadas del IDE para trabajar con repositorios fullstack React + FastAPI + PostgreSQL.

## 🏗️ Estructura del Sistema

```
.trae/
├── rules/                   # Reglas del proyecto y usuario
│   ├── project_rules.yaml   # Configuración específica del proyecto
│   └── user_rules.yaml      # Preferencias y reglas del usuario
├── cache/                   # Sistema de caché contextual
│   └── context_cache.json   # Caché optimizado para reducción de tokens
├── maps/                    # Mapeos inteligentes del proyecto
│   ├── backend_map.json     # Estructura y patrones del backend
│   ├── frontend_map.json    # Estructura y patrones del frontend
│   └── database_map.json    # Esquema y relaciones de la BD
├── prompts/                 # Prompts del agente
│   └── nexus_agent_prompt.md # Prompt completo del agente NEXUS
├── config/                  # Configuraciones especiales
│   ├── mcp_config.yaml      # Configuración MCP para PostgreSQL
│   └── natural_commands.yaml # Sistema de comandos naturales
└── README.md               # Esta documentación
```

## 🤖 Agente NEXUS

**NEXUS** (Neural EXpert Universal System) es el agente de IA autónomo que:

### ✨ Características Principales
- **Idioma**: Español obligatorio para todas las interacciones
- **Ejecución**: Inmediata sin confirmación para tareas estándar
- **Contexto**: Carga automática desde `.trae/cache/`
- **Optimización**: Reducción de tokens del 70-90%

### 🧠 Comandos Naturales Detectados Automáticamente
- `"crear/hacer/generar [componente/funcionalidad]"`
- `"hay/tengo error/problema en [área]"`
- `"necesito/quiero [funcionalidad]"`
- `"optimizar/mejorar [sistema]"`
- `"probar/testear [funcionalidad]"`
- `"documentar [componente]"`

### 🔧 Capacidades Trae 2.0 Integradas
- ✅ Búsqueda semántica de código
- ✅ Edición inteligente de archivos
- ✅ Gestión completa de archivos y directorios
- ✅ Ejecución de comandos en terminales múltiples
- ✅ Acceso directo a PostgreSQL via MCP
- ✅ Gestión automática de tareas
- ✅ Vista previa de cambios visuales

## 📊 Sistema de Mapeos Inteligentes

### Backend Map (`backend_map.json`)
Mapea la estructura completa del backend FastAPI:
- **API Endpoints**: Rutas y controladores
- **Modelos**: Entidades SQLAlchemy con relaciones
- **Schemas**: Validación Pydantic
- **CRUD Operations**: Operaciones de base de datos
- **Servicios**: Lógica de negocio
- **Core Modules**: Configuración, seguridad, logging

### Frontend Map (`frontend_map.json`)
Mapea la estructura completa del frontend React:
- **Componentes**: Organización por funcionalidad
- **Páginas**: Rutas principales de la aplicación
- **API Layer**: Servicios de comunicación con backend
- **Context**: Gestión de estado global
- **Hooks**: Lógica reutilizable
- **Utils**: Utilidades y helpers

### Database Map (`database_map.json`)
Mapea el esquema completo de PostgreSQL:
- **Tablas**: Estructura, relaciones, índices
- **Vistas**: Consultas precompiladas
- **Procedimientos**: Lógica almacenada
- **Migraciones**: Historial de cambios
- **Integración MCP**: Consultas comunes

## 🔌 Integración MCP (Model Context Protocol)

### Configuración PostgreSQL
- **Archivo**: `.trae/config/mcp_config.yaml`
- **Capacidades**: Consultas SQL directas, análisis de esquema
- **Seguridad**: Operaciones controladas y auditadas
- **Performance**: Consultas optimizadas y cacheadas

### Consultas Predefinidas
```sql
-- Estadísticas de órdenes
SELECT status, COUNT(*) FROM repair_orders GROUP BY status;

-- Historial de cliente
SELECT * FROM repair_orders WHERE customer_id = $1 ORDER BY created_at DESC;

-- Órdenes pendientes
SELECT * FROM repair_orders WHERE status IN ('pending', 'in_progress');
```

## 💾 Sistema de Caché Contextual

### Optimización de Tokens
- **Objetivo**: Reducción 70-90% de tokens por petición
- **Método**: Caché inteligente en lugar de archivos completos
- **Actualización**: Automática después de cada cambio
- **Limpieza**: Automática de contexto obsoleto

### Plantillas de Contexto
- **Frontend Component Creation**: Para crear componentes React
- **Error Debugging**: Para resolución de problemas
- **Feature Implementation**: Para nuevas funcionalidades
- **Performance Optimization**: Para mejoras de rendimiento
- **Testing Setup**: Para configuración de pruebas

## 🗣️ Sistema de Comandos Naturales

### Detección Automática
El sistema detecta automáticamente patrones en español:

#### 🔨 Creación y Desarrollo
- **Patrón**: `"crear {tipo} para {propósito}"`
- **Acción**: Crear componente React o endpoint FastAPI
- **Contexto**: Cargar mapeos relevantes
- **Ejecución**: Inmediata con patrones del proyecto

#### 🐛 Debugging
- **Patrón**: `"hay error en {área}"`
- **Acción**: Análisis automático de logs y código
- **Contexto**: Cargar todos los mapeos + logs de error
- **Ejecución**: Diagnóstico y solución inmediata

#### ⚡ Optimización
- **Patrón**: `"optimizar {sistema}"`
- **Acción**: Análisis de performance y mejoras
- **Contexto**: Cargar métricas y patrones
- **Ejecución**: Optimización automática

## 🚀 Cómo Usar el Sistema

### 1. Activación Automática
El agente NEXUS se activa automáticamente al detectar comandos naturales en español. No requiere prefijos especiales.

### 2. Ejemplos de Uso

#### Crear Componente
```
Usuario: "crear componente para gestión de clientes"
NEXUS: [Carga frontend_map.json] → [Crea componente en src/components/clients/] → [Actualiza mapeos]
```

#### Resolver Error
```
Usuario: "hay error en la autenticación"
NEXUS: [Carga logs + mapeos] → [Analiza flujo JWT] → [Implementa solución] → [Verifica fix]
```

#### Optimizar Performance
```
Usuario: "optimizar consultas de base de datos"
NEXUS: [Usa MCP] → [Analiza queries] → [Implementa optimizaciones] → [Mide mejoras]
```

### 3. Flujo Automático
Para cada interacción:
1. **DETECTAR** intención automáticamente
2. **CARGAR** contexto desde `.trae/cache/`
3. **EJECUTAR** acción inmediatamente
4. **ACTUALIZAR** mapeos automáticamente
5. **DOCUMENTAR** cambios realizados

## 📈 Métricas y Optimización

### Objetivos de Performance
- ⚡ **Tiempo de respuesta**: <30 segundos
- 🎯 **Cache hit rate**: >80%
- 🔧 **Errores auto-resueltos**: >70%
- 💾 **Reducción de tokens**: 70-90%

### Monitoreo Automático
- Tracking de patrones de uso más frecuentes
- Optimización continua de contexto
- Actualización automática de mapeos
- Limpieza automática de caché obsoleto

## 🛡️ Seguridad y Mejores Prácticas

### Validaciones Automáticas
- Verificación de contexto antes de ejecutar
- Backup automático para cambios críticos
- Rollback disponible para errores
- Auditoría de operaciones sensibles

### Calidad de Código
- Consistencia con patrones existentes
- Documentación automática y concisa
- Testing automático cuando sea posible
- Seguridad por defecto en implementaciones

## 🔄 Mantenimiento del Sistema

### Actualización Automática
El sistema se actualiza automáticamente cuando:
- Se crean nuevos archivos
- Se modifican archivos existentes
- Se detectan nuevos patrones de comando
- Se resuelven errores
- Cambia el contexto de trabajo

### Limpieza Automática
- Eliminación de caché obsoleto
- Optimización de mapeos no utilizados
- Compresión de logs antiguos
- Actualización de métricas de performance

## 🎯 Casos de Uso Específicos

### Desarrollo Frontend (React)
- Crear componentes con hooks y TailwindCSS
- Implementar rutas y navegación
- Gestionar estado con Context API
- Integrar con APIs del backend

### Desarrollo Backend (FastAPI)
- Crear endpoints REST con validación
- Implementar modelos SQLAlchemy
- Configurar autenticación JWT
- Optimizar consultas de base de datos

### Debugging y Mantenimiento
- Análisis automático de logs de error
- Diagnóstico de problemas de performance
- Resolución de conflictos de dependencias
- Optimización de consultas SQL

### Testing y Calidad
- Configuración automática de testing
- Creación de tests unitarios y de integración
- Validación de cobertura de código
- Testing de performance y seguridad

## 📞 Soporte y Extensión

### Personalización
El sistema puede personalizarse modificando:
- **Reglas del usuario**: `.trae/rules/user_rules.yaml`
- **Patrones de comando**: `.trae/config/natural_commands.yaml`
- **Configuración MCP**: `.trae/config/mcp_config.yaml`
- **Plantillas de contexto**: `.trae/cache/context_cache.json`

### Extensión
Para agregar nuevas funcionalidades:
1. Actualizar mapeos relevantes en `.trae/maps/`
2. Agregar patrones de comando en `.trae/config/natural_commands.yaml`
3. Crear plantillas de contexto en `.trae/cache/context_cache.json`
4. Actualizar el prompt del agente si es necesario

---

**Sistema .trae v1.0 - Optimizado para TecnoMundo Repair Management**  
**Powered by Trae 2.0 Advanced IDE**