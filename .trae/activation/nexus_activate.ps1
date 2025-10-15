# NEXUS - Sistema de Activacion v2.0
# TecnoMundo Repair Management

param(
    [string]$Action = "init"
)

$NEXUS_VERSION = "2.0.0"
$PROJECT_NAME = "TecnoMundo Repair Management"
$TRAE_DIR = ".\.trae"

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Initialize-System {
    Write-Log "Inicializando sistema NEXUS v$NEXUS_VERSION" "Green"
    
    # Crear directorios necesarios
    $dirs = @("rules", "activation", "optimization", "cache", "metrics", "automation", "config", "docs", "integration", "logs")
    
    foreach ($dir in $dirs) {
        $path = "$TRAE_DIR\$dir"
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
            Write-Log "Directorio creado: $dir" "Cyan"
        }
    }
    
    # Verificar archivos criticos
    $files = @(
        "$TRAE_DIR\rules\user_rules.md",
        "$TRAE_DIR\rules\project_rules.yaml",
        "$TRAE_DIR\config\nexus_config.yaml"
    )
    
    $allExist = $true
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Log "Archivo encontrado: $(Split-Path $file -Leaf)" "Green"
        } else {
            Write-Log "Archivo faltante: $(Split-Path $file -Leaf)" "Red"
            $allExist = $false
        }
    }
    
    # Crear estado del sistema
    $status = @{
        version = $NEXUS_VERSION
        project = $PROJECT_NAME
        initialized = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        status = "ACTIVE"
        natural_commands = "ENABLED"
    }
    
    $statusFile = "$TRAE_DIR\cache\system_status.json"
    $status | ConvertTo-Json | Out-File -FilePath $statusFile -Encoding UTF8
    
    if ($allExist) {
        Write-Log "Sistema NEXUS inicializado exitosamente!" "Green"
        Write-Log "Comandos naturales disponibles:" "Yellow"
        Write-Log "  - crear componente de login" "Cyan"
        Write-Log "  - hay error en autenticacion" "Cyan"
        Write-Log "  - optimizar rendimiento" "Cyan"
        Write-Log "  - probar sistema completo" "Cyan"
        return $true
    } else {
        Write-Log "Algunos archivos de configuracion faltan" "Yellow"
        return $false
    }
}

function Show-Status {
    Write-Log "NEXUS System Status" "Magenta"
    Write-Log "===================" "Magenta"
    Write-Log "Version: $NEXUS_VERSION" "White"
    Write-Log "Proyecto: $PROJECT_NAME" "White"
    
    # Verificar directorios
    Write-Log "" "White"
    Write-Log "Directorios:" "Yellow"
    $dirs = @("rules", "activation", "optimization", "cache", "metrics", "automation", "config", "docs")
    foreach ($dir in $dirs) {
        $path = "$TRAE_DIR\$dir"
        $status = if (Test-Path $path) { "OK" } else { "FALTA" }
        $color = if (Test-Path $path) { "Green" } else { "Red" }
        Write-Log "  $dir : $status" $color
    }
    
    # Verificar archivos
    Write-Log "" "White"
    Write-Log "Archivos de configuracion:" "Yellow"
    $files = @(
        "user_rules.md",
        "project_rules.yaml", 
        "nexus_config.yaml"
    )
    
    foreach ($file in $files) {
        $fullPath = if ($file -eq "nexus_config.yaml") { "$TRAE_DIR\config\$file" } else { "$TRAE_DIR\rules\$file" }
        $status = if (Test-Path $fullPath) { "OK" } else { "FALTA" }
        $color = if (Test-Path $fullPath) { "Green" } else { "Red" }
        Write-Log "  $file : $status" $color
    }
    
    # Estado del cache
    Write-Log "" "White"
    Write-Log "Cache del sistema:" "Yellow"
    if (Test-Path "$TRAE_DIR\cache\system_status.json") {
        Write-Log "  Cache activo: OK" "Green"
    } else {
        Write-Log "  Cache activo: NO" "Red"
    }
}

function Clear-Cache {
    Write-Log "Limpiando cache del sistema..." "Yellow"
    
    if (Test-Path "$TRAE_DIR\cache") {
        $files = Get-ChildItem "$TRAE_DIR\cache" -File
        foreach ($file in $files) {
            Remove-Item $file.FullName -Force
        }
        Write-Log "Cache limpiado exitosamente" "Green"
    } else {
        Write-Log "Directorio de cache no existe" "Yellow"
    }
}

# Funcion principal
try {
    Write-Log "" "White"
    Write-Log "NEXUS - Sistema de Desarrollo Autonomo" "Magenta"
    Write-Log "Version: $NEXUS_VERSION" "White"
    Write-Log "Proyecto: $PROJECT_NAME" "White"
    Write-Log "" "White"
    
    switch ($Action.ToLower()) {
        "init" {
            if (Initialize-System) {
                Write-Log "" "White"
                Write-Log "NEXUS esta listo para usar!" "Green"
            } else {
                Write-Log "Error en la inicializacion" "Red"
                exit 1
            }
        }
        
        "status" {
            Show-Status
        }
        
        "clean" {
            Clear-Cache
        }
        
        default {
            Write-Log "Acciones disponibles:" "Yellow"
            Write-Log "  init   - Inicializar sistema" "Cyan"
            Write-Log "  status - Mostrar estado" "Cyan"
            Write-Log "  clean  - Limpiar cache" "Cyan"
        }
    }
    
} catch {
    Write-Log "Error: $($_.Exception.Message)" "Red"
    exit 1
}