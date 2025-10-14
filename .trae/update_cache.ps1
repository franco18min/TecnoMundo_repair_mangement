# 🔄 Script de Actualización de Caché de Contexto
# Uso: .\update_cache.ps1 -action "descripcion" -file "archivo" -status "estado"

param(
    [Parameter(Mandatory=$true)]
    [string]$action,
    
    [Parameter(Mandatory=$false)]
    [string]$file = "",
    
    [Parameter(Mandatory=$false)]
    [string]$status = "completado",
    
    [Parameter(Mandatory=$false)]
    [string]$error = ""
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$sessionFile = ".trae\session_tracker.md"
$contextFile = ".trae\context_cache.md"

Write-Host "🔄 Actualizando caché de contexto..." -ForegroundColor Cyan

# Función para actualizar session_tracker.md
function Update-SessionTracker {
    param($action, $file, $status, $error)
    
    if (Test-Path $sessionFile) {
        $content = Get-Content $sessionFile -Raw
        
        # Actualizar última acción
        $newAction = @"
TIMESTAMP: "$timestamp"
ACCION: "$action"
ARCHIVO: "$file"
RESULTADO: "$status"
SIGUIENTE_PASO: ""
"@
        
        $content = $content -replace 'TIMESTAMP: ""[\s\S]*?SIGUIENTE_PASO: ""', $newAction
        
        # Agregar al historial
        $historyEntry = "1. **[$($timestamp.Split(' ')[1])]** - $action en $file - $status"
        $content = $content -replace '(### Historial de esta sesión:\r?\n)', "`$1$historyEntry`r`n"
        
        # Si hay error, agregarlo
        if ($error -ne "") {
            $errorEntry = @"
error_nuevo:
  mensaje: "$error"
  archivo: "$file"
  linea: ""
  solucion: "PENDIENTE"
  estado: "activo"
"@
            $content = $content -replace '(### 🐛 Errores de Esta Sesión)', "`$1`r`n$errorEntry`r`n"
        }
        
        Set-Content $sessionFile -Value $content -Encoding UTF8
        Write-Host "✅ Session tracker actualizado" -ForegroundColor Green
    }
}

# Función para actualizar context_cache.md
function Update-ContextCache {
    param($action, $file)
    
    if (Test-Path $contextFile) {
        $content = Get-Content $contextFile -Raw
        
        # Actualizar última modificación
        $lastMod = "ULTIMA_MODIFICACION: `"$timestamp - $file - $action`""
        $content = $content -replace 'ULTIMA_MODIFICACION: ".*"', $lastMod
        
        # Agregar a cambios recientes
        $changeEntry = "1. **[$($timestamp.Split(' ')[0])]** - **$file**: $action"
        $content = $content -replace '(### 🔄 Cambios Recientes[\s\S]*?\n)', "`$1$changeEntry`r`n"
        
        Set-Content $contextFile -Value $content -Encoding UTF8
        Write-Host "✅ Context cache actualizado" -ForegroundColor Green
    }
}

# Función para mostrar estado actual
function Show-CurrentStatus {
    Write-Host "`n📊 Estado actual del caché:" -ForegroundColor Yellow
    
    if (Test-Path $sessionFile) {
        Write-Host "`n🎯 Sesión actual:" -ForegroundColor Cyan
        Get-Content $sessionFile | Select-String -Pattern "TAREA_PRINCIPAL|PROGRESO|ERROR_ACTUAL" | ForEach-Object {
            Write-Host "  $($_.Line)" -ForegroundColor White
        }
    }
    
    if (Test-Path $contextFile) {
        Write-Host "`n🔄 Últimos cambios:" -ForegroundColor Cyan
        Get-Content $contextFile | Select-String -Pattern "ULTIMA_MODIFICACION" | ForEach-Object {
            Write-Host "  $($_.Line)" -ForegroundColor White
        }
    }
}

# Ejecutar actualizaciones
try {
    Update-SessionTracker -action $action -file $file -status $status -error $error
    Update-ContextCache -action $action -file $file
    Show-CurrentStatus
    
    Write-Host "`n🎉 Caché actualizado exitosamente!" -ForegroundColor Green
    Write-Host "💡 La IA puede usar este contexto en la próxima petición" -ForegroundColor Yellow
}
catch {
    Write-Host "❌ Error actualizando caché: $($_.Exception.Message)" -ForegroundColor Red
}

# Ejemplos de uso:
Write-Host "`n📝 Ejemplos de uso:" -ForegroundColor Magenta
Write-Host "  .\update_cache.ps1 -action 'Fix handleSubmit validation' -file 'OrderModal.jsx' -status 'completado'" -ForegroundColor Gray
Write-Host "  .\update_cache.ps1 -action 'Add new endpoint' -file 'repair_orders.py' -error 'Import error'" -ForegroundColor Gray
Write-Host "  .\update_cache.ps1 -action 'Refactor component' -file 'UserModal.jsx' -status 'en_progreso'" -ForegroundColor Gray