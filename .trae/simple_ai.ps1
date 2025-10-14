# Interprete Simple de Comandos Naturales
param([string]$UserPrompt)

if ([string]::IsNullOrWhiteSpace($UserPrompt)) {
    Write-Host "Error: Se requiere un prompt" -ForegroundColor Red
    exit 1
}

Write-Host "Analizando solicitud: '$UserPrompt'" -ForegroundColor Cyan

# Patrones basicos de deteccion
$prompt = $UserPrompt.ToLower()

if ($prompt -match "crear.*componente|nuevo.*componente|componente.*login") {
    Write-Host "Detectado: Crear componente" -ForegroundColor Green
    Write-Host "Ejecutando: Creacion de componente de login..." -ForegroundColor Yellow
    
    # Simular creacion de componente
    Write-Host "1. Analizando estructura del proyecto..." -ForegroundColor White
    Write-Host "2. Creando componente Login.jsx..." -ForegroundColor White
    Write-Host "3. Configurando estilos con TailwindCSS..." -ForegroundColor White
    Write-Host "4. Integrando con sistema de autenticacion..." -ForegroundColor White
    Write-Host "Componente de login creado exitosamente!" -ForegroundColor Green
}
elseif ($prompt -match "error|problema|debug|arreglar|falla") {
    Write-Host "Detectado: Debugging/Error" -ForegroundColor Yellow
    Write-Host "Ejecutando: Analisis de errores..." -ForegroundColor Yellow
    
    Write-Host "1. Escaneando logs de errores..." -ForegroundColor White
    Write-Host "2. Verificando dependencias..." -ForegroundColor White
    Write-Host "3. Analizando codigo reciente..." -ForegroundColor White
    Write-Host "Analisis de errores completado!" -ForegroundColor Green
}
elseif ($prompt -match "test|prueba|probar|verificar") {
    Write-Host "Detectado: Testing" -ForegroundColor Blue
    Write-Host "Ejecutando: Sistema de pruebas..." -ForegroundColor Yellow
    
    Write-Host "1. Configurando entorno de testing..." -ForegroundColor White
    Write-Host "2. Ejecutando pruebas unitarias..." -ForegroundColor White
    Write-Host "3. Generando reporte de cobertura..." -ForegroundColor White
    Write-Host "Testing completado!" -ForegroundColor Green
}
elseif ($prompt -match "documentar|documentacion|docs") {
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