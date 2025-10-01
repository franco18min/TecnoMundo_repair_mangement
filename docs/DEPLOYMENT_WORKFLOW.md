# 🚀 Flujo de Despliegue Seguro - TecnoMundo Repair Management

## 📋 Resumen del Flujo

Este documento define el flujo de trabajo para realizar despliegues seguros sin comprometer a los usuarios en producción.

### 🏗️ Arquitectura de Despliegue

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DESARROLLO    │───▶│     STAGING     │───▶│   PRODUCCIÓN    │
│                 │    │                 │    │                 │
│ • Local         │    │ • Render Staging│    │ • Render Prod   │
│ • Testing       │    │ • Firebase Dev  │    │ • Firebase Prod │
│ • Debugging     │    │ • Testing E2E   │    │ • Monitoreo     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Proceso de Despliegue

### Fase 1: Desarrollo Local ✅

1. **Desarrollo y Testing Local**
   ```bash
   # Backend
   cd backend
   venv\Scripts\activate
   uvicorn main:app --reload --port 8001
   
   # Frontend
   cd frontend
   npm run dev
   ```

2. **Verificaciones Obligatorias**
   - [ ] Todos los tests unitarios pasan
   - [ ] No hay errores en consola
   - [ ] Funcionalidades críticas funcionan
   - [ ] Sistema de logging funciona correctamente

### Fase 2: Staging Environment 🧪

#### 2.1 Configuración de Staging

**Backend Staging (Render)**
```yaml
# render.yaml para staging
services:
  - type: web
    name: tecnomundo-backend-staging
    env: staging
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: ENVIRONMENT
        value: staging
      - key: DATABASE_URL
        fromDatabase:
          name: tecnomundo-db-staging
          property: connectionString
```

**Frontend Staging (Firebase)**
```json
// .firebaserc
{
  "projects": {
    "staging": "tecnomundo-staging",
    "production": "tecnomundo-prod"
  },
  "targets": {
    "tecnomundo-staging": {
      "hosting": {
        "staging": ["tecnomundo-staging"]
      }
    }
  }
}
```

#### 2.2 Proceso de Despliegue a Staging

```bash
# 1. Crear rama de staging
git checkout -b staging/v1.x.x

# 2. Desplegar Backend a Staging
# (Automático via webhook de Render)

# 3. Desplegar Frontend a Staging
cd frontend
npm run build:staging
firebase use staging
firebase deploy --only hosting:staging

# 4. Verificar URLs de staging
# Backend: https://tecnomundo-backend-staging.onrender.com
# Frontend: https://tecnomundo-staging.web.app
```

#### 2.3 Testing en Staging

**Tests Automatizados**
```bash
# Tests E2E en staging
npm run test:e2e:staging

# Tests de carga
npm run test:load:staging

# Tests de seguridad
npm run test:security:staging
```

**Checklist Manual de Staging**
- [ ] Login/logout funciona correctamente
- [ ] Creación de órdenes funciona
- [ ] Transferencia de órdenes funciona
- [ ] Notificaciones WebSocket funcionan
- [ ] Sistema de errores captura correctamente
- [ ] Performance es aceptable
- [ ] No hay errores críticos en logs

### Fase 3: Producción 🚀

#### 3.1 Pre-Despliegue

**Checklist Pre-Producción**
- [ ] Staging completamente funcional por 24h mínimo
- [ ] Todos los tests automatizados pasan
- [ ] Performance testing completado
- [ ] Security testing completado
- [ ] Backup de base de datos realizado
- [ ] Plan de rollback preparado
- [ ] Equipo notificado del despliegue

#### 3.2 Despliegue a Producción

```bash
# 1. Crear tag de release
git tag -a v1.x.x -m "Release v1.x.x"
git push origin v1.x.x

# 2. Merge a main
git checkout main
git merge staging/v1.x.x

# 3. Despliegue Backend (Automático)
# Render detecta push a main y despliega automáticamente

# 4. Despliegue Frontend
cd frontend
npm run build:production
firebase use production
firebase deploy --only hosting

# 5. Verificar despliegue
curl -f https://tecnomundo-backend.onrender.com/health
curl -f https://tecnomundo.web.app
```

#### 3.3 Post-Despliegue

**Monitoreo Inmediato (primeros 30 minutos)**
- [ ] Health checks pasan
- [ ] Logs sin errores críticos
- [ ] Métricas de performance normales
- [ ] Funcionalidades críticas funcionan
- [ ] No hay reportes de usuarios

**Monitoreo Extendido (primeras 24 horas)**
- [ ] Monitoreo continuo de errores
- [ ] Análisis de performance
- [ ] Feedback de usuarios
- [ ] Métricas de uso normales

## 🔙 Plan de Rollback

### Rollback Automático

**Triggers de Rollback Automático**
- Error rate > 5% por 5 minutos consecutivos
- Response time > 5 segundos por 10 minutos
- Health check falla por 3 minutos consecutivos

### Rollback Manual

```bash
# 1. Rollback Frontend (inmediato)
firebase hosting:clone tecnomundo:previous tecnomundo:current

# 2. Rollback Backend
# En Render: usar "Rollback" en el dashboard
# O revertir commit:
git revert HEAD
git push origin main

# 3. Notificar al equipo
# Enviar notificación de rollback realizado
```

## 🔧 Configuración de Ambientes

### Variables de Entorno

**Desarrollo**
```env
ENVIRONMENT=development
DATABASE_URL=postgresql://localhost/tecnomundo_dev
FRONTEND_URL=http://localhost:5173
DEBUG=true
```

**Staging**
```env
ENVIRONMENT=staging
DATABASE_URL=postgresql://staging_db_url
FRONTEND_URL=https://tecnomundo-staging.web.app
DEBUG=true
LOG_LEVEL=debug
```

**Producción**
```env
ENVIRONMENT=production
DATABASE_URL=postgresql://prod_db_url
FRONTEND_URL=https://tecnomundo.web.app
DEBUG=false
LOG_LEVEL=info
```

## 📊 Métricas y Monitoreo

### KPIs de Despliegue

- **Success Rate**: > 95%
- **Deployment Time**: < 10 minutos
- **Rollback Time**: < 5 minutos
- **Zero Downtime**: 100%

### Alertas Críticas

1. **Error Rate Alert**
   - Threshold: > 3%
   - Action: Investigar inmediatamente

2. **Performance Alert**
   - Threshold: Response time > 3s
   - Action: Revisar performance

3. **Availability Alert**
   - Threshold: Uptime < 99%
   - Action: Rollback inmediato

## 🛡️ Seguridad en Despliegues

### Checklist de Seguridad

- [ ] Secrets no expuestos en código
- [ ] Variables de entorno configuradas correctamente
- [ ] HTTPS habilitado en todos los ambientes
- [ ] CORS configurado correctamente
- [ ] Rate limiting habilitado
- [ ] Logs no contienen información sensible

### Gestión de Secrets

```bash
# Render Secrets
render secrets set DATABASE_URL "postgresql://..."
render secrets set JWT_SECRET "..."

# Firebase Config
firebase functions:config:set app.secret="..."
```

## 📞 Contactos de Emergencia

### Equipo de Respuesta

- **Tech Lead**: [Contacto]
- **DevOps**: [Contacto]
- **Product Owner**: [Contacto]

### Procedimiento de Emergencia

1. **Detectar problema** (automático o manual)
2. **Evaluar severidad** (crítico/alto/medio/bajo)
3. **Decidir acción** (rollback/hotfix/monitorear)
4. **Ejecutar plan** (según severidad)
5. **Comunicar** (equipo/usuarios si necesario)
6. **Post-mortem** (análisis y mejoras)

## 📝 Logs y Auditoría

### Logs de Despliegue

Todos los despliegues deben registrar:
- Timestamp del despliegue
- Versión desplegada
- Usuario que ejecutó el despliegue
- Resultado del despliegue
- Tiempo de despliegue

### Auditoría de Cambios

- Todos los cambios en producción deben estar en Git
- Cada despliegue debe tener un tag de versión
- Cambios críticos requieren aprobación de 2 personas
- Logs de acceso a sistemas de producción

---

## 🎯 Checklist Rápido de Despliegue

### Pre-Despliegue ✅
- [ ] Tests locales pasan
- [ ] Staging funcional
- [ ] Backup realizado
- [ ] Plan de rollback listo

### Despliegue ✅
- [ ] Backend desplegado
- [ ] Frontend desplegado
- [ ] Health checks pasan
- [ ] Funcionalidades críticas verificadas

### Post-Despliegue ✅
- [ ] Monitoreo activo
- [ ] Logs revisados
- [ ] Performance normal
- [ ] Usuarios no reportan problemas

---

*Última actualización: $(date)*
*Versión del documento: 1.0*