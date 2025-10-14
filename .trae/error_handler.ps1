# 🚨 Sistema Automático de Manejo de Errores
# Permite a la IA documentar, analizar y resolver errores automáticamente

param(
    [string]$action = "log",
    [string]$error_message = "",
    [string]$file_path = "",
    [string]$line_number = "",
    [string]$solution = "",
    [string]$status = "activo"
)

# Base de conocimiento de errores comunes
$ErrorKnowledgeBase = @{
    "ImportError" = @{
        pattern = "ImportError|ModuleNotFoundError|Cannot resolve module"
        auto_solution = "Verificar imports y dependencias"
        commands = @(
            "npm list | grep {module}",
            "grep -r 'import.*{module}' src/",
            "find . -name 'package.json' -exec grep -l '{module}' {} \;"
        )
        fix_suggestions = @(
            "npm install {module}",
            "Verificar ruta de import",
            "Revisar package.json"
        )
    }
    
    "SyntaxError" = @{
        pattern = "SyntaxError|Unexpected token|Parse error"
        auto_solution = "Revisar sintaxis en archivo"
        commands = @(
            "grep -n -A 3 -B 3 '{line}' '{file}'",
            "eslint '{file}' --format compact",
            "node --check '{file}'"
        )
        fix_suggestions = @(
            "Verificar paréntesis y llaves",
            "Revisar comas y punto y coma",
            "Verificar sintaxis JSX"
        )
    }
    
    "ComponentError" = @{
        pattern = "Cannot read property.*of undefined|TypeError.*undefined"
        auto_solution = "Verificar props y estado del componente"
        commands = @(
            "grep -n 'props\|state' '{file}'",
            "grep -n 'useState\|useEffect' '{file}'",
            "grep -n 'undefined' '{file}'"
        )
        fix_suggestions = @(
            "Verificar props requeridas",
            "Agregar validación de props",
            "Inicializar estado correctamente"
        )
    }
    
    "APIError" = @{
        pattern = "fetch.*failed|axios.*error|API.*error|404|500|401"
        auto_solution = "Verificar endpoint y configuración de API"
        commands = @(
            "grep -n 'fetch\|axios' '{file}'",
            "grep -n 'localhost:8001' '{file}'",
            "netstat -an | findstr :8001"
        )
        fix_suggestions = @(
            "Verificar que backend esté corriendo",
            "Revisar URL del endpoint",
            "Verificar autenticación"
        )
    }
    
    "DatabaseError" = @{
        pattern = "database.*error|connection.*failed|SQL.*error"
        auto_solution = "Verificar conexión a base de datos"
        commands = @(
            "grep -n 'DATABASE_URL\|db\.' backend/",
            "ps aux | grep postgres",
            "grep -n 'sqlalchemy' backend/"
        )
        fix_suggestions = @(
            "Verificar PostgreSQL esté corriendo",
            "Revisar variables de entorno",
            "Verificar credenciales de DB"
        )
    }
}

# Función para detectar tipo de error automáticamente
function Get-ErrorType {
    param([string]$errorMessage)
    
    foreach ($errorType in $ErrorKnowledgeBase.Keys) {
        $pattern = $ErrorKnowledgeBase[$errorType].pattern
        if ($errorMessage -match $pattern) {
            return $errorType
        }
    }
    return "UnknownError"
}

# Función para generar ID único de error
function New-ErrorId {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $random = Get-Random -Minimum 100 -Maximum 999
    return "ERR_${timestamp}_${random}"
}

# Función para documentar error automáticamente
function Add-ErrorToTracker {
    param(
        [string]$errorId,
        [string]$errorMessage,
        [string]$filePath,
        [string]$lineNumber,
        [string]$errorType,
        [string]$autoSolution
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $errorEntry = @"

### 🚨 Error $errorId
``````yaml
$errorId:
  mensaje: '$errorMessage'
  archivo: '$filePath'
  linea: '$lineNumber'
  tipo: '$errorType'
  timestamp: '$timestamp'
  solucion_automatica: '$autoSolution'
  estado: 'activo'
  comandos_diagnostico: [
$(($ErrorKnowledgeBase[$errorType].commands | ForEach-Object { "    '$_'" }) -join ",`n")
  ]
  sugerencias_fix: [
$(($ErrorKnowledgeBase[$errorType].fix_suggestions | ForEach-Object { "    '$_'" }) -join ",`n")
  ]
``````
"@

    # Agregar al session_tracker
    $errorEntry | Add-Content ".trae\session_tracker.md"
    
    # Log en archivo de errores
    "$timestamp,$errorId,$errorType,$errorMessage,$filePath,$lineNumber,activo" | Add-Content ".trae\error_log.csv"
    
    Write-Host "📝 Error documentado: $errorId" -ForegroundColor Yellow
    Write-Host "🔍 Tipo detectado: $errorType" -ForegroundColor Cyan
    Write-Host "💡 Solución automática: $autoSolution" -ForegroundColor Green
}

# Función para buscar errores similares en historial
function Find-SimilarErrors {
    param([string]$errorMessage)
    
    if (Test-Path ".trae\error_log.csv") {
        $similarErrors = Get-Content ".trae\error_log.csv" | Where-Object { 
            $_ -match [regex]::Escape($errorMessage.Substring(0, [Math]::Min(20, $errorMessage.Length)))
        }
        
        if ($similarErrors) {
            Write-Host "🔍 Errores similares encontrados:" -ForegroundColor Cyan
            $similarErrors | ForEach-Object {
                $parts = $_ -split ','
                Write-Host "   - $($parts[1]): $($parts[3])" -ForegroundColor White
            }
            return $true
        }
    }
    return $false
}

# Función para generar comandos de diagnóstico automático
function Get-DiagnosticCommands {
    param([string]$errorType, [string]$filePath, [string]$errorMessage)
    
    $commands = $ErrorKnowledgeBase[$errorType].commands
    $processedCommands = @()
    
    foreach ($cmd in $commands) {
        $processedCmd = $cmd -replace '\{file\}', $filePath
        $processedCmd = $processedCmd -replace '\{module\}', ($errorMessage -replace '.*module[''"]([^''"]+)[''"].*', '$1')
        $processedCmd = $processedCmd -replace '\{line\}', $line_number
        $processedCommands += $processedCmd
    }
    
    return $processedCommands
}

# Función para resolver error automáticamente
function Resolve-ErrorAutomatically {
    param([string]$errorId)
    
    # Buscar error en session_tracker
    $trackerContent = Get-Content ".trae\session_tracker.md" -Raw
    if ($trackerContent -match "$errorId[\s\S]*?estado: 'activo'") {
        # Marcar como resuelto
        $updatedContent = $trackerContent -replace "($errorId[\s\S]*?)estado: 'activo'", "`$1estado: 'resuelto'"
        $updatedContent | Out-File ".trae\session_tracker.md" -Encoding UTF8
        
        # Actualizar log
        if (Test-Path ".trae\error_log.csv") {
            $logContent = Get-Content ".trae\error_log.csv"
            $updatedLog = $logContent -replace "($errorId.*),activo$", "`$1,resuelto"
            $updatedLog | Out-File ".trae\error_log.csv" -Encoding UTF8
        }
        
        Write-Host "✅ Error $errorId marcado como resuelto" -ForegroundColor Green
        return $true
    }
    return $false
}

# Función para generar reporte de errores
function Get-ErrorReport {
    $activeErrors = @()
    $resolvedErrors = @()
    
    if (Test-Path ".trae\error_log.csv") {
        $allErrors = Get-Content ".trae\error_log.csv"
        $activeErrors = $allErrors | Where-Object { $_ -match ",activo$" }
        $resolvedErrors = $allErrors | Where-Object { $_ -match ",resuelto$" }
    }
    
    $report = @"
# 📊 Reporte de Errores - $(Get-Date -Format "yyyy-MM-dd HH:mm")

## 🚨 Errores Activos: $($activeErrors.Count)
$(if ($activeErrors.Count -gt 0) {
    $activeErrors | ForEach-Object {
        $parts = $_ -split ','
        "- **$($parts[1])** [$($parts[2])]: $($parts[3]) en $($parts[4]):$($parts[5])"
    }
} else {
    "✅ No hay errores activos"
})

## ✅ Errores Resueltos: $($resolvedErrors.Count)
$(if ($resolvedErrors.Count -gt 0) {
    $resolvedErrors | Select-Object -Last 5 | ForEach-Object {
        $parts = $_ -split ','
        "- **$($parts[1])** [$($parts[2])]: $($parts[3]) ✅"
    }
} else {
    "No hay errores resueltos aún"
})

## 📈 Estadísticas
- **Total de errores**: $($activeErrors.Count + $resolvedErrors.Count)
- **Tasa de resolución**: $(if (($activeErrors.Count + $resolvedErrors.Count) -gt 0) { [math]::Round(($resolvedErrors.Count / ($activeErrors.Count + $resolvedErrors.Count)) * 100, 1) } else { 0 })%
- **Errores más comunes**: $(if (Test-Path ".trae\error_log.csv") { (Get-Content ".trae\error_log.csv" | ForEach-Object { ($_ -split ',')[2] } | Group-Object | Sort-Object Count -Descending | Select-Object -First 3 | ForEach-Object { "$($_.Name) ($($_.Count))" }) -join ', ' } else { "N/A" })
"@

    return $report
}

# Función para limpiar errores antiguos resueltos
function Clear-ResolvedErrors {
    param([int]$daysOld = 7)
    
    $cutoffDate = (Get-Date).AddDays(-$daysOld)
    
    if (Test-Path ".trae\error_log.csv") {
        $allErrors = Get-Content ".trae\error_log.csv"
        $recentErrors = $allErrors | Where-Object {
            $parts = $_ -split ','
            $errorDate = [DateTime]::ParseExact($parts[0], "yyyy-MM-dd HH:mm:ss", $null)
            $errorDate -gt $cutoffDate -or $parts[6] -eq "activo"
        }
        
        $recentErrors | Out-File ".trae\error_log.csv" -Encoding UTF8
        Write-Host "🧹 Errores antiguos limpiados (más de $daysOld días)" -ForegroundColor Green
    }
}

# Ejecutar acción solicitada
switch ($action) {
    "log" {
        if (-not $error_message) {
            Write-Host "❌ Se requiere -error_message para documentar un error" -ForegroundColor Red
            exit 1
        }
        
        $errorType = Get-ErrorType -errorMessage $error_message
        $errorId = New-ErrorId
        $autoSolution = $ErrorKnowledgeBase[$errorType].auto_solution
        
        # Buscar errores similares
        $hasSimilar = Find-SimilarErrors -errorMessage $error_message
        
        # Documentar error
        Add-ErrorToTracker -errorId $errorId -errorMessage $error_message -filePath $file_path -lineNumber $line_number -errorType $errorType -autoSolution $autoSolution
        
        # Generar comandos de diagnóstico
        $diagnosticCommands = Get-DiagnosticCommands -errorType $errorType -filePath $file_path -errorMessage $error_message
        
        Write-Host "`n🔧 Comandos de diagnóstico sugeridos:" -ForegroundColor Yellow
        $diagnosticCommands | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
        
        Write-Host "`n💡 Sugerencias de solución:" -ForegroundColor Yellow
        $ErrorKnowledgeBase[$errorType].fix_suggestions | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
        
        return $errorId
    }
    
    "resolve" {
        if (-not $error_message) {
            Write-Host "❌ Se requiere -error_message (ID del error) para marcar como resuelto" -ForegroundColor Red
            exit 1
        }
        
        $resolved = Resolve-ErrorAutomatically -errorId $error_message
        if (-not $resolved) {
            Write-Host "❌ No se encontró el error $error_message" -ForegroundColor Red
        }
    }
    
    "report" {
        $report = Get-ErrorReport
        Write-Host $report
        
        # Guardar reporte
        $report | Out-File ".trae\error_report.md" -Encoding UTF8
        Write-Host "`n📄 Reporte guardado en .trae\error_report.md" -ForegroundColor Green
    }
    
    "clean" {
        $days = if ($error_message) { [int]$error_message } else { 7 }
        Clear-ResolvedErrors -daysOld $days
    }
    
    "search" {
        if (-not $error_message) {
            Write-Host "❌ Se requiere -error_message para buscar errores" -ForegroundColor Red
            exit 1
        }
        
        Find-SimilarErrors -errorMessage $error_message
    }
    
    "auto-fix" {
        # Función experimental para auto-fix de errores comunes
        Write-Host "🤖 Función de auto-fix en desarrollo..." -ForegroundColor Yellow
        Write-Host "Por ahora, usa los comandos de diagnóstico sugeridos" -ForegroundColor White
    }
    
    default {
        Write-Host @"
🚨 Sistema de Manejo Automático de Errores

Uso: .\error_handler.ps1 -action [acción] [parámetros]

Acciones disponibles:
  log       Documentar un nuevo error
            -error_message "mensaje del error"
            -file_path "ruta/archivo.js"
            -line_number "123"
            
  resolve   Marcar error como resuelto
            -error_message "ERR_ID"
            
  report    Generar reporte de errores
  
  search    Buscar errores similares
            -error_message "texto a buscar"
            
  clean     Limpiar errores antiguos resueltos
            -error_message "días" (default: 7)

Ejemplos:
  .\error_handler.ps1 -action log -error_message "ImportError: Cannot resolve module" -file_path "src/App.jsx" -line_number "5"
  .\error_handler.ps1 -action resolve -error_message "ERR_20240101_123456_789"
  .\error_handler.ps1 -action report
"@ -ForegroundColor Cyan
    }
}