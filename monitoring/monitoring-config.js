// 📊 Configuración de Monitoreo - TecnoMundo
// Sistema de monitoreo y alertas para detectar errores en producción

const MONITORING_CONFIG = {
  // Configuración de alertas
  alerts: {
    email: {
      enabled: true,
      recipients: [
        'admin@tecnomundo.com',
        'dev@tecnomundo.com'
      ],
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    },
    slack: {
      enabled: true,
      webhook: process.env.SLACK_WEBHOOK_URL,
      channel: '#tecnomundo-alerts'
    },
    discord: {
      enabled: false,
      webhook: process.env.DISCORD_WEBHOOK_URL
    }
  },

  // Umbrales de alerta
  thresholds: {
    errorRate: {
      warning: 5,    // 5% de errores
      critical: 10   // 10% de errores
    },
    responseTime: {
      warning: 2000,   // 2 segundos
      critical: 5000   // 5 segundos
    },
    memoryUsage: {
      warning: 80,     // 80% de memoria
      critical: 90     // 90% de memoria
    },
    cpuUsage: {
      warning: 70,     // 70% de CPU
      critical: 85     // 85% de CPU
    },
    diskSpace: {
      warning: 80,     // 80% de disco
      critical: 90     // 90% de disco
    }
  },

  // Configuración de métricas
  metrics: {
    collection: {
      interval: 60000,  // 1 minuto
      retention: 7 * 24 * 60 * 60 * 1000  // 7 días
    },
    endpoints: [
      '/api/orders',
      '/api/customers',
      '/api/auth/login',
      '/api/users',
      '/api/config'
    ]
  },

  // Configuración de logs
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    maxFiles: 10,
    maxSize: '10m',
    format: 'json'
  },

  // Configuración de health checks
  healthChecks: {
    interval: 30000,  // 30 segundos
    timeout: 5000,    // 5 segundos
    endpoints: {
      backend: process.env.BACKEND_URL || 'http://localhost:8001',
      database: true,
      redis: false,
      external: [
        'https://api.firebase.com',
        'https://render.com'
      ]
    }
  }
};

// 🚨 Sistema de Alertas
class AlertManager {
  constructor(config) {
    this.config = config;
    this.alertHistory = new Map();
    this.cooldownPeriod = 5 * 60 * 1000; // 5 minutos
  }

  async sendAlert(type, severity, message, details = {}) {
    const alertKey = `${type}-${severity}`;
    const now = Date.now();
    
    // Verificar cooldown para evitar spam
    if (this.alertHistory.has(alertKey)) {
      const lastAlert = this.alertHistory.get(alertKey);
      if (now - lastAlert < this.cooldownPeriod) {
        return; // Skip alert due to cooldown
      }
    }

    this.alertHistory.set(alertKey, now);

    const alert = {
      timestamp: new Date().toISOString(),
      type,
      severity,
      message,
      details,
      environment: process.env.NODE_ENV || 'development',
      service: 'TecnoMundo'
    };

    // Enviar por email
    if (this.config.alerts.email.enabled) {
      await this.sendEmailAlert(alert);
    }

    // Enviar por Slack
    if (this.config.alerts.slack.enabled) {
      await this.sendSlackAlert(alert);
    }

    // Enviar por Discord
    if (this.config.alerts.discord.enabled) {
      await this.sendDiscordAlert(alert);
    }

    console.error('🚨 ALERT SENT:', alert);
  }

  async sendEmailAlert(alert) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter(this.config.alerts.email.smtp);

      const subject = `🚨 TecnoMundo Alert - ${alert.severity.toUpperCase()}: ${alert.type}`;
      const html = `
        <h2>🚨 TecnoMundo Alert</h2>
        <p><strong>Severity:</strong> ${alert.severity}</p>
        <p><strong>Type:</strong> ${alert.type}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Environment:</strong> ${alert.environment}</p>
        <p><strong>Timestamp:</strong> ${alert.timestamp}</p>
        <h3>Details:</h3>
        <pre>${JSON.stringify(alert.details, null, 2)}</pre>
      `;

      await transporter.sendMail({
        from: this.config.alerts.email.smtp.auth.user,
        to: this.config.alerts.email.recipients.join(','),
        subject,
        html
      });
    } catch (error) {
      console.error('Error sending email alert:', error);
    }
  }

  async sendSlackAlert(alert) {
    try {
      const axios = require('axios');
      
      const color = alert.severity === 'critical' ? 'danger' : 'warning';
      const emoji = alert.severity === 'critical' ? '🔥' : '⚠️';
      
      const payload = {
        channel: this.config.alerts.slack.channel,
        username: 'TecnoMundo Monitor',
        icon_emoji: ':warning:',
        attachments: [{
          color,
          title: `${emoji} ${alert.type} - ${alert.severity.toUpperCase()}`,
          text: alert.message,
          fields: [
            {
              title: 'Environment',
              value: alert.environment,
              short: true
            },
            {
              title: 'Timestamp',
              value: alert.timestamp,
              short: true
            }
          ],
          footer: 'TecnoMundo Monitoring',
          ts: Math.floor(Date.now() / 1000)
        }]
      };

      await axios.post(this.config.alerts.slack.webhook, payload);
    } catch (error) {
      console.error('Error sending Slack alert:', error);
    }
  }

  async sendDiscordAlert(alert) {
    try {
      const axios = require('axios');
      
      const color = alert.severity === 'critical' ? 0xFF0000 : 0xFFA500;
      
      const payload = {
        embeds: [{
          title: `🚨 TecnoMundo Alert`,
          description: alert.message,
          color,
          fields: [
            {
              name: 'Type',
              value: alert.type,
              inline: true
            },
            {
              name: 'Severity',
              value: alert.severity.toUpperCase(),
              inline: true
            },
            {
              name: 'Environment',
              value: alert.environment,
              inline: true
            }
          ],
          timestamp: alert.timestamp,
          footer: {
            text: 'TecnoMundo Monitoring'
          }
        }]
      };

      await axios.post(this.config.alerts.discord.webhook, payload);
    } catch (error) {
      console.error('Error sending Discord alert:', error);
    }
  }
}

// 📈 Sistema de Métricas
class MetricsCollector {
  constructor(config) {
    this.config = config;
    this.metrics = {
      requests: new Map(),
      errors: new Map(),
      responseTimes: [],
      systemMetrics: {
        memory: [],
        cpu: [],
        disk: []
      }
    };
    
    this.startCollection();
  }

  startCollection() {
    setInterval(() => {
      this.collectSystemMetrics();
      this.cleanOldMetrics();
    }, this.config.metrics.collection.interval);
  }

  recordRequest(endpoint, method, statusCode, responseTime) {
    const key = `${method} ${endpoint}`;
    const timestamp = Date.now();
    
    if (!this.metrics.requests.has(key)) {
      this.metrics.requests.set(key, []);
    }
    
    this.metrics.requests.get(key).push({
      timestamp,
      statusCode,
      responseTime
    });

    // Registrar errores
    if (statusCode >= 400) {
      if (!this.metrics.errors.has(key)) {
        this.metrics.errors.set(key, []);
      }
      this.metrics.errors.get(key).push({
        timestamp,
        statusCode,
        responseTime
      });
    }

    // Registrar tiempo de respuesta
    this.metrics.responseTimes.push({
      timestamp,
      endpoint: key,
      time: responseTime
    });
  }

  async collectSystemMetrics() {
    try {
      const os = require('os');
      const fs = require('fs').promises;
      
      // Memoria
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
      
      this.metrics.systemMetrics.memory.push({
        timestamp: Date.now(),
        usage: memoryUsage,
        total: totalMem,
        free: freeMem
      });

      // CPU
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      
      cpus.forEach(cpu => {
        for (let type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      });
      
      const cpuUsage = 100 - ~~(100 * totalIdle / totalTick);
      
      this.metrics.systemMetrics.cpu.push({
        timestamp: Date.now(),
        usage: cpuUsage
      });

      // Verificar umbrales y enviar alertas
      await this.checkThresholds(memoryUsage, cpuUsage);
      
    } catch (error) {
      console.error('Error collecting system metrics:', error);
    }
  }

  async checkThresholds(memoryUsage, cpuUsage) {
    const alertManager = new AlertManager(this.config);
    
    // Verificar memoria
    if (memoryUsage > this.config.thresholds.memoryUsage.critical) {
      await alertManager.sendAlert(
        'HIGH_MEMORY_USAGE',
        'critical',
        `Uso de memoria crítico: ${memoryUsage.toFixed(2)}%`,
        { memoryUsage, threshold: this.config.thresholds.memoryUsage.critical }
      );
    } else if (memoryUsage > this.config.thresholds.memoryUsage.warning) {
      await alertManager.sendAlert(
        'HIGH_MEMORY_USAGE',
        'warning',
        `Uso de memoria alto: ${memoryUsage.toFixed(2)}%`,
        { memoryUsage, threshold: this.config.thresholds.memoryUsage.warning }
      );
    }

    // Verificar CPU
    if (cpuUsage > this.config.thresholds.cpuUsage.critical) {
      await alertManager.sendAlert(
        'HIGH_CPU_USAGE',
        'critical',
        `Uso de CPU crítico: ${cpuUsage.toFixed(2)}%`,
        { cpuUsage, threshold: this.config.thresholds.cpuUsage.critical }
      );
    } else if (cpuUsage > this.config.thresholds.cpuUsage.warning) {
      await alertManager.sendAlert(
        'HIGH_CPU_USAGE',
        'warning',
        `Uso de CPU alto: ${cpuUsage.toFixed(2)}%`,
        { cpuUsage, threshold: this.config.thresholds.cpuUsage.warning }
      );
    }
  }

  cleanOldMetrics() {
    const cutoff = Date.now() - this.config.metrics.collection.retention;
    
    // Limpiar métricas de requests
    for (let [key, requests] of this.metrics.requests) {
      this.metrics.requests.set(key, requests.filter(r => r.timestamp > cutoff));
    }
    
    // Limpiar métricas de errores
    for (let [key, errors] of this.metrics.errors) {
      this.metrics.errors.set(key, errors.filter(e => e.timestamp > cutoff));
    }
    
    // Limpiar tiempos de respuesta
    this.metrics.responseTimes = this.metrics.responseTimes.filter(r => r.timestamp > cutoff);
    
    // Limpiar métricas del sistema
    this.metrics.systemMetrics.memory = this.metrics.systemMetrics.memory.filter(m => m.timestamp > cutoff);
    this.metrics.systemMetrics.cpu = this.metrics.systemMetrics.cpu.filter(c => c.timestamp > cutoff);
  }

  getMetricsSummary() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const cutoff = now - oneHour;

    // Calcular tasa de errores
    let totalRequests = 0;
    let totalErrors = 0;
    
    for (let requests of this.metrics.requests.values()) {
      const recentRequests = requests.filter(r => r.timestamp > cutoff);
      totalRequests += recentRequests.length;
    }
    
    for (let errors of this.metrics.errors.values()) {
      const recentErrors = errors.filter(e => e.timestamp > cutoff);
      totalErrors += recentErrors.length;
    }
    
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    // Calcular tiempo de respuesta promedio
    const recentResponseTimes = this.metrics.responseTimes.filter(r => r.timestamp > cutoff);
    const avgResponseTime = recentResponseTimes.length > 0 
      ? recentResponseTimes.reduce((sum, r) => sum + r.time, 0) / recentResponseTimes.length 
      : 0;

    return {
      errorRate,
      avgResponseTime,
      totalRequests,
      totalErrors,
      timeWindow: '1 hour'
    };
  }
}

// 🏥 Sistema de Health Checks
class HealthChecker {
  constructor(config) {
    this.config = config;
    this.healthStatus = new Map();
    this.startHealthChecks();
  }

  startHealthChecks() {
    setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthChecks.interval);
  }

  async performHealthChecks() {
    const alertManager = new AlertManager(this.config);
    
    // Check backend
    try {
      const axios = require('axios');
      const response = await axios.get(
        `${this.config.healthChecks.endpoints.backend}/health`,
        { timeout: this.config.healthChecks.timeout }
      );
      
      this.healthStatus.set('backend', {
        status: 'healthy',
        timestamp: Date.now(),
        responseTime: response.headers['x-response-time'] || 'unknown'
      });
    } catch (error) {
      this.healthStatus.set('backend', {
        status: 'unhealthy',
        timestamp: Date.now(),
        error: error.message
      });
      
      await alertManager.sendAlert(
        'SERVICE_DOWN',
        'critical',
        'Backend no responde a health checks',
        { service: 'backend', error: error.message }
      );
    }

    // Check external services
    for (const url of this.config.healthChecks.endpoints.external) {
      try {
        const axios = require('axios');
        await axios.get(url, { timeout: this.config.healthChecks.timeout });
        
        this.healthStatus.set(url, {
          status: 'healthy',
          timestamp: Date.now()
        });
      } catch (error) {
        this.healthStatus.set(url, {
          status: 'unhealthy',
          timestamp: Date.now(),
          error: error.message
        });
        
        await alertManager.sendAlert(
          'EXTERNAL_SERVICE_DOWN',
          'warning',
          `Servicio externo no responde: ${url}`,
          { service: url, error: error.message }
        );
      }
    }
  }

  getHealthStatus() {
    const status = {};
    for (let [service, health] of this.healthStatus) {
      status[service] = health;
    }
    return status;
  }
}

module.exports = {
  MONITORING_CONFIG,
  AlertManager,
  MetricsCollector,
  HealthChecker
};