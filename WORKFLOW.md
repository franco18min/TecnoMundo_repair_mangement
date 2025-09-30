# 🚀 Flujo de Trabajo Profesional - TecnoMundo Repair Management

## 📋 Resumen del Problema Actual

**Error CORS:** El backend en Render tiene la configuración antigua y no permite solicitudes desde Firebase.

**Solución:** Redesplegar el backend con la nueva configuración de CORS.

---

## 🔄 Flujo de Trabajo para Aplicaciones en Producción

### 1. **Estrategia de Ramas (Git Flow)**

```
main (producción)     ←── Solo código estable y probado
├── develop           ←── Rama de desarrollo principal
├── feature/nueva-funcionalidad
├── hotfix/correccion-urgente
└── release/v1.2.0
```

### 2. **Proceso de Desarrollo Diario**

#### Para Nuevas Funcionalidades:
```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad

# 2. Desarrollar y probar localmente
# ... hacer cambios ...
npm run test  # frontend
pytest        # backend

# 3. Commit y push
git add .
git commit -m "feat: descripción de la funcionalidad"
git push origin feature/nombre-funcionalidad

# 4. Crear Pull Request a develop
# 5. Después de revisión, merge a develop
# 6. Deploy a staging para pruebas
# 7. Si todo OK, merge develop → main
# 8. Deploy automático a producción
```

#### Para Correcciones Urgentes (Hotfix):
```bash
# 1. Crear rama desde main
git checkout main
git pull origin main
git checkout -b hotfix/descripcion-problema

# 2. Corregir el problema
# ... hacer cambios mínimos ...

# 3. Commit y push
git add .
git commit -m "fix: corrección urgente de X"
git push origin hotfix/descripcion-problema

# 4. Merge directo a main Y develop
# 5. Deploy inmediato a producción
```

---

## 🚀 Proceso de Despliegue

### **Backend (Render)**

#### Despliegue Manual:
```bash
# 1. Hacer push a la rama main
git push origin main

# 2. En Render, el deploy es automático desde GitHub
# 3. Verificar logs en Render Dashboard
# 4. Probar endpoints críticos
```

#### Verificación Post-Deploy:
```bash
# Probar endpoint de salud
curl https://tecnomundo-repair-mangement.onrender.com/

# Probar autenticación
curl -X POST https://tecnomundo-repair-mangement.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### **Frontend (Firebase)**

```bash
# 1. Construir para producción
cd frontend
npm run build

# 2. Desplegar a Firebase
firebase deploy

# 3. Verificar en https://tecnomundo-repair-mangement.web.app
```

---

## 🛡️ Estrategias para Minimizar Downtime

### **1. Blue-Green Deployment**
- Mantener dos versiones: actual (blue) y nueva (green)
- Cambiar tráfico solo cuando green esté 100% funcional

### **2. Rolling Updates**
- Actualizar instancias gradualmente
- Siempre mantener instancias funcionando

### **3. Feature Flags**
```javascript
// Ejemplo en frontend
const FEATURE_FLAGS = {
  newOrderFlow: import.meta.env.VITE_ENABLE_NEW_ORDER_FLOW === 'true',
  advancedReports: import.meta.env.VITE_ENABLE_ADVANCED_REPORTS === 'true'
};

// Usar en componentes
if (FEATURE_FLAGS.newOrderFlow) {
  return <NewOrderComponent />;
} else {
  return <LegacyOrderComponent />;
}
```

### **4. Database Migrations**
```python
# Siempre hacer migraciones compatibles hacia atrás
# ✅ BUENO: Agregar columna opcional
ALTER TABLE repair_order ADD COLUMN new_field VARCHAR(255) NULL;

# ❌ MALO: Eliminar columna (rompe versión anterior)
ALTER TABLE repair_order DROP COLUMN old_field;
```

---

## 📊 Monitoreo y Alertas

### **Métricas Críticas a Monitorear:**
- ✅ Tiempo de respuesta de API
- ✅ Tasa de errores 4xx/5xx
- ✅ Conexiones WebSocket activas
- ✅ Uso de memoria/CPU
- ✅ Disponibilidad de base de datos

### **Herramientas Recomendadas:**
- **Render:** Logs y métricas integradas
- **Firebase:** Analytics y Performance Monitoring
- **Sentry:** Tracking de errores
- **UptimeRobot:** Monitoreo de disponibilidad

---

## 🔧 Comandos de Emergencia

### **Rollback Rápido (Backend):**
```bash
# En Render Dashboard:
# 1. Ir a "Deploys"
# 2. Seleccionar deploy anterior estable
# 3. Click "Redeploy"
```

### **Rollback Rápido (Frontend):**
```bash
# Volver a versión anterior
git checkout main~1  # versión anterior
cd frontend
npm run build
firebase deploy
```

### **Verificación de Salud del Sistema:**
```bash
# Script de verificación completa
curl -f https://tecnomundo-repair-mangement.onrender.com/ || echo "❌ Backend DOWN"
curl -f https://tecnomundo-repair-mangement.web.app/ || echo "❌ Frontend DOWN"
```

---

## 📝 Checklist Pre-Deploy

### **Backend:**
- [ ] Tests pasan localmente
- [ ] Variables de entorno actualizadas
- [ ] Migraciones de DB compatibles
- [ ] Logs de errores revisados
- [ ] Endpoints críticos probados

### **Frontend:**
- [ ] Build de producción exitoso
- [ ] Variables de entorno correctas
- [ ] Funcionalidades críticas probadas
- [ ] Performance optimizada
- [ ] Compatibilidad de navegadores

---

## 🚨 Plan de Contingencia

### **Si algo sale mal:**

1. **Identificar el problema** (logs, métricas)
2. **Evaluar impacto** (¿afecta a todos los usuarios?)
3. **Decidir acción:**
   - **Problema menor:** Fix forward (corregir y redesplegar)
   - **Problema crítico:** Rollback inmediato
4. **Comunicar** (si es necesario, notificar a usuarios)
5. **Post-mortem** (analizar qué pasó y cómo prevenir)

---

## 📞 Contactos de Emergencia

- **Render Support:** [render.com/support](https://render.com/support)
- **Firebase Support:** [firebase.google.com/support](https://firebase.google.com/support)
- **Database Provider:** [Supabase/PostgreSQL support]

---

## 🎯 Próximos Pasos Inmediatos

1. **Hacer push de los cambios de CORS**
2. **Verificar que Render redespliegue automáticamente**
3. **Probar la aplicación desde Firebase**
4. **Configurar monitoreo básico**
5. **Documentar cualquier configuración específica de producción**