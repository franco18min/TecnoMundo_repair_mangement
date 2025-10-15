# 🤖 NEXUS - Auto Initialization Script
# Sistema de activación automática para comandos naturales en español
# TecnoMundo Repair Management - Trae 2.0

param(
    [string]$NaturalPrompt = "",
    [string]$Action = "auto",
    [switch]$Force = $false,
    [switch]$Verbose = $false,
    [string]$Context = "auto"
)

# Configuración del sistema
$NEXUS_VERSION = "2.0.0"
$PROJECT_NAME = "TecnoMundo Repair Management"
$TRAE_DIR = ".trae"
$CONFIG_FILE = "$TRAE_DIR/activation/activation_config.json"
$CACHE_DIR = "$TRAE_DIR/cache"
$LOG_FILE = "$CACHE_DIR/nexus_activity.log"

# Colores para output
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Debug = "Gray"
}

function Write-NexusLog {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Escribir a archivo de log
    if (Test-Path $CACHE_DIR) {
        Add-Content -Path $LOG_FILE -Value $logEntry -Encoding UTF8
    }
    
    # Escribir a consola con colores
    $color = switch ($Level) {
        "SUCCESS" { $Colors.Success }
        "WARNING" { $Colors.Warning }
        "ERROR" { $Colors.Error }
        "DEBUG" { $Colors.Debug }
        default { $Colors.Info }
    }
    
    Write-Host $logEntry -ForegroundColor $color
}

function Initialize-NexusSystem {
    Write-NexusLog "🚀 Inicializando sistema NEXUS v$NEXUS_VERSION" "SUCCESS"
    
    # Verificar estructura de directorios
    $requiredDirs = @(
        "$TRAE_DIR/rules",
        "$TRAE_DIR/activation", 
        "$TRAE_DIR/optimization",
        "$TRAE_DIR/cache",
        "$TRAE_DIR/metrics",
        "$TRAE_DIR/automation"
    )
    
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-NexusLog "📁 Directorio creado: $dir" "INFO"
        }
    }
    
    # Cargar configuración
    if (Test-Path $CONFIG_FILE) {
        $global:NexusConfig = Get-Content $CONFIG_FILE | ConvertFrom-Json
        Write-NexusLog "⚙️ Configuración cargada desde $CONFIG_FILE" "SUCCESS"
    } else {
        Write-NexusLog "⚠️ Archivo de configuración no encontrado: $CONFIG_FILE" "WARNING"
        return $false
    }
    
    return $true
}

function Detect-NaturalCommand {
    param([string]$Prompt)
    
    if ([string]::IsNullOrWhiteSpace($Prompt)) {
        return $null
    }
    
    Write-NexusLog "🧠 Analizando comando natural: '$Prompt'" "INFO"
    
    # Normalizar prompt
    $normalizedPrompt = $Prompt.ToLower().Trim()
    
    # Remover prefijos comunes
    $prefixes = @("ai ", "nexus ", "por favor ", "puedes ", "podrías ")
    foreach ($prefix in $prefixes) {
        if ($normalizedPrompt.StartsWith($prefix)) {
            $normalizedPrompt = $normalizedPrompt.Substring($prefix.Length).Trim()
            break
        }
    }
    
    # Detectar categoría basada en palabras clave
    $categories = @{
        "development" = @("crear", "hacer", "generar", "implementar", "desarrollar", "construir")
        "debugging" = @("hay", "tengo", "error", "problema", "no funciona", "falla", "arreglar", "solucionar")
        "optimization" = @("optimizar", "mejorar", "acelerar", "reducir", "refactorizar", "limpiar")
        "testing" = @("probar", "testear", "verificar", "validar", "comprobar", "ejecutar tests")
        "documentation" = @("documentar", "explicar", "describir", "detallar", "generar docs")
    }
    
    $detectedCategory = "unknown"
    $confidence = 0.0
    
    foreach ($category in $categories.Keys) {
        foreach ($keyword in $categories[$category]) {
            if ($normalizedPrompt.Contains($keyword)) {
                $detectedCategory = $category
                $confidence = [Math]::Min(($keyword.Length / $normalizedPrompt.Length) * 2, 1.0)
                break
            }
        }
        if ($confidence -gt 0) { break }
    }
    
    # Detectar target/objetivo
    $targets = @("componente", "endpoint", "api", "modelo", "login", "dashboard", "usuario", "orden")
    $detectedTarget = "sistema"
    
    foreach ($target in $targets) {
        if ($normalizedPrompt.Contains($target)) {
            $detectedTarget = $target
            break
        }
    }
    
    # Detectar urgencia
    $urgencyHigh = @("urgente", "rápido", "inmediato", "ya", "ahora")
    $urgencyLow = @("después", "no urgente", "cuando tengas tiempo")
    $priority = "medium"
    
    foreach ($urgent in $urgencyHigh) {
        if ($normalizedPrompt.Contains($urgent)) {
            $priority = "high"
            break
        }
    }
    
    if ($priority -eq "medium") {
        foreach ($low in $urgencyLow) {
            if ($normalizedPrompt.Contains($low)) {
                $priority = "low"
                break
            }
        }
    }
    
    $result = @{
        original = $Prompt
        normalized = $normalizedPrompt
        category = $detectedCategory
        target = $detectedTarget
        priority = $priority
        confidence = $confidence
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    Write-NexusLog "🎯 Comando detectado - Categoría: $detectedCategory, Target: $detectedTarget, Confianza: $([Math]::Round($confidence, 2))" "SUCCESS"
    
    return $result
}

function Load-ProjectContext {
    param([string]$Category = "auto")
    
    Write-NexusLog "📋 Cargando contexto del proyecto..." "INFO"
    
    $contextData = @{
        project_info = @{
            name = $PROJECT_NAME
            type = "Full Stack Web Application"
            frontend = "React + Vite + TailwindCSS"
            backend = "FastAPI + PostgreSQL"
            authentication = "JWT"
        }
        
        structure = @{
            frontend_port = 5173
            backend_port = 8001
            database_port = 5432
        }
        
        recent_activity = @()
        cached_patterns = @()
        user_preferences = @()
    }
    
    # Cargar contexto específico según categoría
    switch ($Category) {
        "development" {
            $contextData.focus = "Desarrollo de componentes React y endpoints FastAPI"
            $contextData.tools = @("edit_file_fast_apply", "write_to_file", "search_codebase")
        }
        "debugging" {
            $contextData.focus = "Análisis de errores y resolución de problemas"
            $contextData.tools = @("search_by_regex", "view_files", "run_command")
        }
        "optimization" {
            $contextData.focus = "Mejora de rendimiento y optimización de código"
            $contextData.tools = @("search_codebase", "run_command", "view_files")
        }
        "testing" {
            $contextData.focus = "Ejecución de pruebas y validación"
            $contextData.tools = @("run_command", "write_to_file")
        }
        default {
            $contextData.focus = "Contexto general del proyecto"
            $contextData.tools = @("search_codebase", "view_files")
        }
    }
    
    # Guardar contexto en caché
    $contextFile = "$CACHE_DIR/current_context.json"
    $contextData | ConvertTo-Json -Depth 10 | Set-Content $contextFile -Encoding UTF8
    
    Write-NexusLog "✅ Contexto cargado y guardado en caché" "SUCCESS"
    return $contextData
}

function Generate-ExecutionPlan {
    param([hashtable]$CommandInfo, [hashtable]$Context)
    
    Write-NexusLog "📝 Generando plan de ejecución..." "INFO"
    
    $plan = @{
        command = $CommandInfo
        context = $Context
        strategy = "auto"
        estimated_tokens = 400
        estimated_time = "2-5 minutos"
        auto_execute = $true
        require_confirmation = $false
        tools_needed = @()
        cache_strategy = "use_existing"
    }
    
    # Ajustar plan según categoría
    switch ($CommandInfo.category) {
        "development" {
            $plan.estimated_tokens = 300
            $plan.auto_execute = $true
            $plan.tools_needed = @("edit_file_fast_apply", "write_to_file")
        }
        "debugging" {
            $plan.estimated_tokens = 600
            $plan.auto_execute = $false
            $plan.require_confirmation = $true
            $plan.tools_needed = @("search_by_regex", "view_files")
        }
        "optimization" {
            $plan.estimated_tokens = 500
            $plan.estimated_time = "5-10 minutos"
            $plan.tools_needed = @("search_codebase", "run_command")
        }
        "testing" {
            $plan.estimated_tokens = 250
            $plan.estimated_time = "1-3 minutos"
            $plan.tools_needed = @("run_command")
        }
    }
    
    # Ajustar por prioridad
    switch ($CommandInfo.priority) {
        "high" {
            $plan.estimated_tokens = [Math]::Floor($plan.estimated_tokens * 0.8)
            $plan.cache_strategy = "aggressive"
        }
        "low" {
            $plan.estimated_tokens = [Math]::Floor($plan.estimated_tokens * 1.2)
            $plan.cache_strategy = "detailed"
        }
    }
    
    # Guardar plan
    $planFile = "$CACHE_DIR/execution_plan.json"
    $plan | ConvertTo-Json -Depth 10 | Set-Content $planFile -Encoding UTF8
    
    Write-NexusLog "🎯 Plan de ejecución generado - Tokens estimados: $($plan.estimated_tokens)" "SUCCESS"
    return $plan
}

function Update-CommandHistory {
    param([hashtable]$CommandInfo, [hashtable]$ExecutionPlan)
    
    $historyFile = "$CACHE_DIR/command_history.json"
    $history = @()
    
    if (Test-Path $historyFile) {
        $history = Get-Content $historyFile | ConvertFrom-Json
    }
    
    $entry = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        command = $CommandInfo.original
        category = $CommandInfo.category
        target = $CommandInfo.target
        confidence = $CommandInfo.confidence
        estimated_tokens = $ExecutionPlan.estimated_tokens
        status = "prepared"
    }
    
    $history += $entry
    
    # Mantener solo los últimos 100 comandos
    if ($history.Count -gt 100) {
        $history = $history[-100..-1]
    }
    
    $history | ConvertTo-Json -Depth 10 | Set-Content $historyFile -Encoding UTF8
    Write-NexusLog "📚 Historial de comandos actualizado" "INFO"
}

function Show-ExecutionSummary {
    param([hashtable]$Plan)
    
    Write-Host "`n🤖 NEXUS - Resumen de Ejecución" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Comando: $($Plan.command.original)" -ForegroundColor White
    Write-Host "Categoría: $($Plan.command.category)" -ForegroundColor Yellow
    Write-Host "Objetivo: $($Plan.command.target)" -ForegroundColor Yellow
    Write-Host "Prioridad: $($Plan.command.priority)" -ForegroundColor Yellow
    Write-Host "Confianza: $([Math]::Round($Plan.command.confidence, 2))" -ForegroundColor Yellow
    Write-Host "Tokens estimados: $($Plan.estimated_tokens)" -ForegroundColor Green
    Write-Host "Tiempo estimado: $($Plan.estimated_time)" -ForegroundColor Green
    Write-Host "Ejecución automática: $($Plan.auto_execute)" -ForegroundColor $(if($Plan.auto_execute) { "Green" } else { "Red" })
    Write-Host "Herramientas: $($Plan.tools_needed -join ', ')" -ForegroundColor Magenta
    Write-Host "================================`n" -ForegroundColor Cyan
}

# Función principal
function Main {
    try {
        # Inicializar sistema
        if (-not (Initialize-NexusSystem)) {
            Write-NexusLog "❌ Error inicializando sistema NEXUS" "ERROR"
            exit 1
        }
        
        # Procesar según acción
        switch ($Action.ToLower()) {
            "auto" {
                if ([string]::IsNullOrWhiteSpace($NaturalPrompt)) {
                    Write-NexusLog "⚠️ No se proporcionó comando natural" "WARNING"
                    Write-Host "Uso: .\auto_init.ps1 -NaturalPrompt 'crear componente de login'" -ForegroundColor Yellow
                    exit 1
                }
                
                # Detectar comando natural
                $commandInfo = Detect-NaturalCommand -Prompt $NaturalPrompt
                
                if ($commandInfo.confidence -lt 0.6) {
                    Write-NexusLog "⚠️ Confianza insuficiente en el comando detectado ($($commandInfo.confidence))" "WARNING"
                    Write-Host "Comando no reconocido con suficiente confianza. Intenta ser más específico." -ForegroundColor Yellow
                    exit 1
                }
                
                # Cargar contexto
                $context = Load-ProjectContext -Category $commandInfo.category
                
                # Generar plan de ejecución
                $plan = Generate-ExecutionPlan -CommandInfo $commandInfo -Context $context
                
                # Actualizar historial
                Update-CommandHistory -CommandInfo $commandInfo -ExecutionPlan $plan
                
                # Mostrar resumen
                Show-ExecutionSummary -Plan $plan
                
                Write-NexusLog "🎉 Sistema NEXUS preparado para ejecutar comando" "SUCCESS"
            }
            
            "status" {
                Write-Host "🤖 NEXUS System Status" -ForegroundColor Cyan
                Write-Host "Versión: $NEXUS_VERSION" -ForegroundColor White
                Write-Host "Proyecto: $PROJECT_NAME" -ForegroundColor White
                Write-Host "Directorio .trae: $(if(Test-Path $TRAE_DIR) { '✅ Existe' } else { '❌ No existe' })" -ForegroundColor $(if(Test-Path $TRAE_DIR) { 'Green' } else { 'Red' })
                Write-Host "Configuración: $(if(Test-Path $CONFIG_FILE) { '✅ Cargada' } else { '❌ No encontrada' })" -ForegroundColor $(if(Test-Path $CONFIG_FILE) { 'Green' } else { 'Red' })
                
                if (Test-Path "$CACHE_DIR/command_history.json") {
                    $history = Get-Content "$CACHE_DIR/command_history.json" | ConvertFrom-Json
                    Write-Host "Comandos en historial: $($history.Count)" -ForegroundColor White
                }
            }
            
            "clean" {
                Write-NexusLog "🧹 Limpiando caché del sistema..." "INFO"
                if (Test-Path $CACHE_DIR) {
                    Remove-Item "$CACHE_DIR/*" -Recurse -Force
                    Write-NexusLog "✅ Caché limpiado" "SUCCESS"
                }
            }
            
            default {
                Write-Host "Acciones disponibles: auto, status, clean" -ForegroundColor Yellow
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