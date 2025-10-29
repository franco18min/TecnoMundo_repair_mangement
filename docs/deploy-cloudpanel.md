TecnoMundo Repair Management — Guía de despliegue en CloudPanel (Donweb)

Resumen
- Frontend: React 18 + Vite + TailwindCSS → sitio estático en tecnoapp.ar
- Backend: FastAPI (Python) + SQLAlchemy + PostgreSQL → api.tecnoapp.ar
- Autenticación: JWT
- Infra: CloudPanel (Nginx como reverse proxy, UFW firewall, SSL Let's Encrypt)

Sitios a crear en CloudPanel
1) tecnoapp.ar (y www.tecnoapp.ar)
   - Tipo: Static Website (sitio estático)
   - SSL: Let's Encrypt para tecnoapp.ar y www.tecnoapp.ar
   - Objetivo: Servir los archivos del build de Vite (dist)

2) api.tecnoapp.ar
   - Tipo: Python Application (ASGI)
   - SSL: Let's Encrypt para api.tecnoapp.ar
   - App Port: 9001 (sugerido; se puede cambiar)
   - Start Command: usar backend/start.sh (uvicorn) o Gunicorn ASGI

DNS en Donweb
- A (IPv4) → tecnoapp.ar → IP pública del servidor
- A (IPv4) → api.tecnoapp.ar → IP pública del servidor
- CNAME → www.tecnoapp.ar → tecnoapp.ar (opcionalmente A directo)
- AAAA (IPv6) → si tu servidor tiene IPv6, añade registros AAAA
- TTL recomendado: 300–600 s durante el despliegue inicial

Requisitos previos en el servidor
- Acceso a CloudPanel: https://vps-...:8443
- Acceso SSH al servidor
- Node.js 18+ (para construir frontend si compilas en el servidor)
- Python 3.9+ (backend)

Estructura del repositorio
- https://github.com/franco18min/TecnoMundo_repair_mangement
  - frontend/ → aplicación React
  - backend/ → API FastAPI

Configuración del Frontend
1) Variables de entorno
   - Archivo: frontend/.env.production (puedes copiar desde .env.production.example)
   - Contenido mínimo:
     - VITE_ENVIRONMENT=production
     - VITE_API_BASE_URL=https://api.tecnoapp.ar

2) Build y despliegue
   - Opción A (compilar en local y subir dist/):
     - cd frontend
     - npm ci
     - cp .env.production.example .env.production (y verificar VITE_API_BASE_URL)
     - npm run build
     - El resultado está en frontend/dist
     - Subir contenido de dist/ al Document Root del sitio estático en CloudPanel

   - Opción B (compilar en el servidor):
     - SSH al servidor → navegar al directorio del sitio tecnoapp.ar (Document Root)
     - git clone https://github.com/franco18min/TecnoMundo_repair_mangement.git
     - cd TecnoMundo_repair_mangement/frontend
     - npm ci
     - cp .env.production.example .env.production
     - sed -i 's#https://api\.tecnoapp\.ar#https://api.tecnoapp.ar#g' .env.production
     - npm run build
     - Copiar contenido de dist/ al htdocs del sitio:
       - rsync -av --delete dist/ /ruta/del/document_root/

3) Nginx/CloudPanel
   - CloudPanel configura el vHost para Static Website automáticamente.
   - Habilitar HTTP/2 (automático con SSL).
   - Activar compresión (se recomienda; CloudPanel suele traer ajustes de rendimiento).

Configuración del Backend (FastAPI)
1) Variables de entorno
   - Archivo: backend/.env (ejemplo en backend/.env.example)
   - Ajustar:
     - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
     - DB_SSLMODE (prefer|require)
     - DB_DRIVER (pg8000|psycopg2)
     - ALLOWED_ORIGINS=https://tecnoapp.ar,https://www.tecnoapp.ar
     - SECRET_KEY (clave fuerte)
     - ACCESS_TOKEN_EXPIRE_MINUTES (ej. 240)
     - APP_PORT=9001

2) Dependencias
   - cd backend
   - python -m venv venv
   - source venv/bin/activate (Linux) o venv\Scripts\activate (Windows)
   - pip install -r requirements.txt

3) Arranque de la app
   - Opción A (Uvicorn):
     - chmod +x backend/start.sh
     - ./backend/start.sh (usa APP_PORT del .env; por defecto 9001)
   - Opción B (Gunicorn ASGI):
     - gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 127.0.0.1:9001 --workers 2

4) CloudPanel (Python Application)
   - Crear sitio Python para api.tecnoapp.ar
   - Indicar App Port: 9001
   - Definir Start Command (si el vHost lo soporta): ./backend/start.sh
   - CloudPanel creará el vHost y el proxy Nginx a 127.0.0.1:9001
   - Emitir SSL Let's Encrypt

5) Sistema de servicio (alternativa con systemd)
   - Crear /etc/systemd/system/api-tecnoapp.service:
     - [Unit]
       Description=TecnoMundo API (Uvicorn)
       After=network.target
     - [Service]
       WorkingDirectory=/ruta/al/backend
       EnvironmentFile=/ruta/al/backend/.env
       ExecStart=/ruta/al/venv/bin/uvicorn main:app --host 127.0.0.1 --port ${APP_PORT} --workers 2
       Restart=always
       User=www-data
     - [Install]
       WantedBy=multi-user.target
   - sudo systemctl daemon-reload
   - sudo systemctl enable --now api-tecnoapp
   - Ver logs: sudo journalctl -u api-tecnoapp -f

Seguridad y buenas prácticas
- Activar SSL (Let's Encrypt) para tecnoapp.ar y api.tecnoapp.ar
- Limitar puertos con firewall (UFW): permitir 22 (SSH) y 8443 (CloudPanel) sólo para IPs de confianza
- Habilitar 2FA en CloudPanel, usar contraseñas robustas
- Usar Basic Auth si necesitas restringir acceso temporal
- Configurar copias de seguridad automáticas y remotas
- Mantener software actualizado

Comandos típicos (remotos en servidor)
Frontend (si compilas en servidor):
- cd /home/.../sites/tecnoapp.ar/htdocs
- git clone https://github.com/franco18min/TecnoMundo_repair_mangement.git
- cd TecnoMundo_repair_mangement/frontend
- npm ci
- cp .env.production.example .env.production
- npm run build
- rsync -av --delete dist/ /home/.../sites/tecnoapp.ar/htdocs/

Backend:
- cd /home/.../sites/api.tecnoapp.ar/app
- git clone https://github.com/franco18min/TecnoMundo_repair_mangement.git
- cd TecnoMundo_repair_mangement/backend
- python -m venv venv
- source venv/bin/activate
- pip install -r requirements.txt
- cp .env.example .env && nano .env (ajusta variables)
- chmod +x start.sh
- ./start.sh

Comandos locales (verificación previa):
- cd frontend && npm ci && npm run build && npm run preview
- cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload --port 8001

Verificación post-deploy
- Frontend: https://tecnoapp.ar
- Backend: https://api.tecnoapp.ar/hello (debe responder JSON)
- Documentación API: si habilitada /docs detrás de proxy (puede requerir ajustar vHost)
- CORS: desde navegador, login y peticiones deben funcionar sin error CORS
- WebSocket (si aplica): revisar ruta /api/v1/notifications/ws

Solución de problemas
- CORS: asegurarse de ALLOWED_ORIGINS incluye el dominio del frontend (https://tecnoapp.ar y https://www.tecnoapp.ar)
- SSL: reemitir certificados si cambian dominios/subdominios
- Puertos: confirmar que el puerto interno (APP_PORT) está accesible localmente y proxied por Nginx
- Logs:
  - Nginx: /var/log/nginx/access.log, /var/log/nginx/error.log
  - Backend (systemd): journalctl -u api-tecnoapp -f
  - Uvicorn (start.sh): salida estándar

Notas
- CloudPanel soporta múltiples tipos de aplicaciones (PHP, Node.js, Python, Static Websites) y vHosts preconfigurados, con SSL y recursos de seguridad.
- Sigue las buenas prácticas de seguridad, backups e integración con Cloudflare si lo deseas.