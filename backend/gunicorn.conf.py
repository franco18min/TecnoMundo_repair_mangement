# gunicorn.conf.py - Configuración para FastAPI en producción

import multiprocessing

# Configuración del servidor
bind = "127.0.0.1:8001"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100

# Configuración de logs
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Configuración de proceso
daemon = False
pidfile = "/var/run/gunicorn/gunicorn.pid"
user = "apitecnoapp"
group = "apitecnoapp"

# Configuración de timeout
timeout = 120
keepalive = 5

# Configuración de memoria
preload_app = True
max_worker_memory = 200000  # 200MB por worker

# Configuración SSL (si se maneja a nivel de aplicación)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"