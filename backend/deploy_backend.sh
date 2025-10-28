#!/bin/bash
# deploy_backend.sh - Script de despliegue para FastAPI en api.tecnoapp.ar

set -e  # Salir si hay errores

echo "🚀 Iniciando despliegue del backend TecnoMundo..."

# Variables
PROJECT_DIR="/home/apitecnoapp/htdocs/TecnoMundo_repair_mangement"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_DIR="$PROJECT_DIR/venv"
SERVICE_NAME="tecnomundo-api"

# 1. Crear directorios necesarios
echo "📁 Creando directorios..."
sudo mkdir -p /var/log/gunicorn
sudo mkdir -p /var/run/gunicorn
sudo chown apitecnoapp:apitecnoapp /var/log/gunicorn
sudo chown apitecnoapp:apitecnoapp /var/run/gunicorn

# 2. Instalar Python y dependencias del sistema
echo "🐍 Verificando Python..."
if ! command -v python3.9 &> /dev/null; then
    echo "Instalando Python 3.9..."
    sudo apt update
    sudo apt install -y python3.9 python3.9-venv python3.9-dev python3-pip
fi

# 3. Crear entorno virtual
echo "📦 Configurando entorno virtual..."
cd $PROJECT_DIR
if [ ! -d "$VENV_DIR" ]; then
    python3.9 -m venv venv
fi
source venv/bin/activate

# 4. Instalar dependencias
echo "📚 Instalando dependencias..."
cd $BACKEND_DIR
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# 5. Configurar variables de entorno
echo "⚙️ Configurando variables de entorno..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
    cp .env.production .env
    echo "⚠️  IMPORTANTE: Edita $BACKEND_DIR/.env con tus credenciales reales"
fi

# 6. Crear servicio systemd
echo "🔧 Configurando servicio systemd..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=TecnoMundo FastAPI Backend
After=network.target

[Service]
Type=notify
User=apitecnoapp
Group=apitecnoapp
WorkingDirectory=$BACKEND_DIR
Environment=PATH=$VENV_DIR/bin
ExecStart=$VENV_DIR/bin/gunicorn -c gunicorn.conf.py main:app
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 7. Configurar Nginx
echo "🌐 Configurando Nginx..."
sudo tee /etc/nginx/sites-available/api.tecnoapp.ar > /dev/null <<EOF
server {
    listen 80;
    server_name api.tecnoapp.ar;
    
    # Redirección a HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tecnoapp.ar;
    
    # Certificados SSL (configurar después con certbot)
    # ssl_certificate /etc/letsencrypt/live/api.tecnoapp.ar/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.tecnoapp.ar/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Headers de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Configuración de proxy
    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Logs
    access_log /var/log/nginx/api.tecnoapp.ar.access.log;
    error_log /var/log/nginx/api.tecnoapp.ar.error.log;
}
EOF

# 8. Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/api.tecnoapp.ar /etc/nginx/sites-enabled/
sudo nginx -t

# 9. Instalar certificado SSL
echo "🔒 Configurando SSL con Let's Encrypt..."
if command -v certbot &> /dev/null; then
    sudo certbot --nginx -d api.tecnoapp.ar --non-interactive --agree-tos --email admin@tecnoapp.ar
else
    echo "⚠️  Instala certbot: sudo apt install certbot python3-certbot-nginx"
fi

# 10. Iniciar servicios
echo "🚀 Iniciando servicios..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME
sudo systemctl reload nginx

# 11. Verificar estado
echo "✅ Verificando servicios..."
sudo systemctl status $SERVICE_NAME --no-pager
curl -f http://localhost:8001/ || echo "⚠️  Backend no responde en localhost:8001"

echo "🎉 Despliegue completado!"
echo "📋 Próximos pasos:"
echo "   1. Edita $BACKEND_DIR/.env con tus credenciales de base de datos"
echo "   2. Configura PostgreSQL y ejecuta las migraciones"
echo "   3. Verifica: https://api.tecnoapp.ar/"
echo "   4. Verifica: https://api.tecnoapp.ar/docs"