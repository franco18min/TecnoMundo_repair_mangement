# 🚀 NEXUS - Script de Inicialización Simplificado
# TecnoMundo Repair Management - Sistema Autónomo v2.0

param(
    [string]$Action = "init",
    [string]$NaturalPrompt = "",
    [switch]$Verbose = $false
)

# Variables globales
$NEXUS_VERSION = "2.0.0"
$PROJECT_NAME = "TecnoMundo Repair Management"
$TRAE_DIR = ".\.trae"
$CONFIG_FILE = "$TRAE_DIR\config\nexus_config.yaml"
$CACHE_DIR = "$TRAE_DIR\cache"

# Función de logging
function Write-NexusLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry -ForegroundColor $color
}

# Función principal de inicialización
function Initialize-NexusSystem {
    Write-NexusLog "🚀 Inicializando sistema NEXUS v$NEXUS_VERSION" "SUCCESS"
    
    # Verificar y crear directorios necesarios
    $requiredDirs = @(
        "$TRAE_DIR\rules",
        "$TRAE_DIR\activation", 
        "$TRAE_DIR\optimization",
        "$TRAE_DIR\cache",
        "$TRAE_DIR\metrics",
        "$TRAE_DIR\automation",
        "$TRAE_DIR\config",
        "$TRAE_DIR\docs",
        "$TRAE_DIR\integration",
        "$TRAE_DIR\logs"
    )
    
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-NexusLog "📁 Directorio creado: $dir" "INFO"
        }
    }
    
    # Verificar archivos de configuración críticos
    $criticalFiles = @(
        "$TRAE_DIR\rules\user_rules.md",
        "$TRAE_DIR\rules\project_rules.yaml",
        "$TRAE_DIR\config\nexus_config.yaml"
    )
    
    $allFilesExist = $true
    foreach ($file in $criticalFiles) {
        if (Test-Path $file) {
            Write-NexusLog "✅ Archivo encontrado: $file" "SUCCESS"
        } else {
            Write-NexusLog "❌ Archivo faltante: $file" "ERROR"
            $allFilesExist = $false
        }
    }
    
    if ($allFilesExist) {
        Write-NexusLog "🎉 Todos los archivos de configuración están presentes" "SUCCESS"
    } else {
        Write-NexusLog "⚠️ Algunos archivos de configuración faltan" "WARNING"
    }
    
    # Crear archivo de estado del sistema
    $systemStatus = @{
        version = $NEXUS_VERSION
        project = $PROJECT_NAME
        initialized = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        status = "ACTIVE"
        natural_commands = "ENABLED"
        auto_execution = "ENABLED"
        context_cache = "ENABLED"
        optimization = "ENABLED"
    }
    
    $statusFile = "$CACHE_DIR\system_status.json"
    $systemStatus | ConvertTo-Json -Depth 3 | Out-File -FilePath $statusFile -Encoding UTF8
    Write-NexusLog "📊 Estado del sistema guardado en: $statusFile" "INFO"
    
    return $true
}

# Función para mostrar estado del sistema
function Show-SystemStatus {
    Write-Host "`n🤖 NEXUS System Status" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Versión: $NEXUS_VERSION" -ForegroundColor White
    Write-Host "Proyecto: $PROJECT_NAME" -ForegroundColor White
    
    # Verificar directorios
    Write-Host "`n📁 Estructura de directorios:" -ForegroundColor Yellow
    $dirs = @("rules", "activation", "optimization", "cache", "metrics", "automation", "config", "docs")
    foreach ($dir in $dirs) {
        $path = "$TRAE_DIR\$dir"
        $status = if (Test-Path $path) { "✅" } else { "❌" }
        Write-Host "  $status $dir" -ForegroundColor $(if (Test-Path $path) { "Green" } else { "Red" })
    }
    
    # Verificar archivos críticos
    Write-Host "`n📄 Archivos de configuración:" -ForegroundColor Yellow
    $files = @(
        @{name="user_rules.md"; path="$TRAE_DIR\rules\user_rules.md"},
        @{name="project_rules.yaml"; path="$TRAE_DIR\rules\project_rules.yaml"},
        @{name="nexus_config.yaml"; path="$TRAE_DIR\config\nexus_config.yaml"}
    )
    
    foreach ($file in $files) {
        $status = if (Test-Path $file.path) { "✅" } else { "❌" }
        Write-Host "  $status $($file.name)" -ForegroundColor $(if (Test-Path $file.path) { "Green" } else { "Red" })
    }
    
    # Estado del cache
    Write-Host "`n💾 Sistema de cache:" -ForegroundColor Yellow
    if (Test-Path "$CACHE_DIR\system_status.json") {
        $status = Get-Content "$CACHE_DIR\system_status.json" | ConvertFrom-Json
        Write-Host "  ✅ Cache activo desde: $($status.initialized)" -ForegroundColor Green
        Write-Host "  ✅ Comandos naturales: $($status.natural_commands)" -ForegroundColor Green
        Write-Host "  ✅ Ejecución automática: $($status.auto_execution)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Cache no inicializado" -ForegroundColor Red
    }
    
    Write-Host "`n================================" -ForegroundColor Cyan
}

# Función para limpiar cache
function Clear-NexusCache {
    Write-NexusLog "🧹 Limpiando cache del sistema NEXUS..." "INFO"
    
    if (Test-Path $CACHE_DIR) {
        $files = Get-ChildItem $CACHE_DIR -File
        foreach ($file in $files) {
            Remove-Item $file.FullName -Force
            Write-NexusLog "🗑️ Eliminado: $($file.Name)" "INFO"
        }
        Write-NexusLog "✅ Cache limpiado exitosamente" "SUCCESS"
    } else {
        Write-NexusLog "⚠️ Directorio de cache no existe" "WARNING"
    }
}

# Función principal
function Main {
    try {
        Write-Host "`n🤖 NEXUS - Sistema de Desarrollo Autónomo" -ForegroundColor Magenta
        Write-Host "Versión: $NEXUS_VERSION" -ForegroundColor White
        Write-Host "Proyecto: $PROJECT_NAME`n" -ForegroundColor White
        
        switch ($Action.ToLower()) {
            "init" {
                if (Initialize-NexusSystem) {
                    Write-NexusLog "🎉 Sistema NEXUS inicializado exitosamente" "SUCCESS"
                    Write-Host "`n✨ NEXUS está listo para comandos naturales en español:" -ForegroundColor Green
                    Write-Host "   • 'crear componente de login'" -ForegroundColor Cyan
                    Write-Host "   • 'hay error en autenticación'" -ForegroundColor Cyan
                    Write-Host "   • 'optimizar rendimiento'" -ForegroundColor Cyan
                    Write-Host "   • 'probar sistema completo'`n" -ForegroundColor Cyan
                } else {
                    Write-NexusLog "❌ Error inicializando sistema NEXUS" "ERROR"
                    exit 1
                }
            }
            
            "status" {
                Show-SystemStatus
            }
            
            "clean" {
                Clear-NexusCache
            }
            
            "test" {
                Write-NexusLog "🧪 Ejecutando prueba de integración..." "INFO"
                if (Test-Path "$TRAE_DIR\integration\test_integration.py") {
                    python "$TRAE_DIR\integration\test_integration.py"
                } else {
                    Write-NexusLog "❌ Script de prueba no encontrado" "ERROR"
                }
            }
            
            default {
                Write-Host "Acciones disponibles:" -ForegroundColor Yellow
                Write-Host "  init   - Inicializar sistema NEXUS" -ForegroundColor Cyan
                Write-Host "  status - Mostrar estado del sistema" -ForegroundColor Cyan
                Write-Host "  clean  - Limpiar cache" -ForegroundColor Cyan
                Write-Host "  test   - Ejecutar pruebas de integración" -ForegroundColor Cyan
                Write-Host "`nEjemplo: .\nexus_init_simple.ps1 -Action init" -ForegroundColor White
            }
        }
        
    } catch {
        Write-NexusLog "❌ Error en ejecución: $($_.Exception.Message)" "ERROR"
        if ($Verbose) {
            Write-Host $_.Exception.StackTrace -ForegroundColor Red
        }
        exit 1
    }
}

# Ejecutar función principal
Main