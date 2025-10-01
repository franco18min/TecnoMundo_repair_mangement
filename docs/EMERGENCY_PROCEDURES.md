# 🚨 Procedimientos de Emergencia - TecnoMundo

## 📋 Índice
1. [Contactos de Emergencia](#contactos-de-emergencia)
2. [Clasificación de Incidentes](#clasificación-de-incidentes)
3. [Procedimientos por Tipo de Incidente](#procedimientos-por-tipo-de-incidente)
4. [Rollback de Emergencia](#rollback-de-emergencia)
5. [Comunicación de Crisis](#comunicación-de-crisis)
6. [Post-Mortem](#post-mortem)

## 📞 Contactos de Emergencia

### Equipo Técnico Principal
- **Desarrollador Principal**: +1-XXX-XXX-XXXX
- **DevOps/Infraestructura**: +1-XXX-XXX-XXXX
- **DBA**: +1-XXX-XXX-XXXX

### Servicios Externos
- **Render Support**: support@render.com
- **Firebase Support**: firebase-support@google.com
- **PostgreSQL Cloud**: support@[provider].com

### Canales de Comunicación
- **Slack Emergencias**: #tecnomundo-emergencias
- **Email Crítico**: emergency@tecnomundo.com
- **WhatsApp Grupo**: [Enlace del grupo]

## 🚨 Clasificación de Incidentes

### Severidad 1 (Crítica) - Respuesta: 15 minutos
- **Aplicación completamente inaccesible**
- **Pérdida de datos**
- **Brecha de seguridad**
- **Corrupción de base de datos**

### Severidad 2 (Alta) - Respuesta: 1 hora
- **Funcionalidades principales no funcionan**
- **Performance extremadamente degradada**
- **Errores que afectan >50% de usuarios**

### Severidad 3 (Media) - Respuesta: 4 horas
- **Funcionalidades secundarias no funcionan**
- **Performance degradada**
- **Errores que afectan <50% de usuarios**

### Severidad 4 (Baja) - Respuesta: 24 horas
- **Problemas cosméticos**
- **Funcionalidades menores**
- **Mejoras de performance**

## 🛠️ Procedimientos por Tipo de Incidente

### 1. Aplicación Inaccesible

#### Síntomas
- Error 500/502/503 en frontend
- Timeout de conexión
- DNS no resuelve

#### Pasos Inmediatos
1. **Verificar Status de Servicios**
   ```bash
   # Verificar Render
   curl -I https://tecnomundo-backend.onrender.com/health
   
   # Verificar Firebase
   curl -I https://tecnomundo.web.app
   ```

2. **Revisar Logs**
   ```bash
   # Logs de Render
   render logs --service tecnomundo-backend --tail 100
   
   # Logs de Firebase
   firebase functions:log --limit 100
   ```

3. **Verificar Métricas**
   - Acceder al dashboard de monitoreo
   - Revisar uso de CPU/memoria
   - Verificar tasa de errores

4. **Escalación**
   - Si no se resuelve en 15 minutos → Rollback
   - Notificar al equipo técnico
   - Activar página de mantenimiento

### 2. Base de Datos Inaccesible

#### Síntomas
- Errores de conexión a BD
- Timeouts en queries
- Datos inconsistentes

#### Pasos Inmediatos
1. **Verificar Conexión**
   ```python
   # Test de conexión
   python -c "
   import psycopg2
   try:
       conn = psycopg2.connect('postgresql://...')
       print('Conexión exitosa')
   except Exception as e:
       print(f'Error: {e}')
   "
   ```

2. **Revisar Logs de BD**
   - Acceder al panel del proveedor
   - Revisar logs de PostgreSQL
   - Verificar métricas de performance

3. **Verificar Backups**
   ```bash
   # Listar backups disponibles
   pg_dump --list-backups
   ```

4. **Restauración de Emergencia**
   ```bash
   # Restaurar desde backup más reciente
   pg_restore --clean --if-exists -d tecnomundo backup_YYYYMMDD.sql
   ```

### 3. Brecha de Seguridad

#### Síntomas
- Acceso no autorizado detectado
- Datos sensibles expuestos
- Actividad sospechosa en logs

#### Pasos Inmediatos
1. **Contención Inmediata**
   ```bash
   # Deshabilitar aplicación
   firebase hosting:disable
   
   # Revocar tokens de API
   # (Procedimiento específico según el caso)
   ```

2. **Investigación**
   - Revisar logs de acceso
   - Identificar vector de ataque
   - Documentar evidencia

3. **Comunicación**
   - Notificar a usuarios afectados
   - Reportar a autoridades si es necesario
   - Comunicado público si aplica

4. **Remediación**
   - Cambiar todas las credenciales
   - Aplicar parches de seguridad
   - Implementar medidas adicionales

### 4. Performance Degradada

#### Síntomas
- Tiempos de respuesta >5 segundos
- Timeouts frecuentes
- Quejas de usuarios

#### Pasos Inmediatos
1. **Identificar Bottleneck**
   ```bash
   # Revisar métricas de sistema
   htop
   iotop
   
   # Revisar queries lentas
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   ```

2. **Optimización Rápida**
   ```bash
   # Reiniciar servicios
   render restart --service tecnomundo-backend
   
   # Limpiar cache
   redis-cli FLUSHALL
   ```

3. **Escalado Temporal**
   - Aumentar recursos en Render
   - Activar CDN si no está activo
   - Implementar rate limiting

## 🔄 Rollback de Emergencia

### Rollback Automático
```bash
# Usar script de despliegue
./scripts/deploy.sh rollback
```

### Rollback Manual

#### Frontend (Firebase)
```bash
# Listar versiones
firebase hosting:clone --list

# Rollback a versión anterior
firebase hosting:clone tecnomundo:previous tecnomundo:current
```

#### Backend (Render)
```bash
# Rollback desde panel de Render
# 1. Ir a Dashboard → Service → Deploys
# 2. Seleccionar deploy anterior
# 3. Click en "Redeploy"
```

#### Base de Datos
```bash
# Restaurar backup
pg_restore --clean --if-exists -d tecnomundo backup_pre_deploy.sql

# Verificar integridad
psql -d tecnomundo -c "SELECT COUNT(*) FROM repair_order;"
```

### Verificación Post-Rollback
1. **Health Checks**
   ```bash
   curl https://tecnomundo-backend.onrender.com/health
   curl https://tecnomundo.web.app
   ```

2. **Smoke Tests**
   - Login de usuario
   - Crear orden de prueba
   - Verificar notificaciones

3. **Monitoreo**
   - Revisar métricas por 30 minutos
   - Confirmar estabilidad
   - Notificar resolución

## 📢 Comunicación de Crisis

### Plantillas de Comunicación

#### Para Usuarios (Página de Mantenimiento)
```html
<!DOCTYPE html>
<html>
<head>
    <title>TecnoMundo - Mantenimiento</title>
</head>
<body>
    <h1>🔧 Mantenimiento Programado</h1>
    <p>Estamos trabajando para mejorar tu experiencia.</p>
    <p>Tiempo estimado: [TIEMPO]</p>
    <p>Última actualización: [TIMESTAMP]</p>
</body>
</html>
```

#### Para Stakeholders
```
Asunto: [URGENTE] Incidente en TecnoMundo - [SEVERIDAD]

Estimado equipo,

Hemos detectado un incidente de severidad [SEVERIDAD] en TecnoMundo.

Detalles:
- Hora de inicio: [TIMESTAMP]
- Impacto: [DESCRIPCIÓN]
- Usuarios afectados: [NÚMERO/PORCENTAJE]
- ETA de resolución: [TIEMPO]

Acciones tomadas:
- [ACCIÓN 1]
- [ACCIÓN 2]

Próximos pasos:
- [PASO 1]
- [PASO 2]

Actualizaciones cada 30 minutos.

Equipo TecnoMundo
```

### Canales de Comunicación por Severidad

| Severidad | Slack | Email | WhatsApp | Público |
|-----------|-------|-------|----------|---------|
| 1 (Crítica) | ✅ | ✅ | ✅ | ✅ |
| 2 (Alta) | ✅ | ✅ | ✅ | ❌ |
| 3 (Media) | ✅ | ✅ | ❌ | ❌ |
| 4 (Baja) | ✅ | ❌ | ❌ | ❌ |

## 📊 Post-Mortem

### Plantilla de Post-Mortem

```markdown
# Post-Mortem: [TÍTULO DEL INCIDENTE]

## Resumen
- **Fecha**: [FECHA]
- **Duración**: [TIEMPO]
- **Severidad**: [1-4]
- **Usuarios Afectados**: [NÚMERO]

## Cronología
| Tiempo | Evento |
|--------|--------|
| 14:30 | Primer reporte de error |
| 14:35 | Confirmación del incidente |
| 14:45 | Inicio de investigación |
| 15:00 | Causa raíz identificada |
| 15:15 | Solución implementada |
| 15:30 | Verificación completa |

## Causa Raíz
[Descripción detallada de la causa]

## Impacto
- **Usuarios**: [NÚMERO] usuarios no pudieron [ACCIÓN]
- **Negocio**: [IMPACTO ECONÓMICO]
- **Reputación**: [EVALUACIÓN]

## Resolución
[Descripción de cómo se resolvió]

## Lecciones Aprendidas
1. [LECCIÓN 1]
2. [LECCIÓN 2]
3. [LECCIÓN 3]

## Acciones Preventivas
| Acción | Responsable | Fecha Límite | Estado |
|--------|-------------|--------------|--------|
| [ACCIÓN 1] | [PERSONA] | [FECHA] | Pendiente |
| [ACCIÓN 2] | [PERSONA] | [FECHA] | En Progreso |

## Métricas
- **MTTR** (Mean Time To Recovery): [TIEMPO]
- **MTTD** (Mean Time To Detection): [TIEMPO]
- **Disponibilidad del mes**: [PORCENTAJE]
```

## 🔧 Herramientas de Emergencia

### Scripts de Diagnóstico Rápido
```bash
# Diagnóstico completo
./scripts/emergency-diagnosis.sh

# Verificación de servicios
./scripts/health-check.sh

# Recolección de logs
./scripts/collect-logs.sh
```

### Comandos Útiles
```bash
# Verificar procesos
ps aux | grep python
ps aux | grep node

# Verificar puertos
netstat -tulpn | grep :8001
netstat -tulpn | grep :5173

# Verificar memoria
free -h
df -h

# Verificar logs del sistema
tail -f /var/log/syslog
journalctl -f
```

### URLs de Monitoreo
- **Dashboard Principal**: https://monitoring.tecnomundo.com
- **Render Dashboard**: https://dashboard.render.com
- **Firebase Console**: https://console.firebase.google.com
- **Uptime Monitor**: https://uptimerobot.com

## 📝 Checklist de Emergencia

### ✅ Detección (0-5 minutos)
- [ ] Alerta recibida y confirmada
- [ ] Severidad evaluada
- [ ] Equipo notificado
- [ ] Incident commander asignado

### ✅ Respuesta (5-15 minutos)
- [ ] Investigación inicial completada
- [ ] Causa raíz identificada (si es posible)
- [ ] Decisión de rollback tomada
- [ ] Comunicación inicial enviada

### ✅ Resolución (15-60 minutos)
- [ ] Solución implementada
- [ ] Verificación completada
- [ ] Monitoreo estabilizado
- [ ] Comunicación de resolución enviada

### ✅ Post-Incidente (1-24 horas)
- [ ] Post-mortem programado
- [ ] Documentación actualizada
- [ ] Acciones preventivas definidas
- [ ] Métricas actualizadas

---

**Recuerda**: En caso de duda, siempre es mejor hacer rollback y investigar después. La estabilidad del servicio es la prioridad número uno.