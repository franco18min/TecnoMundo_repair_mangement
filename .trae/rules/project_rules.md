# Reglas de Configuración para TecnoMundo Repair Management

## 🚀 Comandos de Inicio de Servidores

### Backend (Puerto 8001)
```bash
# Activar entorno virtual y iniciar backend
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8001
```

### Frontend (Puerto 5173)
```bash
# Iniciar servidor de desarrollo frontend
cd frontend
npm run dev
```

## 🔐 Credenciales de Prueba

### Usuario Administrador
- **Username:** admin
- **Password:** admin123
- **Email:** admin@tecnomundo.com
- **Rol:** Administrator
- **Sucursal:** Todas las sucursales

### Usuario Técnico
- **Username:** tecnico1
- **Password:** tecnico123
- **Email:** tecnico1@tecnomundo.com
- **Rol:** Technician
- **Sucursal:** Sucursal Principal

## 🧪 Flujos de Prueba Principales

### 1. Autenticación
- Iniciar sesión con credenciales de administrador
- Verificar acceso a todas las secciones
- Probar logout y re-login

### 2. Gestión de Órdenes
- Crear nueva orden de reparación
- Asignar técnico a la orden
- Actualizar estado de la orden
- Transferir orden entre sucursales
- Completar orden y marcar como entregada

### 3. Configuración del Sistema
- Acceder a sección de configuración (solo admin)
- Probar transferencia de órdenes
- Verificar gestión de sucursales
- Probar gestión de usuarios

### 4. Notificaciones en Tiempo Real
- Crear/actualizar orden y verificar notificaciones WebSocket
- Probar notificaciones entre diferentes usuarios
- Verificar persistencia de notificaciones

## 📊 Datos de Prueba Esperados

### Estados de Órdenes
- Pending (Pendiente)
- In Process (En Proceso)
- Completed (Completada)
- Delivered (Entregada)
- Cancelled (Cancelada)

### Tipos de Dispositivos
- Smartphone
- Tablet
- Laptop
- Desktop
- Gaming Console

### Sucursales
- Sucursal Principal
- Sucursal Norte
- Sucursal Sur

## 🔧 Configuración de Testing Automático

### Verificaciones Obligatorias
1. **Conectividad Backend:** Verificar que http://localhost:8001/docs responda
2. **Conectividad Frontend:** Verificar que http://localhost:5173 responda
3. **Base de Datos:** Verificar conexión a PostgreSQL
4. **WebSocket:** Verificar conexión WebSocket en http://localhost:8001/ws

### Secuencia de Testing Completo
1. Iniciar backend (puerto 8001)
2. Iniciar frontend (puerto 5173)
3. Verificar conectividad de ambos servicios
4. Realizar login con usuario administrador
5. Navegar a sección de órdenes
6. Crear orden de prueba
7. Navegar a configuración
8. Probar transferencia de órdenes
9. Verificar notificaciones en tiempo real
10. Logout y cleanup

## 🛠️ Comandos de Utilidad

### Verificar Estado de Servicios
```bash
# Verificar si backend está corriendo
netstat -an | findstr :8001

# Verificar si frontend está corriendo  
netstat -an | findstr :5173
```

### Reset de Base de Datos (si es necesario)
```bash
# Ejecutar desde directorio backend
python scripts/create_user.py
```

## 📝 Notas Importantes

- Todas las tareas y órdenes deben ser escritas en español
- El sistema utiliza autenticación JWT
- Las notificaciones funcionan vía WebSocket
- La base de datos tiene dos schemas: `customer` y `system`
- El frontend utiliza React + Vite + TailwindCSS
- El backend utiliza FastAPI + SQLAlchemy + PostgreSQL

## 🎯 URLs de Testing

- **Backend API:** http://localhost:8001
- **Backend Docs:** http://localhost:8001/docs
- **Frontend:** http://localhost:5173
- **WebSocket:** ws://localhost:8001/ws