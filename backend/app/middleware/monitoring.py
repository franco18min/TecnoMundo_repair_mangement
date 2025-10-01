"""
📊 Middleware de Monitoreo - TecnoMundo Backend
Sistema de monitoreo integrado con FastAPI para métricas y alertas en tiempo real
"""

import time
import json
import asyncio
import psutil
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import defaultdict, deque
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import logging
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import aiohttp
import os

# Configuración del logger
logger = logging.getLogger(__name__)

class MonitoringMetrics:
    """Clase para recopilar y almacenar métricas del sistema"""
    
    def __init__(self):
        self.request_count = defaultdict(int)
        self.error_count = defaultdict(int)
        self.response_times = defaultdict(list)
        self.system_metrics = {
            'memory': deque(maxlen=1000),
            'cpu': deque(maxlen=1000),
            'disk': deque(maxlen=1000)
        }
        self.start_time = datetime.now()
        
        # Configuración de umbrales
        self.thresholds = {
            'error_rate': {'warning': 5, 'critical': 10},
            'response_time': {'warning': 2000, 'critical': 5000},
            'memory_usage': {'warning': 80, 'critical': 90},
            'cpu_usage': {'warning': 70, 'critical': 85}
        }
        
        # Historial de alertas para evitar spam
        self.alert_history = {}
        self.alert_cooldown = 300  # 5 minutos
        
        # Iniciar recolección de métricas del sistema
        asyncio.create_task(self.collect_system_metrics())
    
    async def collect_system_metrics(self):
        """Recopila métricas del sistema cada minuto"""
        while True:
            try:
                # Métricas de memoria
                memory = psutil.virtual_memory()
                memory_usage = memory.percent
                
                # Métricas de CPU
                cpu_usage = psutil.cpu_percent(interval=1)
                
                # Métricas de disco
                disk = psutil.disk_usage('/')
                disk_usage = disk.percent
                
                timestamp = datetime.now()
                
                # Almacenar métricas
                self.system_metrics['memory'].append({
                    'timestamp': timestamp,
                    'usage': memory_usage,
                    'total': memory.total,
                    'available': memory.available
                })
                
                self.system_metrics['cpu'].append({
                    'timestamp': timestamp,
                    'usage': cpu_usage
                })
                
                self.system_metrics['disk'].append({
                    'timestamp': timestamp,
                    'usage': disk_usage,
                    'total': disk.total,
                    'free': disk.free
                })
                
                # Verificar umbrales y enviar alertas
                await self.check_system_thresholds(memory_usage, cpu_usage, disk_usage)
                
            except Exception as e:
                logger.error(f"Error collecting system metrics: {e}")
            
            await asyncio.sleep(60)  # Esperar 1 minuto
    
    def record_request(self, method: str, path: str, status_code: int, response_time: float):
        """Registra una petición HTTP"""
        endpoint = f"{method} {path}"
        
        # Incrementar contador de peticiones
        self.request_count[endpoint] += 1
        
        # Registrar errores
        if status_code >= 400:
            self.error_count[endpoint] += 1
        
        # Registrar tiempo de respuesta
        self.response_times[endpoint].append({
            'timestamp': datetime.now(),
            'time': response_time,
            'status_code': status_code
        })
        
        # Mantener solo los últimos 1000 registros por endpoint
        if len(self.response_times[endpoint]) > 1000:
            self.response_times[endpoint] = self.response_times[endpoint][-1000:]
    
    async def check_system_thresholds(self, memory_usage: float, cpu_usage: float, disk_usage: float):
        """Verifica umbrales del sistema y envía alertas si es necesario"""
        alert_manager = AlertManager()
        
        # Verificar memoria
        if memory_usage > self.thresholds['memory_usage']['critical']:
            await alert_manager.send_alert(
                'HIGH_MEMORY_USAGE',
                'critical',
                f'Uso de memoria crítico: {memory_usage:.2f}%',
                {'memory_usage': memory_usage, 'threshold': self.thresholds['memory_usage']['critical']}
            )
        elif memory_usage > self.thresholds['memory_usage']['warning']:
            await alert_manager.send_alert(
                'HIGH_MEMORY_USAGE',
                'warning',
                f'Uso de memoria alto: {memory_usage:.2f}%',
                {'memory_usage': memory_usage, 'threshold': self.thresholds['memory_usage']['warning']}
            )
        
        # Verificar CPU
        if cpu_usage > self.thresholds['cpu_usage']['critical']:
            await alert_manager.send_alert(
                'HIGH_CPU_USAGE',
                'critical',
                f'Uso de CPU crítico: {cpu_usage:.2f}%',
                {'cpu_usage': cpu_usage, 'threshold': self.thresholds['cpu_usage']['critical']}
            )
        elif cpu_usage > self.thresholds['cpu_usage']['warning']:
            await alert_manager.send_alert(
                'HIGH_CPU_USAGE',
                'warning',
                f'Uso de CPU alto: {cpu_usage:.2f}%',
                {'cpu_usage': cpu_usage, 'threshold': self.thresholds['cpu_usage']['warning']}
            )
    
    def get_metrics_summary(self, hours: int = 1) -> Dict:
        """Obtiene un resumen de métricas de las últimas horas"""
        cutoff = datetime.now() - timedelta(hours=hours)
        
        total_requests = 0
        total_errors = 0
        response_times = []
        
        # Calcular métricas de peticiones
        for endpoint, count in self.request_count.items():
            total_requests += count
            total_errors += self.error_count.get(endpoint, 0)
            
            # Filtrar tiempos de respuesta recientes
            recent_times = [
                rt for rt in self.response_times.get(endpoint, [])
                if rt['timestamp'] > cutoff
            ]
            response_times.extend([rt['time'] for rt in recent_times])
        
        # Calcular estadísticas
        error_rate = (total_errors / total_requests * 100) if total_requests > 0 else 0
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Métricas del sistema más recientes
        latest_memory = self.system_metrics['memory'][-1] if self.system_metrics['memory'] else None
        latest_cpu = self.system_metrics['cpu'][-1] if self.system_metrics['cpu'] else None
        latest_disk = self.system_metrics['disk'][-1] if self.system_metrics['disk'] else None
        
        return {
            'requests': {
                'total': total_requests,
                'errors': total_errors,
                'error_rate': round(error_rate, 2),
                'avg_response_time': round(avg_response_time, 2)
            },
            'system': {
                'memory_usage': latest_memory['usage'] if latest_memory else 0,
                'cpu_usage': latest_cpu['usage'] if latest_cpu else 0,
                'disk_usage': latest_disk['usage'] if latest_disk else 0
            },
            'uptime': str(datetime.now() - self.start_time),
            'time_window': f'{hours} hour(s)'
        }

class AlertManager:
    """Gestor de alertas para envío de notificaciones"""
    
    def __init__(self):
        self.alert_history = {}
        self.cooldown_period = 300  # 5 minutos
    
    async def send_alert(self, alert_type: str, severity: str, message: str, details: Dict = None):
        """Envía una alerta si no está en cooldown"""
        alert_key = f"{alert_type}-{severity}"
        now = datetime.now()
        
        # Verificar cooldown
        if alert_key in self.alert_history:
            last_alert = self.alert_history[alert_key]
            if (now - last_alert).total_seconds() < self.cooldown_period:
                return  # Skip alert due to cooldown
        
        self.alert_history[alert_key] = now
        
        alert_data = {
            'timestamp': now.isoformat(),
            'type': alert_type,
            'severity': severity,
            'message': message,
            'details': details or {},
            'environment': os.getenv('ENVIRONMENT', 'development'),
            'service': 'TecnoMundo Backend'
        }
        
        # Enviar por diferentes canales
        await self.send_email_alert(alert_data)
        await self.send_slack_alert(alert_data)
        
        # Log de la alerta
        logger.error(f"🚨 ALERT SENT: {alert_data}")
    
    async def send_email_alert(self, alert_data: Dict):
        """Envía alerta por email"""
        try:
            smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
            smtp_port = int(os.getenv('SMTP_PORT', '587'))
            smtp_user = os.getenv('SMTP_USER')
            smtp_pass = os.getenv('SMTP_PASS')
            recipients = os.getenv('ALERT_RECIPIENTS', 'admin@tecnomundo.com').split(',')
            
            if not smtp_user or not smtp_pass:
                logger.warning("SMTP credentials not configured, skipping email alert")
                return
            
            msg = MimeMultipart()
            msg['From'] = smtp_user
            msg['To'] = ', '.join(recipients)
            msg['Subject'] = f"🚨 TecnoMundo Alert - {alert_data['severity'].upper()}: {alert_data['type']}"
            
            body = f"""
            <h2>🚨 TecnoMundo Alert</h2>
            <p><strong>Severity:</strong> {alert_data['severity']}</p>
            <p><strong>Type:</strong> {alert_data['type']}</p>
            <p><strong>Message:</strong> {alert_data['message']}</p>
            <p><strong>Environment:</strong> {alert_data['environment']}</p>
            <p><strong>Timestamp:</strong> {alert_data['timestamp']}</p>
            <h3>Details:</h3>
            <pre>{json.dumps(alert_data['details'], indent=2)}</pre>
            """
            
            msg.attach(MimeText(body, 'html'))
            
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()
            
        except Exception as e:
            logger.error(f"Error sending email alert: {e}")
    
    async def send_slack_alert(self, alert_data: Dict):
        """Envía alerta por Slack"""
        try:
            webhook_url = os.getenv('SLACK_WEBHOOK_URL')
            if not webhook_url:
                logger.warning("Slack webhook not configured, skipping Slack alert")
                return
            
            color = 'danger' if alert_data['severity'] == 'critical' else 'warning'
            emoji = '🔥' if alert_data['severity'] == 'critical' else '⚠️'
            
            payload = {
                'channel': '#tecnomundo-alerts',
                'username': 'TecnoMundo Monitor',
                'icon_emoji': ':warning:',
                'attachments': [{
                    'color': color,
                    'title': f"{emoji} {alert_data['type']} - {alert_data['severity'].upper()}",
                    'text': alert_data['message'],
                    'fields': [
                        {
                            'title': 'Environment',
                            'value': alert_data['environment'],
                            'short': True
                        },
                        {
                            'title': 'Service',
                            'value': alert_data['service'],
                            'short': True
                        }
                    ],
                    'footer': 'TecnoMundo Monitoring',
                    'ts': int(datetime.now().timestamp())
                }]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(webhook_url, json=payload) as response:
                    if response.status != 200:
                        logger.error(f"Failed to send Slack alert: {response.status}")
                        
        except Exception as e:
            logger.error(f"Error sending Slack alert: {e}")

# Instancia global de métricas
monitoring_metrics = MonitoringMetrics()

class MonitoringMiddleware:
    """Middleware de FastAPI para monitoreo de peticiones"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        start_time = time.time()
        request = Request(scope, receive)
        
        # Crear response wrapper para capturar status code
        response_data = {}
        
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                response_data["status_code"] = message["status"]
            await send(message)
        
        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as e:
            # Registrar error
            response_time = (time.time() - start_time) * 1000
            monitoring_metrics.record_request(
                request.method,
                request.url.path,
                500,
                response_time
            )
            
            # Enviar alerta de error crítico
            alert_manager = AlertManager()
            await alert_manager.send_alert(
                'UNHANDLED_EXCEPTION',
                'critical',
                f'Error no manejado en {request.method} {request.url.path}: {str(e)}',
                {
                    'method': request.method,
                    'path': str(request.url.path),
                    'error': str(e),
                    'response_time': response_time
                }
            )
            
            raise
        
        # Registrar métricas de la petición
        response_time = (time.time() - start_time) * 1000
        status_code = response_data.get("status_code", 200)
        
        monitoring_metrics.record_request(
            request.method,
            request.url.path,
            status_code,
            response_time
        )
        
        # Verificar umbrales de tiempo de respuesta
        if response_time > monitoring_metrics.thresholds['response_time']['critical']:
            alert_manager = AlertManager()
            await alert_manager.send_alert(
                'SLOW_RESPONSE',
                'critical',
                f'Respuesta muy lenta en {request.method} {request.url.path}: {response_time:.2f}ms',
                {
                    'method': request.method,
                    'path': str(request.url.path),
                    'response_time': response_time,
                    'threshold': monitoring_metrics.thresholds['response_time']['critical']
                }
            )
        elif response_time > monitoring_metrics.thresholds['response_time']['warning']:
            alert_manager = AlertManager()
            await alert_manager.send_alert(
                'SLOW_RESPONSE',
                'warning',
                f'Respuesta lenta en {request.method} {request.url.path}: {response_time:.2f}ms',
                {
                    'method': request.method,
                    'path': str(request.url.path),
                    'response_time': response_time,
                    'threshold': monitoring_metrics.thresholds['response_time']['warning']
                }
            )

def get_health_status() -> Dict:
    """Endpoint de health check"""
    try:
        # Verificar base de datos (esto debería adaptarse a tu configuración)
        # db_status = check_database_connection()
        
        # Obtener métricas del sistema
        memory = psutil.virtual_memory()
        cpu = psutil.cpu_percent()
        disk = psutil.disk_usage('/')
        
        # Determinar estado general
        status = "healthy"
        if memory.percent > 90 or cpu > 90 or disk.percent > 90:
            status = "degraded"
        
        return {
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "uptime": str(datetime.now() - monitoring_metrics.start_time),
            "system": {
                "memory": {
                    "usage_percent": memory.percent,
                    "available_gb": round(memory.available / (1024**3), 2)
                },
                "cpu": {
                    "usage_percent": cpu
                },
                "disk": {
                    "usage_percent": disk.percent,
                    "free_gb": round(disk.free / (1024**3), 2)
                }
            },
            "metrics": monitoring_metrics.get_metrics_summary()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

def get_metrics_endpoint() -> Dict:
    """Endpoint para obtener métricas detalladas"""
    return monitoring_metrics.get_metrics_summary(hours=24)