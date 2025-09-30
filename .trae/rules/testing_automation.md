# Scripts de Automatización para Testing - TecnoMundo

## 🤖 Comandos de Automatización para IA

### Inicialización Completa del Proyecto
```markdown
**Comando para IA:** "Inicia el proyecto completo para testing"

**Acciones a realizar:**
1. Verificar que no hay procesos corriendo en puertos 8001 y 5173
2. Navegar a directorio backend y ejecutar:
   - `venv\Scripts\activate`
   - `uvicorn main:app --reload --port 8001`
3. Navegar a directorio frontend y ejecutar:
   - `npm run dev`
4. Esperar 5 segundos para que ambos servicios inicien
5. Verificar conectividad:
   - GET http://localhost:8001/docs (debe responder 200)
   - GET http://localhost:5173 (debe responder 200)
6. Abrir preview en http://localhost:5173
```

### Testing de Autenticación
```markdown
**Comando para IA:** "Prueba el login completo"

**Acciones a realizar:**
1. Abrir http://localhost:5173
2. Localizar formulario de login
3. Ingresar credenciales:
   - Username: admin
   - Password: admin123
4. Hacer clic en botón de login
5. Verificar redirección a dashboard
6. Verificar que aparece nombre de usuario en header
7. Verificar acceso a menú de navegación
```

### Testing de Gestión de Órdenes
```markdown
**Comando para IA:** "Prueba la gestión completa de órdenes"

**Acciones a realizar:**
1. Asegurar que usuario está logueado como admin
2. Navegar a sección "Órdenes"
3. Verificar que se cargan las órdenes existentes
4. Hacer clic en "Nueva Orden"
5. Completar formulario con datos de prueba:
   - Cliente: "Juan Pérez Test"
   - Teléfono: "123456789"
   - DNI: "12345678"
   - Dispositivo: "Smartphone"
   - Modelo: "iPhone 13"
   - Problema: "Pantalla rota - Test automático"
6. Guardar orden
7. Verificar que aparece en la lista
8. Abrir orden creada
9. Cambiar estado a "En Proceso"
10. Agregar notas del técnico
11. Guardar cambios
```

### Testing de Transferencia de Órdenes
```markdown
**Comando para IA:** "Prueba la transferencia de órdenes"

**Acciones a realizar:**
1. Asegurar que usuario está logueado como admin
2. Navegar a "Configuración" → "Transferencia de Órdenes"
3. Verificar que se cargan las órdenes transferibles
4. Seleccionar una orden con estado "Pending" o "Completed"
5. Seleccionar sucursal destino diferente a la actual
6. Agregar motivo: "Transferencia de prueba automática"
7. Confirmar transferencia
8. Verificar mensaje de éxito
9. Verificar que la orden cambió de sucursal
```

### Testing de Notificaciones WebSocket
```markdown
**Comando para IA:** "Prueba las notificaciones en tiempo real"

**Acciones a realizar:**
1. Abrir dos pestañas del navegador en http://localhost:5173
2. Loguear en ambas con usuarios diferentes:
   - Pestaña 1: admin/admin123
   - Pestaña 2: tecnico1/tecnico123
3. En pestaña 1, crear una nueva orden
4. Verificar que en pestaña 2 aparece notificación
5. En pestaña 2, actualizar estado de una orden
6. Verificar que en pestaña 1 aparece notificación
7. Verificar contador de notificaciones no leídas
```

## 🔍 Verificaciones de Estado

### Verificación de Servicios Activos
```markdown
**Comando para IA:** "Verifica que todos los servicios estén corriendo"

**Acciones a realizar:**
1. Ejecutar: `netstat -an | findstr :8001`
   - Debe mostrar: "LISTENING" en puerto 8001
2. Ejecutar: `netstat -an | findstr :5173`
   - Debe mostrar: "LISTENING" en puerto 5173
3. Hacer GET a http://localhost:8001/docs
   - Debe responder con código 200
4. Hacer GET a http://localhost:5173
   - Debe responder con código 200
5. Verificar logs de consola en frontend (F12)
   - No debe haber errores críticos
```

### Verificación de Base de Datos
```markdown
**Comando para IA:** "Verifica la conectividad de la base de datos"

**Acciones a realizar:**
1. Hacer GET a http://localhost:8001/api/v1/repair-orders/
   - Debe responder con lista de órdenes (puede estar vacía)
2. Hacer GET a http://localhost:8001/api/v1/branches/
   - Debe responder con lista de sucursales
3. Hacer GET a http://localhost:8001/api/v1/users/me (con token)
   - Debe responder con datos del usuario actual
```

## 🧹 Comandos de Limpieza

### Cleanup Completo
```markdown
**Comando para IA:** "Limpia y reinicia el entorno de testing"

**Acciones a realizar:**
1. Detener todos los procesos en puertos 8001 y 5173
2. Limpiar caché del navegador
3. Reiniciar servicios backend y frontend
4. Verificar que todo funciona correctamente
```

## 📋 Checklist de Testing Completo

### ✅ Lista de Verificación
- [ ] Backend iniciado en puerto 8001
- [ ] Frontend iniciado en puerto 5173
- [ ] Login exitoso con admin/admin123
- [ ] Navegación entre secciones funciona
- [ ] Carga de órdenes existentes
- [ ] Creación de nueva orden
- [ ] Actualización de estado de orden
- [ ] Transferencia de orden entre sucursales
- [ ] Notificaciones WebSocket funcionando
- [ ] Logout exitoso
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend

## 🚨 Solución de Problemas Comunes

### Error: Puerto ya en uso
```bash
# Encontrar proceso usando el puerto
netstat -ano | findstr :8001
# Terminar proceso (reemplazar PID)
taskkill /PID <PID> /F
```

### Error: Base de datos no conecta
```bash
# Verificar que PostgreSQL está corriendo
# Ejecutar script de creación de usuario
cd backend
python scripts/create_user.py
```

### Error: Frontend no carga
```bash
# Limpiar caché y reinstalar dependencias
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📊 Métricas de Testing

### Tiempos Esperados
- Inicio de backend: ~3-5 segundos
- Inicio de frontend: ~2-3 segundos
- Login: ~1-2 segundos
- Carga de órdenes: ~1-3 segundos
- Creación de orden: ~2-4 segundos
- Transferencia de orden: ~2-3 segundos

### Criterios de Éxito
- Todos los servicios responden en menos de 5 segundos
- No hay errores 500 en el backend
- No hay errores JavaScript en el frontend
- Todas las funcionalidades principales funcionan
- WebSocket mantiene conexión estable