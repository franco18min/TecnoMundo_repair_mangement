# 🚀 Guía de Despliegue - Backend FastAPI

## Configuración del Servidor api.tecnoapp.ar

### 📋 Requisitos Previos

- **Servidor**: Ubuntu/Debian con acceso root
- **Dominio**: api.tecnoapp.ar apuntando al servidor
- **Usuario**: apitecnoapp con permisos sudo
- **Puerto**: 8001 (interno), 443/80 (externo vía Nginx)

### 🔧 Instalación Automática

```bash
# 1. Subir código al servidor
scp -r backend/ apitecnoapp@api.tecnoapp.ar:/home/apitecnoapp/htdocs/TecnoMundo_repair_mangement/

# 2. Conectar al servidor
ssh apitecnoapp@api.tecnoapp.ar

# 3. Ejecutar script de despliegue
cd /home/apitecnoapp/htdocs/TecnoMundo_repair_mangement/backend
chmod +x deploy_backend.sh
sudo ./deploy_backend.sh
```

### ⚙️ Configuración Manual Paso a Paso

#### 1. Preparar el Entorno

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias del sistema
sudo apt install -y python3.9 python3.9-venv python3.9-dev python3-pip
sudo apt install -y nginx postgresql postgresql-contrib
sudo apt install -y certbot python3-certbot-nginx

# Crear usuario del sistema (si no existe)
sudo useradd -m -s /bin/bash apitecnoapp
sudo usermod -aG sudo apitecnoapp
```

#### 2. Configurar el Proyecto

```bash
# Cambiar al usuario del proyecto
sudo su - apitecnoapp

# Crear estructura de directorios
mkdir -p /home/apitecnoapp/htdocs/TecnoMundo_repair_mangement
cd /home/apitecnoapp/htdocs/TecnoMundo_repair_mangement

# Clonar o subir el código del backend
# (usar git clone o scp según prefieras)

# Crear entorno virtual
python3.9 -m venv venv
source venv/bin/activate

# Instalar dependencias
cd backend
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

#### 3. Configurar Variables de Entorno

```bash
# Copiar y editar archivo de configuración
cp .env.production .env
nano .env

# Configurar valores reales:
# DB_HOST=localhost
# DB_NAME=tecnomundo_repair
# DB_USER=tecnomundo_user  
# DB_PASSWORD=tu_password_real
# SECRET_KEY=genera_una_clave_secreta_de_32_caracteres
```

#### 4. Configurar PostgreSQL

```bash
# Conectar como postgres
sudo -u postgres psql

-- Crear base de datos y usuario
CREATE DATABASE tecnomundo_repair;
CREATE USER tecnomundo_user WITH PASSWORD 'tu_password_real';
GRANT ALL PRIVILEGES ON DATABASE tecnomundo_repair TO tecnomundo_user;
\q

# Ejecutar migraciones (si las tienes)
cd /home/apitecnoapp/htdocs/TecnoMundo_repair_mangement/backend
source ../venv/bin/activate
python scripts/migration_script.py  # Si existe
```

#### 5. Configurar Servicio Systemd

```bash
# Crear archivo de servicio
sudo nano /etc/systemd/system/tecnomundo-api.service

# Contenido del archivo:
[Unit]
Description=TecnoMundo FastAPI Backend
After=network.target

[Service]
Type=notify
User=apitecnoapp
Group=apitecnoapp
WorkingDirectory=/home/apitecnoapp/htdocs/TecnoMundo_repair_mangement/backend
Environment=PATH=/home/apitecnoapp/htdocs/TecnoMundo_repair_mangement/venv/bin
ExecStart=/home/apitecnoapp/htdocs/TecnoMundo_repair_mangement/venv/bin/gunicorn -c gunicorn.conf.py main:app
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target

# Habilitar y iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable tecnomundo-api
sudo systemctl start tecnomundo-api
```

#### 6. Configurar Nginx

```bash
# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/api.tecnoapp.ar

# Contenido (ver deploy_backend.sh para configuración completa)

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/api.tecnoapp.ar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. Configurar SSL

```bash
# Instalar certificado Let's Encrypt
sudo certbot --nginx -d api.tecnoapp.ar

# Verificar renovación automática
sudo certbot renew --dry-run
```

### 🧪 Verificación y Testing

#### Verificar Servicios

```bash
# Estado del backend
sudo systemctl status tecnomundo-api

# Logs del backend
sudo journalctl -u tecnomundo-api -f

# Estado de Nginx
sudo systemctl status nginx

# Logs de Nginx
sudo tail -f /var/log/nginx/api.tecnoapp.ar.access.log
sudo tail -f /var/log/nginx/api.tecnoapp.ar.error.log
```

#### Probar Endpoints

```bash
# Prueba local
curl http://localhost:8001/
curl http://localhost:8001/hello
curl http://localhost:8001/docs

# Prueba externa
curl https://api.tecnoapp.ar/
curl https://api.tecnoapp.ar/hello
curl https://api.tecnoapp.ar/docs
```

#### Verificar CORS

```bash
# Probar desde el dominio del frontend
curl -H "Origin: https://tecnoapp.ar" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://api.tecnoapp.ar/api/v1/
```

### 🔄 Comandos de Mantenimiento

```bash
# Reiniciar backend
sudo systemctl restart tecnomundo-api

# Recargar configuración de Nginx
sudo systemctl reload nginx

# Ver logs en tiempo real
sudo journalctl -u tecnomundo-api -f

# Actualizar código
cd /home/apitecnoapp/htdocs/TecnoMundo_repair_mangement
git pull origin main
source venv/bin/activate
pip install -r backend/requirements.txt
sudo systemctl restart tecnomundo-api
```

### 🚨 Solución de Problemas

#### Backend no inicia

```bash
# Verificar logs
sudo journalctl -u tecnomundo-api --no-pager

# Verificar configuración
cd /home/apitecnoapp/htdocs/TecnoMundo_repair_mangement/backend
source ../venv/bin/activate
python -c "from app.core.config import settings; print(settings.DATABASE_URL)"
```

#### Error de conexión a base de datos

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"

# Probar conexión
python -c "
import psycopg2
conn = psycopg2.connect(
    host='localhost',
    database='tecnomundo_repair',
    user='tecnomundo_user',
    password='tu_password'
)
print('Conexión exitosa')
"
```

#### Error de CORS

- Verificar que `ALLOWED_ORIGINS` en `.env` incluya `https://tecnoapp.ar`
- Reiniciar el servicio después de cambios en `.env`

### 📊 Monitoreo

#### Logs importantes

- **Backend**: `sudo journalctl -u tecnomundo-api -f`
- **Nginx**: `/var/log/nginx/api.tecnoapp.ar.*.log`
- **Sistema**: `/var/log/syslog`

#### Métricas de rendimiento

```bash
# Uso de CPU y memoria
htop

# Conexiones activas
ss -tulpn | grep :8001

# Espacio en disco
df -h
```

### 🔐 Seguridad

- Certificado SSL renovado automáticamente
- Headers de seguridad configurados en Nginx
- Firewall configurado (solo puertos 22, 80, 443)
- Usuario no-root para la aplicación
- Variables de entorno protegidas

### 📞 Soporte

Si encuentras problemas:

1. Revisa los logs del servicio
2. Verifica la configuración de red y DNS
3. Confirma que PostgreSQL esté funcionando
4. Prueba la conectividad desde el frontend