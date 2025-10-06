# 🤖 Guía MCP para Jules - TecnoMundo Repair Management

## 🎯 Resumen Ejecutivo

**Jules**, este proyecto está configurado para usar **MCP (Model Context Protocol) de Supabase** para todas las consultas de base de datos. **NO uses credenciales directas de PostgreSQL**.

## ⚡ Configuración MCP Activa

### 📁 Archivo de Configuración
- **Ubicación**: `.kilocode/mcp.json`
- **Servidor**: `@supabase/mcp-server-postgrest@0.0.11`
- **Schemas disponibles**: `system`, `customer`

### 🔧 Funciones MCP Disponibles

1. **`mcp_Postgrest_postgrestRequest`**
   - Para consultas HTTP directas a la API
   - Métodos: GET, POST, PUT, PATCH, DELETE

2. **`mcp_Postgrest_sqlToRest`**
   - Para convertir SQL a requests REST
   - Útil para consultas complejas

## 🗂️ Estructura de Base de Datos

### Schema: `system`
```
├── roles (id, role_name)
├── user (id, username, password, email, role_id)
├── notifications (id, user_id, message, is_read, link_to, created_at)
└── branch (id, name, address, phone)
```

### Schema: `customer`
```
├── customer (id, first_name, last_name, phone_number, dni)
├── status_order (id, status_name)
├── device_type (id, type_name)
├── repair_order (id, customer_id, device_type_id, status_id, technician_id, branch_id, description, created_at, updated_at)
└── device_condition (id, order_id, check_description, client_answer, technician_finding, technician_notes)
```

## 📋 Ejemplos Prácticos de Uso

### 🔍 Consultas de Lectura

```javascript
// Obtener todas las órdenes de reparación
mcp_Postgrest_postgrestRequest({
  method: "GET",
  path: "/repair_order"
})

// Obtener orden específica con detalles del cliente
mcp_Postgrest_postgrestRequest({
  method: "GET",
  path: "/repair_order?id=eq.1&select=*,customer(*),device_type(*),status_order(*)"
})

// Obtener órdenes pendientes
mcp_Postgrest_postgrestRequest({
  method: "GET",
  path: "/repair_order?status_id=eq.1"
})

// Obtener usuarios por rol
mcp_Postgrest_postgrestRequest({
  method: "GET",
  path: "/user?role_id=eq.3&select=*,roles(*)"
})
```

### ✏️ Operaciones de Escritura

```javascript
// Crear nueva orden de reparación
mcp_Postgrest_postgrestRequest({
  method: "POST",
  path: "/repair_order",
  body: {
    customer_id: 1,
    device_type_id: 2,
    status_id: 1,
    technician_id: 3,
    branch_id: 1,
    description: "Pantalla rota, necesita reemplazo"
  }
})

// Actualizar estado de orden
mcp_Postgrest_postgrestRequest({
  method: "PATCH",
  path: "/repair_order?id=eq.1",
  body: {
    status_id: 2,
    updated_at: new Date().toISOString()
  }
})

// Crear notificación
mcp_Postgrest_postgrestRequest({
  method: "POST",
  path: "/notifications",
  body: {
    user_id: 1,
    message: "Nueva orden asignada",
    is_read: false,
    link_to: "/orders/1"
  }
})
```

### 🔄 Consultas con SQL Convertido

```javascript
// Convertir SQL complejo a REST
mcp_Postgrest_sqlToRest({
  sql: `
    SELECT ro.*, c.first_name, c.last_name, dt.type_name, so.status_name
    FROM repair_order ro
    JOIN customer c ON ro.customer_id = c.id
    JOIN device_type dt ON ro.device_type_id = dt.id
    JOIN status_order so ON ro.status_id = so.id
    WHERE ro.created_at >= '2024-01-01'
    ORDER BY ro.created_at DESC
  `
})
```

## 🚨 Reglas Importantes

### ✅ SÍ Hacer
- ✅ Usar siempre funciones MCP para consultas
- ✅ Especificar el schema correcto en las rutas
- ✅ Usar sintaxis PostgREST para filtros
- ✅ Manejar relaciones con `select=*,tabla_relacionada(*)`

### ❌ NO Hacer
- ❌ Usar credenciales de PostgreSQL directas
- ❌ Usar `DATABASE_URL` en el código
- ❌ Hacer conexiones directas a la base de datos
- ❌ Ignorar la configuración MCP

## 🔗 Sintaxis PostgREST Útil

### Filtros Comunes
```
?id=eq.1                    # Igual a 1
?status_id=in.(1,2,3)       # En lista
?created_at=gte.2024-01-01  # Mayor o igual
?name=ilike.*tech*          # Contiene "tech" (case insensitive)
```

### Ordenamiento y Límites
```
?order=created_at.desc      # Ordenar descendente
?limit=10                   # Limitar resultados
?offset=20                  # Saltar registros
```

### Relaciones
```
?select=*,customer(*)       # Incluir datos del cliente
?select=id,name,orders(*)   # Solo campos específicos
```

## 🛠️ Servicios Disponibles

El proyecto incluye `MCPService` en `backend/app/services/mcp_service.py` que proporciona:

- `get_database_info()`: Información de la estructura
- `get_table_structure(schema, table)`: Detalles de tablas
- `get_mcp_instructions()`: Instrucciones de uso

## 🎯 Flujo de Trabajo Recomendado

1. **Identificar la operación** (lectura/escritura)
2. **Determinar el schema** (system/customer)
3. **Construir la ruta PostgREST**
4. **Usar la función MCP apropiada**
5. **Manejar la respuesta**

## 📞 Soporte

Si necesitas ayuda con consultas específicas, consulta:
- Esta guía para ejemplos
- `MCPService` para métodos auxiliares
- Documentación de PostgREST para sintaxis avanzada

---

**Recuerda**: Siempre usa MCP, nunca conexiones directas. ¡El sistema está optimizado para esto! 🚀