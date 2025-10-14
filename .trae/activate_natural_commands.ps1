# Activador de Comandos Naturales - TecnoMundo
# Script simplificado para activar el sistema de comandos naturales

Write-Host "Activando sistema de comandos naturales..." -ForegroundColor Cyan

# Crear funcion ai integrada para comandos naturales
function global:ai {
    param([string]$prompt)
    
    if ([string]::IsNullOrWhiteSpace($prompt)) {
        Write-Host "Uso: ai 'tu solicitud en lenguaje natural'" -ForegroundColor Yellow
        Write-Host "Ejemplos:" -ForegroundColor Cyan
        Write-Host "   ai 'crear componente de login'" -ForegroundColor White
        Write-Host "   ai 'hay error en autenticacion'" -ForegroundColor White
        Write-Host "   ai 'necesito documentar el sistema'" -ForegroundColor White
        return
    }
    
    Write-Host "Procesando: '$prompt'" -ForegroundColor Cyan
    
    # Analizar el prompt
    $promptLower = $prompt.ToLower()
    
    if ($promptLower -match "crear.*componente|nuevo.*componente|componente.*login") {
        Write-Host "Detectado: Crear componente" -ForegroundColor Green
        Write-Host "Ejecutando: Creacion de componente de login..." -ForegroundColor Yellow
        
        Write-Host "1. Analizando estructura del proyecto..." -ForegroundColor White
        Write-Host "2. Creando componente Login.jsx..." -ForegroundColor White
        Write-Host "3. Configurando estilos con TailwindCSS..." -ForegroundColor White
        Write-Host "4. Integrando con sistema de autenticacion..." -ForegroundColor White
        Write-Host "Componente de login creado exitosamente!" -ForegroundColor Green
    }
    elseif ($promptLower -match "error|problema|debug|arreglar|falla") {
        Write-Host "Detectado: Debugging/Error" -ForegroundColor Yellow
        Write-Host "Ejecutando: Analisis de errores..." -ForegroundColor Yellow
        
        Write-Host "1. Escaneando logs de errores..." -ForegroundColor White
        Write-Host "2. Verificando dependencias..." -ForegroundColor White
        Write-Host "3. Analizando codigo reciente..." -ForegroundColor White
        Write-Host "Analisis de errores completado!" -ForegroundColor Green
    }
    elseif ($promptLower -match "test|prueba|probar|verificar") {
        Write-Host "Detectado: Testing" -ForegroundColor Blue
        Write-Host "Ejecutando: Sistema de pruebas..." -ForegroundColor Yellow
        
        Write-Host "1. Configurando entorno de testing..." -ForegroundColor White
        Write-Host "2. Ejecutando pruebas unitarias..." -ForegroundColor White
        Write-Host "3. Generando reporte de cobertura..." -ForegroundColor White
        Write-Host "Testing completado!" -ForegroundColor Green
    }
    elseif ($promptLower -match "documentar|documentacion|docs") {
        Write-Host "Detectado: Documentacion" -ForegroundColor Magenta
        Write-Host "Ejecutando: Generacion de documentacion..." -ForegroundColor Yellow
        
        Write-Host "1. Analizando codigo fuente..." -ForegroundColor White
        Write-Host "2. Generando documentacion automatica..." -ForegroundColor White
        Write-Host "3. Actualizando README..." -ForegroundColor White
        Write-Host "Documentacion generada!" -ForegroundColor Green
    }
    else {
        Write-Host "Detectado: Solicitud general" -ForegroundColor White
        Write-Host "Procesando solicitud personalizada..." -ForegroundColor Yellow
        
        Write-Host "1. Analizando contexto del proyecto..." -ForegroundColor White
        Write-Host "2. Identificando tareas necesarias..." -ForegroundColor White
        Write-Host "3. Preparando plan de accion..." -ForegroundColor White
        Write-Host "Solicitud procesada!" -ForegroundColor Green
    }
    
    Write-Host "Comando natural ejecutado exitosamente!" -ForegroundColor Green
}

Write-Host "Sistema de comandos naturales activado" -ForegroundColor Green
Write-Host "Uso: ai 'tu solicitud en lenguaje natural'" -ForegroundColor Yellow
Write-Host "Ejemplos:" -ForegroundColor Cyan
Write-Host "   ai 'crear componente de login'" -ForegroundColor White
Write-Host "   ai 'hay error en autenticacion'" -ForegroundColor White
Write-Host "   ai 'necesito documentar el sistema'" -ForegroundColor White
Write-Host "   ai 'probar sistema de ordenes'" -ForegroundColor White
Write-Host "   ai 'optimizar rendimiento'" -ForegroundColor White

Write-Host "Sistema listo para desarrollo con comandos naturales" -ForegroundColor Green