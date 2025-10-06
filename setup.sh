#!/bin/bash

# =============================================================================
# 🚀 Script de Configuración para Jules - TecnoMundo Repair Management
# =============================================================================
# Este script configura automáticamente el entorno de desarrollo completo
# para el sistema de gestión de reparaciones TecnoMundo
# =============================================================================

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_step() {
    echo -e "${BLUE}📋 Paso $1: $2${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# =============================================================================
# CONFIGURACIÓN INICIAL
# =============================================================================

echo "🎯 Iniciando configuración de TecnoMundo Repair Management..."
echo "=" * 80

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Error: No se detectó la estructura del proyecto TecnoMundo"
    print_info "Asegúrate de estar en el directorio raíz del proyecto"
    exit 1
fi

print_success "Estructura del proyecto verificada"

# =============================================================================
# PASO 1: CONFIGURACIÓN DEL SISTEMA
# =============================================================================

print_step 1 "Configurando dependencias del sistema"

# Actualizar sistema (Ubuntu/Debian)
if command -v apt-get &> /dev/null; then
    print_info "Actualizando paquetes del sistema..."
    sudo apt-get update -qq
    sudo apt-get install -y curl wget git build-essential
fi

# Verificar Python 3.8+
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 no está instalado"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
print_success "Python $PYTHON_VERSION detectado"

# Verificar Node.js 18+
if ! command -v node &> /dev/null; then
    print_info "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION detectado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está disponible"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm $NPM_VERSION detectado"

# =============================================================================
# PASO 2: CONFIGURACIÓN DEL BACKEND
# =============================================================================

print_step 2 "Configurando Backend (FastAPI + Python)"

cd backend

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    print_info "Creando entorno virtual de Python..."
    python3 -m venv venv
fi

# Activar entorno virtual
print_info "Activando entorno virtual..."
source venv/bin/activate

# Actualizar pip
print_info "Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias del backend
print_info "Instalando dependencias de Python..."
pip install -r requirements.txt

print_success "Backend configurado correctamente"

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    print_info "Creando archivo de configuración .env para MCP..."
    cat > .env << EOF
# =============================================================================
# 🔧 Configuración de TecnoMundo Repair Management - Desarrollo con MCP
# =============================================================================

# --- Configuración MCP ---
# El sistema usará MCP de Supabase para consultas de base de datos
# No se requieren credenciales directas de DB
USE_MCP=true
MCP_ENABLED=true

# --- Configuración de CORS ---
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# --- Configuración de Autenticación ---
SECRET_KEY=tu_clave_secreta_super_segura_aqui_cambiar_en_produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# --- Configuración de la Aplicación ---
APP_NAME=TecnoMundo Repair Management
APP_VERSION=1.0.0
DEBUG=true
ENVIRONMENT=development

# --- Configuración de Archivos ---
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# --- Configuración de Redis (opcional) ---
REDIS_URL=redis://localhost:6379

# --- Configuración de Email (opcional) ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# === NOTA IMPORTANTE ===
# Este proyecto está configurado para usar MCP de Supabase
# Las consultas de base de datos se realizan a través del MCP
# No se requiere configuración directa de PostgreSQL
EOF
    print_success "Archivo .env creado para MCP"
    print_warning "Sistema configurado para usar MCP de Supabase"
else
    print_info "Archivo .env ya existe, manteniéndolo"
fi

cd ..

# =============================================================================
# PASO 3: CONFIGURACIÓN DEL FRONTEND
# =============================================================================

print_step 3 "Configurando Frontend (React + Vite)"

cd frontend

# Instalar dependencias del frontend
print_info "Instalando dependencias de Node.js..."
npm install

# Crear archivo de configuración de desarrollo si no existe
if [ ! -f ".env.local" ]; then
    print_info "Creando archivo de configuración del frontend..."
    cat > .env.local << EOF
# =============================================================================
# 🎨 Configuración del Frontend - TecnoMundo Repair Management
# =============================================================================

# URL del Backend API
VITE_API_URL=http://localhost:8001

# URL del WebSocket
VITE_WS_URL=ws://localhost:8001/ws

# Configuración de Firebase (opcional)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Configuración de desarrollo
VITE_APP_NAME=TecnoMundo Repair Management
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
EOF
    print_success "Archivo .env.local creado"
else
    print_info "Archivo .env.local ya existe, manteniéndolo"
fi

print_success "Frontend configurado correctamente"

cd ..

# =============================================================================
# PASO 4: CONFIGURACIÓN MCP DE SUPABASE
# =============================================================================

print_step 4 "Verificando configuración MCP de Supabase"

# Verificar que existe el archivo MCP
if [ -f ".kilocode/mcp.json" ]; then
    print_success "Configuración MCP de Supabase encontrada"
    print_info "El sistema usará MCP para consultas de base de datos"
    print_info "Schemas configurados: system, customer"
else
    print_warning "Archivo MCP no encontrado en .kilocode/mcp.json"
    print_info "Asegúrate de que Jules tenga acceso al MCP de Supabase"
fi

print_success "Configuración MCP verificada"
print_info "Nota: Utiliza MCP de Supabase para revisar schemas customer y system" 

# =============================================================================
# PASO 5: CONFIGURACIÓN DE SCRIPTS DE UTILIDAD
# =============================================================================

print_step 5 "Creando scripts de utilidad"

# Script para iniciar el backend
cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando Backend de TecnoMundo..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8001
EOF

# Script para iniciar el frontend
cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "🎨 Iniciando Frontend de TecnoMundo..."
cd frontend
npm run dev
EOF

# Script para iniciar ambos servicios
cat > start_all.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando TecnoMundo Repair Management..."

# Función para manejar la señal de interrupción
cleanup() {
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar backend en segundo plano
echo "📡 Iniciando Backend..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8001 &
BACKEND_PID=$!
cd ..

# Esperar un momento para que el backend inicie
sleep 3

# Iniciar frontend en segundo plano
echo "🎨 Iniciando Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Servicios iniciados:"
echo "   - Backend: http://localhost:8001"
echo "   - Frontend: http://localhost:5173"
echo "   - API Docs: http://localhost:8001/docs"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"

# Esperar a que terminen los procesos
wait $BACKEND_PID $FRONTEND_PID
EOF

# Hacer ejecutables los scripts
chmod +x start_backend.sh start_frontend.sh start_all.sh

print_success "Scripts de utilidad creados"

# =============================================================================
# PASO 6: CONFIGURACIÓN DE HERRAMIENTAS DE DESARROLLO
# =============================================================================

print_step 6 "Configurando herramientas de desarrollo"

# Instalar herramientas globales útiles
print_info "Instalando herramientas de desarrollo..."
npm install -g @supabase/mcp-server-postgrest 2>/dev/null || print_warning "MCP Supabase no disponible"

# Crear archivo de configuración para VSCode si no existe
if [ ! -d ".vscode" ]; then
    mkdir -p .vscode
    
    cat > .vscode/settings.json << 'EOF'
{
    "python.defaultInterpreterPath": "./backend/venv/bin/python",
    "python.terminal.activateEnvironment": true,
    "eslint.workingDirectories": ["frontend"],
    "typescript.preferences.includePackageJsonAutoImports": "on",
    "files.exclude": {
        "**/node_modules": true,
        "**/__pycache__": true,
        "**/venv": true,
        "**/.git": true
    },
    "search.exclude": {
        "**/node_modules": true,
        "**/venv": true,
        "**/.git": true
    }
}
EOF

    cat > .vscode/launch.json << 'EOF'
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "FastAPI Backend",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/backend/venv/bin/uvicorn",
            "args": ["main:app", "--reload", "--port", "8001"],
            "cwd": "${workspaceFolder}/backend",
            "console": "integratedTerminal"
        }
    ]
}
EOF

    print_success "Configuración de VSCode creada"
fi

# =============================================================================
# PASO 7: VERIFICACIÓN FINAL
# =============================================================================

print_step 7 "Verificando instalación"

# Verificar backend
cd backend
source venv/bin/activate

print_info "Verificando dependencias del backend..."
python -c "
import fastapi
import sqlalchemy
import uvicorn
print('✅ Dependencias del backend verificadas')
" || print_error "Error en dependencias del backend"

cd ..

# Verificar frontend
cd frontend
print_info "Verificando dependencias del frontend..."
npm list react react-dom vite > /dev/null 2>&1 && print_success "Dependencias del frontend verificadas" || print_warning "Algunas dependencias del frontend pueden faltar"
cd ..

# =============================================================================
# FINALIZACIÓN
# =============================================================================

echo ""
echo "🎉 ¡Configuración completada exitosamente!"
echo "=" * 80
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. 🗄️  Configurar tu base de datos PostgreSQL:"
echo "   - Crear base de datos: createdb tecnomundo_dev"
echo "   - Configurar usuario y permisos"
echo "   - Actualizar variables en backend/.env"
echo ""
echo "2. 🚀 Iniciar los servicios:"
echo "   - Backend: ./start_backend.sh"
echo "   - Frontend: ./start_frontend.sh"
echo "   - Ambos: ./start_all.sh"
echo ""
echo "3. 🌐 URLs de desarrollo:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:8001"
echo "   - Documentación: http://localhost:8001/docs"
echo ""
echo "4. 🔐 Credenciales de prueba:"
echo "   - Admin: admin / admin123"
echo "   - Técnico: tecnico1 / tecnico123"
echo ""
echo "5. 📚 Documentación adicional:"
echo "   - README.md: Información general"
echo "   - docs/: Documentación técnica"
echo ""
print_success "¡TecnoMundo Repair Management está listo para usar!"
echo ""