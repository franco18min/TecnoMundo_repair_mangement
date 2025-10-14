# 🚀 Auto-Inicialización de Contexto para IA
# Este script permite a la IA auto-detectar y establecer contexto automáticamente

param(
    [string]$action = "init",
    [string]$objective = "",
    [switch]$force = $false
)

# Función para detectar archivos modificados
function Get-ModifiedFiles {
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) {
        return $gitStatus | Where-Object { $_ -match "^M " } | ForEach-Object { $_.Substring(3) }
    }
    return @()
}

# Función para inferir objetivo basado en commits recientes
function Get-InferredObjective {
    $lastCommit = git log -1 --pretty=format:"%s" 2>$null
    if ($lastCommit) {
        return $lastCommit
    }
    return "Desarrollo continuo"
}

# Función para detectar funciones modificadas
function Get-ModifiedFunctions {
    $modifiedFiles = Get-ModifiedFiles
    $functions = @()
    
    foreach ($file in $modifiedFiles) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw
            # Detectar funciones JavaScript/React
            $jsMatches = [regex]::Matches($content, '(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*:\s*function)')
            foreach ($match in $jsMatches) {
                $funcName = $match.Groups[1].Value + $match.Groups[2].Value + $match.Groups[3].Value
                if ($funcName) {
                    $functions += "$file::$funcName"
                }
            }
            
            # Detectar funciones Python
            $pyMatches = [regex]::Matches($content, 'def\s+(\w+)')
            foreach ($match in $pyMatches) {
                $functions += "$file::$($match.Groups[1].Value)"
            }
        }
    }
    
    return $functions
}

# Función para crear contexto automático
function Initialize-Context {
    param([string]$objective)
    
    $modifiedFiles = Get-ModifiedFiles
    $inferredObjective = if ($objective) { $objective } else { Get-InferredObjective }
    $modifiedFunctions = Get-ModifiedFunctions
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    
    # Crear session_tracker.md automáticamente
    $sessionContent = @"
# 🎯 Session Tracker - Desarrollo Activo (Auto-generado)

> **Sesión iniciada**: $timestamp
> **Objetivo**: $inferredObjective

## 📊 Estado de la Sesión Actual

### 🎯 Objetivo Principal
``````
TAREA_PRINCIPAL: "$inferredObjective"
ARCHIVOS_OBJETIVO: [$($modifiedFiles -join ', ')]
FUNCIONES_OBJETIVO: [$($modifiedFunctions -join ', ')]
PROGRESO: "Auto-detectado - listo para continuar"
``````

### 🔧 Archivos en Trabajo
``````yaml
archivo_principal:
  path: "$($modifiedFiles[0])"
  lineas_modificadas: []
  funciones_afectadas: [$($modifiedFunctions[0])]
  estado: "detectado_automaticamente"

archivos_relacionados:
$(foreach ($file in $modifiedFiles[1..($modifiedFiles.Count-1)]) {
"  - path: `"$file`"
    relacion: `"modificado_recientemente`"
    estado: `"detectado`""
})
``````

### 🐛 Errores de Esta Sesión
``````yaml
# No hay errores detectados automáticamente
# La IA documentará errores aquí conforme los encuentre
``````

### ✅ Completado en Esta Sesión
- [x] Auto-detección de contexto completada
- [ ] Continuar con objetivo: $inferredObjective
- [ ] Revisar archivos modificados: $($modifiedFiles.Count) archivos
- [ ] Verificar funciones afectadas: $($modifiedFunctions.Count) funciones

## 🔄 Historial de Acciones Auto-detectadas
- **$timestamp**: Contexto inicializado automáticamente
- **Archivos detectados**: $($modifiedFiles.Count) archivos modificados
- **Funciones detectadas**: $($modifiedFunctions.Count) funciones identificadas
- **Objetivo inferido**: $inferredObjective

## 📋 Comandos Rápidos para Esta Sesión
``````bash
# Ver estado actual
git status --porcelain

# Ver último commit
git log -1 --oneline

# Ver archivos modificados
git diff --name-only

# Buscar función específica en archivos modificados
$(foreach ($func in $modifiedFunctions) {
$parts = $func -split '::'
"grep -n `"$($parts[1])`" `"$($parts[0])`""
})
``````
"@

    # Escribir session_tracker.md
    $sessionContent | Out-File -FilePath ".trae\session_tracker.md" -Encoding UTF8
    
    # Actualizar context_cache.md con información actual
    Update-ContextCache -files $modifiedFiles -functions $modifiedFunctions -objective $inferredObjective
    
    Write-Host "✅ Contexto inicializado automáticamente" -ForegroundColor Green
    Write-Host "📁 Archivos detectados: $($modifiedFiles.Count)" -ForegroundColor Cyan
    Write-Host "🔧 Funciones detectadas: $($modifiedFunctions.Count)" -ForegroundColor Cyan
    Write-Host "🎯 Objetivo: $inferredObjective" -ForegroundColor Yellow
}

# Función para actualizar context_cache.md
function Update-ContextCache {
    param(
        [array]$files,
        [array]$functions,
        [string]$objective
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $lastCommit = git log -1 --pretty=format:"%h - %s" 2>$null
    
    # Leer context_cache existente o crear nuevo
    $cacheFile = ".trae\context_cache.md"
    if (Test-Path $cacheFile) {
        $content = Get-Content $cacheFile -Raw
        
        # Actualizar sección de archivos activos
        $newActiveFiles = @"
ARCHIVOS_ACTIVOS: [$($files -join ', ')]
FUNCIONES_EN_DESARROLLO: [$($functions -join ', ')]
ERRORES_PENDIENTES: []
ULTIMA_MODIFICACION: "$timestamp - $objective"
"@
        
        $content = $content -replace 'ARCHIVOS_ACTIVOS: \[.*?\][\s\S]*?ULTIMA_MODIFICACION: ".*?"', $newActiveFiles
        
        # Actualizar cambios recientes
        $newChange = "1. **[$timestamp]** - **[Auto-detectado]**: $objective"
        $content = $content -replace '(### 🔄 Cambios Recientes[\s\S]*?)1\. \*\*\[.*?\]\*\*', "`$1$newChange`n2. **[FECHA]**"
        
        $content | Out-File -FilePath $cacheFile -Encoding UTF8
    }
}

# Función para verificar integridad del sistema
function Test-SystemIntegrity {
    $requiredFiles = @(
        ".trae\context_cache.md",
        ".trae\session_tracker.md", 
        ".trae\quick_commands.md",
        ".trae\ai_instructions.md"
    )
    
    $missing = @()
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            $missing += $file
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "⚠️  Archivos faltantes detectados:" -ForegroundColor Yellow
        $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
        return $false
    }
    
    Write-Host "✅ Integridad del sistema verificada" -ForegroundColor Green
    return $true
}

# Función para recuperación de emergencia
function Invoke-EmergencyRecovery {
    Write-Host "🚨 Iniciando recuperación de emergencia..." -ForegroundColor Red
    
    # Crear contexto mínimo de emergencia
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $gitStatus = git status --porcelain 2>$null
    $lastCommit = git log -1 --oneline 2>$null
    
    $emergencyContext = @"
# 🚨 Contexto de Emergencia - $timestamp

## Estado Detectado
- **Git Status**: $($gitStatus -join '; ')
- **Último Commit**: $lastCommit
- **Archivos Modificados**: $((git status --porcelain | Measure-Object).Count) archivos

## Acción Requerida
La IA debe:
1. Leer este contexto de emergencia
2. Usar git status para entender cambios actuales
3. Aplicar comandos de quick_commands.md
4. Reconstruir contexto gradualmente

## Comandos de Recuperación
``````bash
# Ver estado actual
git status

# Ver cambios recientes  
git log --oneline -5

# Detectar archivos en desarrollo
git diff --name-only HEAD~1
``````
"@

    $emergencyContext | Out-File -FilePath ".trae\emergency_context.md" -Encoding UTF8
    
    # Regenerar session_tracker mínimo
    Initialize-Context -objective "Recuperación de contexto de emergencia"
    
    Write-Host "✅ Recuperación completada. Contexto mínimo establecido." -ForegroundColor Green
}

# Ejecutar acción solicitada
switch ($action) {
    "init" {
        if ((Test-Path ".trae\session_tracker.md") -and -not $force) {
            Write-Host "⚠️  Sesión existente detectada. Use -force para sobrescribir." -ForegroundColor Yellow
            exit
        }
        Initialize-Context -objective $objective
    }
    "check" {
        Test-SystemIntegrity
    }
    "emergency" {
        Invoke-EmergencyRecovery
    }
    "status" {
        $modifiedFiles = Get-ModifiedFiles
        $inferredObjective = Get-InferredObjective
        Write-Host "📊 Estado Actual:" -ForegroundColor Cyan
        Write-Host "   Archivos modificados: $($modifiedFiles.Count)" -ForegroundColor White
        Write-Host "   Objetivo inferido: $inferredObjective" -ForegroundColor White
        Write-Host "   Último commit: $(git log -1 --oneline)" -ForegroundColor White
    }
    default {
        Write-Host "Uso: .\auto_init.ps1 -action [init|check|emergency|status] [-objective 'objetivo'] [-force]" -ForegroundColor Yellow
    }
}