# Script para Cambiar de Tarea - Sistema de Cache

param(
    [string]$tarea_actual = "",
    [string]$nueva_tarea = "",
    [string]$archivo = ""
)

Write-Host "CAMBIO DE TAREA - Sistema de Cache Optimizado" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

if ($tarea_actual -eq "" -or $nueva_tarea -eq "") {
    Write-Host ""
    Write-Host "Error: Debes especificar la tarea actual y la nueva tarea" -ForegroundColor Red
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor Yellow
    Write-Host "  .\cambiar_tarea.ps1 -tarea_actual 'Arreglar validacion' -nueva_tarea 'Implementar WebSocket' -archivo 'OrderModal.jsx'" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "PASO 1: Completando tarea actual..." -ForegroundColor Green
Write-Host "   Tarea: $tarea_actual" -ForegroundColor White
if ($archivo -ne "") {
    Write-Host "   Archivo: $archivo" -ForegroundColor White
}

Write-Host ""
Write-Host "PASO 2: Iniciando nueva tarea..." -ForegroundColor Green
Write-Host "   Nueva tarea: $nueva_tarea" -ForegroundColor White

Write-Host ""
Write-Host "PASO 3: Comandos sugeridos para obtener contexto:" -ForegroundColor Yellow

if ($nueva_tarea -like "*WebSocket*" -or $nueva_tarea -like "*notificacion*") {
    Write-Host "   Select-String -Pattern 'WebSocket' -Path '../src/**/*.jsx'" -ForegroundColor Gray
    Write-Host "   Select-String -Pattern 'websocket' -Path '../backend/app/**/*.py'" -ForegroundColor Gray
} elseif ($nueva_tarea -like "*validacion*" -or $nueva_tarea -like "*form*") {
    Write-Host "   Select-String -Pattern 'validation' -Path '../src/components/*.jsx'" -ForegroundColor Gray
    Write-Host "   Select-String -Pattern 'validator' -Path '../backend/app/schemas/*.py'" -ForegroundColor Gray
} elseif ($nueva_tarea -like "*API*" -or $nueva_tarea -like "*endpoint*") {
    Write-Host "   Select-String -Pattern '@app.get' -Path '../backend/app/api/*.py'" -ForegroundColor Gray
    Write-Host "   Select-String -Pattern 'fetch' -Path '../src/api/*.js'" -ForegroundColor Gray
} else {
    Write-Host "   Get-ChildItem -Recurse -Include '*.jsx','*.py' | Where-Object {`$_.LastWriteTime -gt (Get-Date).AddHours(-2)}" -ForegroundColor Gray
    Write-Host "   Select-String -Pattern 'function' -Path '../src/components/*.jsx'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "CAMBIO DE TAREA COMPLETADO" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Ejecutar comandos sugeridos para obtener contexto" -ForegroundColor White
Write-Host "   2. Implementar cambios usando edit_file_fast_apply" -ForegroundColor White
Write-Host "   3. Documentar progreso con update_cache.ps1" -ForegroundColor White
Write-Host ""