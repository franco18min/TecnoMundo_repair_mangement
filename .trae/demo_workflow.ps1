# 🚀 Demo del Flujo de Trabajo - Sistema de Caché Optimizado

param(
    [string]$step = "init"
)

Write-Host "🤖 NEXUS - Sistema de Caché Optimizado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

switch ($step) {
    "init" {
        Write-Host "📋 PASO 1: Inicialización del Sistema" -ForegroundColor Green
        Write-Host ""
        
        # Verificar archivos de caché
        if (Test-Path "session_tracker.md") {
            Write-Host "✅ session_tracker.md encontrado" -ForegroundColor Green
            $content = Get-Content "session_tracker.md" | Select-String "OBJETIVO" | Select-Object -First 1
            if ($content) {
                Write-Host "   Objetivo actual: $content" -ForegroundColor White
            }
        } else {
            Write-Host "❌ session_tracker.md no encontrado - creando..." -ForegroundColor Yellow
        }
        
        if (Test-Path "context_cache.md") {
            Write-Host "✅ context_cache.md encontrado" -ForegroundColor Green
        } else {
            Write-Host "❌ context_cache.md no encontrado" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "🔧 Comandos disponibles para el siguiente paso:" -ForegroundColor Cyan
        Write-Host "   .\demo_workflow.ps1 -step task" -ForegroundColor White
        Write-Host "   .\demo_workflow.ps1 -step debug" -ForegroundColor White
        Write-Host "   .\demo_workflow.ps1 -step complete" -ForegroundColor White
    }
    
    "task" {
        Write-Host "🎯 PASO 2: Iniciando Nueva Tarea" -ForegroundColor Green
        Write-Host ""
        Write-Host "Comandos específicos para obtener contexto:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "# Estado actual del proyecto" -ForegroundColor Gray
        Write-Host "Get-Content session_tracker.md | Select-String OBJETIVO,ERROR,PROGRESO" -ForegroundColor White
        Write-Host ""
        Write-Host "# Archivos modificados recientemente" -ForegroundColor Gray  
        Write-Host "Get-ChildItem -Recurse -Include *.jsx,*.py | Where LastWriteTime -gt (Get-Date).AddHours(-1)" -ForegroundColor White
        Write-Host ""
        Write-Host "🔧 Para cambiar a debugging:" -ForegroundColor Cyan
        Write-Host "   .\demo_workflow.ps1 -step debug" -ForegroundColor White
    }
    
    "debug" {
        Write-Host "🐛 PASO 3: Modo Debugging" -ForegroundColor Red
        Write-Host ""
        Write-Host "Comandos específicos para debugging:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "# Errores de React" -ForegroundColor Gray
        Write-Host "Select-String -Pattern useState,useEffect,Error -Path src/components/*.jsx" -ForegroundColor White
        Write-Host ""
        Write-Host "# Estado de servidores" -ForegroundColor Gray
        Write-Host "netstat -an | findstr 8001" -ForegroundColor White
        Write-Host ""
        Write-Host "🔧 Para completar tarea:" -ForegroundColor Cyan
        Write-Host "   .\demo_workflow.ps1 -step complete" -ForegroundColor White
    }
    
    "complete" {
        Write-Host "✅ PASO 4: Completando Tarea" -ForegroundColor Green
        Write-Host ""
        Write-Host "Documentar cambios en el caché:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "# Actualizar session_tracker.md" -ForegroundColor Gray
        Write-Host ".\update_cache.ps1 -action 'Descripción del cambio' -file 'archivo.jsx' -status 'completado'" -ForegroundColor White
        Write-Host ""
        Write-Host "🔄 Para nueva tarea:" -ForegroundColor Cyan
        Write-Host "   .\demo_workflow.ps1 -step task" -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 Para reinicializar sistema:" -ForegroundColor Cyan
        Write-Host "   .\demo_workflow.ps1 -step init" -ForegroundColor White
    }
    
    default {
        Write-Host "❌ Paso no válido. Usa: init, task, debug, complete" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan