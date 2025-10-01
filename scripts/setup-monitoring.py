#!/usr/bin/env python3
"""
🔧 Script de Configuración de Monitoreo - TecnoMundo
Configura e integra el sistema de monitoreo con el backend existente
"""

import os
import sys
import json
import subprocess
from pathlib import Path

def print_step(step, message):
    """Imprime un paso del proceso"""
    print(f"\n{'='*50}")
    print(f"PASO {step}: {message}")
    print(f"{'='*50}")

def print_success(message):
    """Imprime mensaje de éxito"""
    print(f"✅ {message}")

def print_error(message):
    """Imprime mensaje de error"""
    print(f"❌ {message}")

def print_warning(message):
    """Imprime mensaje de advertencia"""
    print(f"⚠️  {message}")

def check_prerequisites():
    """Verifica que los prerrequisitos estén instalados"""
    print_step(1, "Verificando prerrequisitos")
    
    required_packages = [
        'psutil',
        'aiohttp',
        'fastapi',
        'uvicorn'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print_success(f"{package} está instalado")
        except ImportError:
            missing_packages.append(package)
            print_error(f"{package} no está instalado")
    
    if missing_packages:
        print_warning("Instalando paquetes faltantes...")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install'
            ] + missing_packages)
            print_success("Paquetes instalados correctamente")
        except subprocess.CalledProcessError:
            print_error("Error instalando paquetes")
            return False
    
    return True

def create_environment_file():
    """Crea archivo de variables de entorno para monitoreo"""
    print_step(2, "Configurando variables de entorno")
    
    env_content = """# 📊 Configuración de Monitoreo - TecnoMundo

# Configuración de alertas por email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALERT_RECIPIENTS=admin@tecnomundo.com,dev@tecnomundo.com

# Configuración de Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Configuración de Discord (opcional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK

# Configuración del entorno
ENVIRONMENT=production
MONITORING_ENABLED=true

# URLs de servicios
BACKEND_URL=https://tecnomundo-backend.onrender.com
FRONTEND_URL=https://tecnomundo.web.app

# Configuración de base de datos (para health checks)
DATABASE_URL=postgresql://user:password@host:port/database
"""
    
    env_file = Path("backend/.env.monitoring")
    
    if env_file.exists():
        print_warning("Archivo .env.monitoring ya existe")
        response = input("¿Deseas sobrescribirlo? (y/N): ")
        if response.lower() != 'y':
            print("Manteniendo archivo existente")
            return True
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print_success(f"Archivo de configuración creado: {env_file}")
        print_warning("⚠️  IMPORTANTE: Edita el archivo .env.monitoring con tus credenciales reales")
        return True
    except Exception as e:
        print_error(f"Error creando archivo de configuración: {e}")
        return False

def update_main_app():
    """Actualiza el archivo main.py para incluir el middleware de monitoreo"""
    print_step(3, "Integrando middleware de monitoreo")
    
    main_file = Path("backend/main.py")
    
    if not main_file.exists():
        print_error("Archivo main.py no encontrado")
        return False
    
    # Leer contenido actual
    try:
        with open(main_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print_error(f"Error leyendo main.py: {e}")
        return False
    
    # Verificar si ya está integrado
    if 'MonitoringMiddleware' in content:
        print_warning("Middleware de monitoreo ya está integrado")
        return True
    
    # Agregar imports
    imports_to_add = """
# Imports para monitoreo
from app.middleware.monitoring import MonitoringMiddleware, get_health_status, get_metrics_endpoint
import os
from dotenv import load_dotenv

# Cargar variables de entorno de monitoreo
load_dotenv('.env.monitoring')
"""
    
    # Buscar donde agregar los imports
    if "from fastapi import" in content:
        content = content.replace(
            "from fastapi import",
            f"{imports_to_add}\nfrom fastapi import"
        )
    else:
        content = imports_to_add + "\n" + content
    
    # Agregar middleware
    middleware_code = """
# Configurar middleware de monitoreo
if os.getenv('MONITORING_ENABLED', 'false').lower() == 'true':
    app.add_middleware(MonitoringMiddleware)
"""
    
    # Buscar donde agregar el middleware (después de crear la app)
    if "app = FastAPI(" in content:
        # Encontrar el final de la configuración de FastAPI
        lines = content.split('\n')
        app_line_index = -1
        for i, line in enumerate(lines):
            if "app = FastAPI(" in line:
                app_line_index = i
                break
        
        if app_line_index != -1:
            # Encontrar el final del bloque de configuración de FastAPI
            brace_count = 0
            end_index = app_line_index
            for i in range(app_line_index, len(lines)):
                line = lines[i]
                brace_count += line.count('(') - line.count(')')
                if brace_count == 0 and i > app_line_index:
                    end_index = i
                    break
            
            # Insertar middleware después de la configuración de FastAPI
            lines.insert(end_index + 1, middleware_code)
            content = '\n'.join(lines)
    
    # Agregar endpoints de monitoreo
    endpoints_code = """
# Endpoints de monitoreo
@app.get("/health")
async def health_check():
    \"\"\"Endpoint de health check\"\"\"
    return get_health_status()

@app.get("/metrics")
async def metrics():
    \"\"\"Endpoint de métricas\"\"\"
    return get_metrics_endpoint()
"""
    
    # Agregar al final del archivo
    content += "\n" + endpoints_code
    
    # Escribir archivo actualizado
    try:
        with open(main_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print_success("main.py actualizado con middleware de monitoreo")
        return True
    except Exception as e:
        print_error(f"Error actualizando main.py: {e}")
        return False

def create_monitoring_dashboard():
    """Crea un dashboard simple de monitoreo"""
    print_step(4, "Creando dashboard de monitoreo")
    
    dashboard_dir = Path("monitoring/dashboard")
    dashboard_dir.mkdir(parents=True, exist_ok=True)
    
    dashboard_html = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TecnoMundo - Dashboard de Monitoreo</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .metric-label {
            color: #666;
            margin-top: 5px;
        }
        .status-healthy { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-critical { color: #dc3545; }
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .refresh-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 20px;
        }
        .refresh-btn:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 TecnoMundo - Dashboard de Monitoreo</h1>
            <p>Monitoreo en tiempo real del sistema</p>
        </div>
        
        <button class="refresh-btn" onclick="loadMetrics()">🔄 Actualizar Métricas</button>
        
        <div class="metrics-grid" id="metricsGrid">
            <!-- Las métricas se cargarán aquí -->
        </div>
        
        <div class="chart-container">
            <h3>📊 Tiempo de Respuesta</h3>
            <canvas id="responseTimeChart"></canvas>
        </div>
        
        <div class="chart-container">
            <h3>💾 Uso del Sistema</h3>
            <canvas id="systemUsageChart"></canvas>
        </div>
    </div>

    <script>
        let responseTimeChart;
        let systemUsageChart;
        
        async function loadMetrics() {
            try {
                const response = await fetch('/metrics');
                const data = await response.json();
                
                updateMetricsCards(data);
                updateCharts(data);
            } catch (error) {
                console.error('Error loading metrics:', error);
            }
        }
        
        function updateMetricsCards(data) {
            const grid = document.getElementById('metricsGrid');
            
            const getStatusClass = (value, warning, critical) => {
                if (value >= critical) return 'status-critical';
                if (value >= warning) return 'status-warning';
                return 'status-healthy';
            };
            
            grid.innerHTML = `
                <div class="metric-card">
                    <div class="metric-value ${getStatusClass(data.requests.error_rate, 5, 10)}">
                        ${data.requests.error_rate}%
                    </div>
                    <div class="metric-label">Tasa de Errores</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value ${getStatusClass(data.requests.avg_response_time, 2000, 5000)}">
                        ${Math.round(data.requests.avg_response_time)}ms
                    </div>
                    <div class="metric-label">Tiempo de Respuesta Promedio</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">
                        ${data.requests.total}
                    </div>
                    <div class="metric-label">Total de Peticiones</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value ${getStatusClass(data.system.memory_usage, 80, 90)}">
                        ${Math.round(data.system.memory_usage)}%
                    </div>
                    <div class="metric-label">Uso de Memoria</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value ${getStatusClass(data.system.cpu_usage, 70, 85)}">
                        ${Math.round(data.system.cpu_usage)}%
                    </div>
                    <div class="metric-label">Uso de CPU</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">
                        ${data.uptime}
                    </div>
                    <div class="metric-label">Tiempo de Actividad</div>
                </div>
            `;
        }
        
        function updateCharts(data) {
            // Datos simulados para los gráficos (en producción vendrían del backend)
            const timeLabels = Array.from({length: 24}, (_, i) => `${i}:00`);
            const responseTimeData = Array.from({length: 24}, () => Math.random() * 1000 + 500);
            
            // Gráfico de tiempo de respuesta
            if (responseTimeChart) {
                responseTimeChart.destroy();
            }
            
            const ctx1 = document.getElementById('responseTimeChart').getContext('2d');
            responseTimeChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: timeLabels,
                    datasets: [{
                        label: 'Tiempo de Respuesta (ms)',
                        data: responseTimeData,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            // Gráfico de uso del sistema
            if (systemUsageChart) {
                systemUsageChart.destroy();
            }
            
            const ctx2 = document.getElementById('systemUsageChart').getContext('2d');
            systemUsageChart = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['CPU', 'Memoria', 'Disco'],
                    datasets: [{
                        data: [
                            data.system.cpu_usage,
                            data.system.memory_usage,
                            data.system.disk_usage || 50
                        ],
                        backgroundColor: [
                            '#ff6384',
                            '#36a2eb',
                            '#ffce56'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }
        
        // Cargar métricas al inicio
        loadMetrics();
        
        // Actualizar cada 30 segundos
        setInterval(loadMetrics, 30000);
    </script>
</body>
</html>"""
    
    dashboard_file = dashboard_dir / "index.html"
    
    try:
        with open(dashboard_file, 'w', encoding='utf-8') as f:
            f.write(dashboard_html)
        print_success(f"Dashboard creado: {dashboard_file}")
        return True
    except Exception as e:
        print_error(f"Error creando dashboard: {e}")
        return False

def create_requirements_update():
    """Actualiza requirements.txt con las dependencias de monitoreo"""
    print_step(5, "Actualizando dependencias")
    
    requirements_file = Path("backend/requirements.txt")
    
    monitoring_deps = [
        "psutil>=5.9.0",
        "aiohttp>=3.8.0",
        "python-dotenv>=0.19.0"
    ]
    
    if requirements_file.exists():
        try:
            with open(requirements_file, 'r') as f:
                current_deps = f.read()
            
            new_deps = []
            for dep in monitoring_deps:
                package_name = dep.split('>=')[0]
                if package_name not in current_deps:
                    new_deps.append(dep)
            
            if new_deps:
                with open(requirements_file, 'a') as f:
                    f.write('\n# Dependencias de monitoreo\n')
                    for dep in new_deps:
                        f.write(f"{dep}\n")
                print_success(f"Agregadas {len(new_deps)} dependencias nuevas")
            else:
                print_success("Todas las dependencias ya están presentes")
                
        except Exception as e:
            print_error(f"Error actualizando requirements.txt: {e}")
            return False
    else:
        try:
            with open(requirements_file, 'w') as f:
                f.write("# Dependencias de monitoreo\n")
                for dep in monitoring_deps:
                    f.write(f"{dep}\n")
            print_success("requirements.txt creado con dependencias de monitoreo")
        except Exception as e:
            print_error(f"Error creando requirements.txt: {e}")
            return False
    
    return True

def create_systemd_service():
    """Crea archivo de servicio systemd para monitoreo (opcional)"""
    print_step(6, "Creando servicio de monitoreo (opcional)")
    
    service_content = """[Unit]
Description=TecnoMundo Monitoring Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/tecnomundo
Environment=PATH=/path/to/tecnomundo/venv/bin
ExecStart=/path/to/tecnomundo/venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
"""
    
    service_dir = Path("scripts/systemd")
    service_dir.mkdir(parents=True, exist_ok=True)
    
    service_file = service_dir / "tecnomundo-monitoring.service"
    
    try:
        with open(service_file, 'w') as f:
            f.write(service_content)
        print_success(f"Archivo de servicio creado: {service_file}")
        print_warning("⚠️  Edita las rutas en el archivo antes de usar")
        return True
    except Exception as e:
        print_error(f"Error creando archivo de servicio: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Configuración de Monitoreo - TecnoMundo")
    print("=" * 50)
    
    # Verificar que estamos en el directorio correcto
    if not Path("backend").exists() or not Path("frontend").exists():
        print_error("Este script debe ejecutarse desde la raíz del proyecto TecnoMundo")
        sys.exit(1)
    
    steps = [
        check_prerequisites,
        create_environment_file,
        update_main_app,
        create_monitoring_dashboard,
        create_requirements_update,
        create_systemd_service
    ]
    
    for step_func in steps:
        if not step_func():
            print_error("Error en la configuración. Abortando.")
            sys.exit(1)
    
    print("\n" + "=" * 50)
    print("✅ CONFIGURACIÓN COMPLETADA")
    print("=" * 50)
    
    print("\n📋 PRÓXIMOS PASOS:")
    print("1. Edita backend/.env.monitoring con tus credenciales reales")
    print("2. Instala las dependencias: pip install -r backend/requirements.txt")
    print("3. Reinicia el servidor backend")
    print("4. Accede al dashboard en: http://localhost:8001/monitoring/dashboard/")
    print("5. Verifica el health check en: http://localhost:8001/health")
    print("6. Configura las alertas según tus necesidades")
    
    print("\n🔗 ENLACES ÚTILES:")
    print("- Health Check: http://localhost:8001/health")
    print("- Métricas: http://localhost:8001/metrics")
    print("- Dashboard: monitoring/dashboard/index.html")
    print("- Documentación: docs/EMERGENCY_PROCEDURES.md")
    
    print("\n⚠️  IMPORTANTE:")
    print("- Configura las credenciales SMTP para alertas por email")
    print("- Configura el webhook de Slack para alertas")
    print("- Revisa los umbrales de alerta en monitoring-config.js")
    print("- Programa backups regulares de la configuración")

if __name__ == "__main__":
    main()