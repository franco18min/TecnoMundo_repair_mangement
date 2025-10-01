#!/bin/bash

# 🚀 Script de Despliegue Seguro - TecnoMundo
# Automatiza el proceso de despliegue con verificaciones de seguridad

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar prerrequisitos
check_prerequisites() {
    log_info "Verificando prerrequisitos..."
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        log_error "Git no está instalado"
        exit 1
    fi
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado"
        exit 1
    fi
    
    # Verificar Firebase CLI
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI no está instalado. Instalar con: npm install -g firebase-tools"
        exit 1
    fi
    
    # Verificar Python
    if ! command -v python &> /dev/null; then
        log_error "Python no está instalado"
        exit 1
    fi
    
    log_success "Prerrequisitos verificados"
}

# Función para ejecutar tests
run_tests() {
    log_info "Ejecutando tests..."
    
    # Tests del frontend
    cd "$FRONTEND_DIR"
    if [ -f "package.json" ]; then
        log_info "Ejecutando tests del frontend..."
        npm test -- --watchAll=false || {
            log_error "Tests del frontend fallaron"
            exit 1
        }
    fi
    
    # Tests del backend
    cd "$BACKEND_DIR"
    if [ -f "requirements.txt" ]; then
        log_info "Ejecutando tests del backend..."
        # Activar entorno virtual si existe
        if [ -d "venv" ]; then
            source venv/bin/activate || source venv/Scripts/activate
        fi
        
        # Ejecutar tests si existen
        if [ -f "test_*.py" ] || [ -d "tests" ]; then
            python -m pytest || {
                log_error "Tests del backend fallaron"
                exit 1
            }
        fi
    fi
    
    log_success "Todos los tests pasaron"
}

# Función para verificar el estado del repositorio
check_git_status() {
    log_info "Verificando estado de Git..."
    
    cd "$PROJECT_ROOT"
    
    # Verificar que no hay cambios sin commit
    if [ -n "$(git status --porcelain)" ]; then
        log_error "Hay cambios sin commit. Commit todos los cambios antes de desplegar."
        git status
        exit 1
    fi
    
    # Verificar que estamos en la rama correcta
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "staging" ]; then
        log_warning "No estás en la rama main o staging. Rama actual: $current_branch"
        read -p "¿Continuar? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_success "Estado de Git verificado"
}

# Función para crear backup
create_backup() {
    log_info "Creando backup..."
    
    # Crear directorio de backup si no existe
    backup_dir="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup de configuración
    cp -r "$PROJECT_ROOT/.env"* "$backup_dir/" 2>/dev/null || true
    cp -r "$FRONTEND_DIR/.env"* "$backup_dir/" 2>/dev/null || true
    
    # Backup de la base de datos (si es local)
    if [ -f "$PROJECT_ROOT/database.db" ]; then
        cp "$PROJECT_ROOT/database.db" "$backup_dir/"
    fi
    
    log_success "Backup creado en: $backup_dir"
}

# Función para desplegar a staging
deploy_staging() {
    log_info "Desplegando a staging..."
    
    # Crear rama de staging si no existe
    cd "$PROJECT_ROOT"
    staging_branch="staging/$(date +%Y%m%d_%H%M%S)"
    git checkout -b "$staging_branch" || git checkout "$staging_branch"
    
    # Desplegar frontend a staging
    cd "$FRONTEND_DIR"
    log_info "Construyendo frontend para staging..."
    npm run build || {
        log_error "Build del frontend falló"
        exit 1
    }
    
    # Desplegar a Firebase staging
    firebase use staging || {
        log_error "No se pudo cambiar a proyecto de staging"
        exit 1
    }
    
    firebase deploy --only hosting:staging || {
        log_error "Despliegue a Firebase staging falló"
        exit 1
    }
    
    log_success "Despliegue a staging completado"
    log_info "URL de staging: https://tecnomundo-staging.web.app"
}

# Función para verificar staging
verify_staging() {
    log_info "Verificando staging..."
    
    # URLs de staging
    STAGING_FRONTEND="https://tecnomundo-staging.web.app"
    STAGING_BACKEND="https://tecnomundo-backend-staging.onrender.com"
    
    # Verificar frontend
    if curl -f -s "$STAGING_FRONTEND" > /dev/null; then
        log_success "Frontend staging responde correctamente"
    else
        log_error "Frontend staging no responde"
        exit 1
    fi
    
    # Verificar backend
    if curl -f -s "$STAGING_BACKEND/health" > /dev/null; then
        log_success "Backend staging responde correctamente"
    else
        log_warning "Backend staging no responde (puede estar iniciando)"
    fi
    
    log_info "Verifica manualmente las funcionalidades en staging antes de continuar"
    read -p "¿Staging funciona correctamente? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Staging no funciona correctamente. Abortando despliegue."
        exit 1
    fi
}

# Función para desplegar a producción
deploy_production() {
    log_info "Desplegando a producción..."
    
    cd "$PROJECT_ROOT"
    
    # Crear tag de release
    version="v$(date +%Y.%m.%d.%H%M)"
    git tag -a "$version" -m "Release $version"
    git push origin "$version"
    
    # Merge a main
    git checkout main
    git merge --no-ff "$staging_branch" -m "Deploy $version to production"
    git push origin main
    
    # Desplegar frontend a producción
    cd "$FRONTEND_DIR"
    log_info "Construyendo frontend para producción..."
    npm run build || {
        log_error "Build del frontend para producción falló"
        exit 1
    }
    
    # Desplegar a Firebase producción
    firebase use production || {
        log_error "No se pudo cambiar a proyecto de producción"
        exit 1
    }
    
    firebase deploy --only hosting || {
        log_error "Despliegue a Firebase producción falló"
        exit 1
    }
    
    log_success "Despliegue a producción completado"
    log_info "URL de producción: https://tecnomundo.web.app"
}

# Función para verificar producción
verify_production() {
    log_info "Verificando producción..."
    
    # URLs de producción
    PROD_FRONTEND="https://tecnomundo.web.app"
    PROD_BACKEND="https://tecnomundo-backend.onrender.com"
    
    # Verificar frontend
    if curl -f -s "$PROD_FRONTEND" > /dev/null; then
        log_success "Frontend producción responde correctamente"
    else
        log_error "Frontend producción no responde"
        exit 1
    fi
    
    # Verificar backend
    if curl -f -s "$PROD_BACKEND/health" > /dev/null; then
        log_success "Backend producción responde correctamente"
    else
        log_warning "Backend producción no responde (puede estar iniciando)"
    fi
    
    log_success "Verificación de producción completada"
}

# Función para rollback
rollback() {
    log_warning "Iniciando rollback..."
    
    cd "$FRONTEND_DIR"
    
    # Rollback del frontend
    firebase use production
    firebase hosting:clone tecnomundo:previous tecnomundo:current || {
        log_error "Rollback del frontend falló"
        exit 1
    }
    
    log_success "Rollback completado"
    log_info "Revisa el backend en Render para rollback manual si es necesario"
}

# Función principal
main() {
    echo "🚀 TecnoMundo - Script de Despliegue Seguro"
    echo "=========================================="
    
    case "${1:-}" in
        "staging")
            check_prerequisites
            check_git_status
            run_tests
            create_backup
            deploy_staging
            verify_staging
            ;;
        "production")
            check_prerequisites
            check_git_status
            run_tests
            create_backup
            deploy_staging
            verify_staging
            deploy_production
            verify_production
            ;;
        "rollback")
            rollback
            ;;
        "test")
            check_prerequisites
            run_tests
            ;;
        *)
            echo "Uso: $0 {staging|production|rollback|test}"
            echo ""
            echo "Comandos:"
            echo "  staging     - Desplegar solo a staging"
            echo "  production  - Desplegar a staging y luego a producción"
            echo "  rollback    - Hacer rollback de producción"
            echo "  test        - Ejecutar solo tests"
            exit 1
            ;;
    esac
}

# Ejecutar función principal con argumentos
main "$@"