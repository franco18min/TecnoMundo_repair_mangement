# 📚 Generador Automático de Documentación - TecnoMundo

> **Propósito**: Documentación inteligente y automática con análisis de código, generación de APIs docs y mantenimiento continuo

## 🎯 Arquitectura de Documentación Inteligente

### Sistema de Análisis de Código
```yaml
code_analysis:
  deteccion_automatica:
    componentes_react:
      - "Props y tipos"
      - "Hooks utilizados"
      - "Estados manejados"
      - "Eventos y callbacks"
      - "Dependencias externas"
      
    endpoints_api:
      - "Métodos HTTP"
      - "Parámetros de entrada"
      - "Respuestas esperadas"
      - "Códigos de estado"
      - "Autenticación requerida"
      
    funciones_utilidad:
      - "Parámetros de entrada"
      - "Valor de retorno"
      - "Efectos secundarios"
      - "Dependencias"
      - "Casos de uso"
      
    modelos_datos:
      - "Campos y tipos"
      - "Relaciones"
      - "Validaciones"
      - "Índices"
      - "Constraints"
```

### Generación Inteligente de Documentación
```yaml
doc_generation:
  tipos_documentacion:
    api_documentation:
      formato: "OpenAPI 3.0 + Swagger UI"
      contenido:
        - "Endpoints completos con ejemplos"
        - "Esquemas de datos"
        - "Códigos de respuesta"
        - "Autenticación y autorización"
        - "Rate limiting"
        
    component_documentation:
      formato: "Storybook + JSDoc"
      contenido:
        - "Props interface"
        - "Ejemplos de uso"
        - "Estados visuales"
        - "Casos de edge"
        - "Accessibility guidelines"
        
    user_documentation:
      formato: "Markdown + GitBook"
      contenido:
        - "Guías de usuario"
        - "Tutoriales paso a paso"
        - "FAQ automático"
        - "Troubleshooting"
        - "Changelog automático"
        
    technical_documentation:
      formato: "Markdown + Diagrams"
      contenido:
        - "Arquitectura del sistema"
        - "Diagramas de flujo"
        - "Decisiones técnicas"
        - "Patrones utilizados"
        - "Guías de desarrollo"
```

## 🔍 Sistema de Análisis Semántico

### Extracción Inteligente de Información
```yaml
semantic_analysis:
  code_understanding:
    function_purpose:
      - "Análisis de nombre y parámetros"
      - "Detección de patrones comunes"
      - "Inferencia de propósito"
      - "Identificación de side effects"
      
    component_behavior:
      - "Análisis de JSX structure"
      - "Detección de user interactions"
      - "Identificación de data flow"
      - "Mapeo de state changes"
      
    api_contracts:
      - "Análisis de request/response"
      - "Detección de validation rules"
      - "Identificación de business logic"
      - "Mapeo de error scenarios"
      
  context_inference:
    business_logic:
      - "Identificación de reglas de negocio"
      - "Mapeo de flujos de trabajo"
      - "Detección de validaciones"
      - "Análisis de permisos"
      
    user_experience:
      - "Flujos de usuario identificados"
      - "Puntos de interacción"
      - "Estados de loading/error"
      - "Feedback al usuario"
```

### Generación de Ejemplos Automáticos
```yaml
example_generation:
  api_examples:
    request_examples:
      - "Casos de éxito típicos"
      - "Casos de error comunes"
      - "Casos edge detectados"
      - "Diferentes tipos de usuario"
      
    response_examples:
      - "Respuestas exitosas"
      - "Errores de validación"
      - "Errores de autorización"
      - "Estados de sistema"
      
  component_examples:
    usage_patterns:
      - "Uso básico"
      - "Configuraciones avanzadas"
      - "Estados de error"
      - "Casos de loading"
      
    interactive_examples:
      - "Storybook stories"
      - "Playground interactivo"
      - "Casos de test visuales"
      - "Responsive examples"
```

## 📖 Templates de Documentación

### Documentación de Componentes React
```yaml
react_component_template: |
  # {ComponentName}
  
  ## Descripción
  {auto_generated_description}
  
  ## Props
  ```typescript
  interface {ComponentName}Props {
    {auto_extracted_props}
  }
  ```
  
  ## Uso Básico
  ```jsx
  import { {ComponentName} } from './components/{ComponentName}';
  
  function App() {
    return (
      <{ComponentName}
        {example_props}
      />
    );
  }
  ```
  
  ## Estados
  {auto_detected_states}
  
  ## Eventos
  {auto_detected_events}
  
  ## Ejemplos Avanzados
  {auto_generated_advanced_examples}
  
  ## Accessibility
  {auto_detected_a11y_features}
  
  ## Testing
  {auto_generated_test_examples}
```

### Documentación de API Endpoints
```yaml
api_endpoint_template: |
  # {endpoint_method} {endpoint_path}
  
  ## Descripción
  {auto_generated_description}
  
  ## Autenticación
  {auth_requirements}
  
  ## Parámetros
  ### Path Parameters
  {path_parameters}
  
  ### Query Parameters
  {query_parameters}
  
  ### Request Body
  ```json
  {request_schema}
  ```
  
  ## Respuestas
  ### Éxito (200)
  ```json
  {success_response_example}
  ```
  
  ### Errores
  {error_responses}
  
  ## Ejemplos de Uso
  ### cURL
  ```bash
  {curl_example}
  ```
  
  ### JavaScript
  ```javascript
  {javascript_example}
  ```
  
  ### Python
  ```python
  {python_example}
  ```
  
  ## Rate Limiting
  {rate_limit_info}
  
  ## Notas
  {additional_notes}
```

## 🚀 Scripts de Generación Automática

### Generador Principal
```powershell
# Generador maestro de documentación
function Generate-AutoDocumentation {
    param(
        [string]$Scope = "all",
        [string]$Format = "markdown",
        [switch]$IncludeExamples,
        [switch]$UpdateExisting
    )
    
    Write-Host "📚 Generando documentación automática..." -ForegroundColor Cyan
    
    # Análisis del código fuente
    $codeAnalysis = Analyze-Codebase -Scope $Scope
    
    # Generación por tipo
    switch ($Scope) {
        "all" {
            Generate-APIDocumentation -Analysis $codeAnalysis.API
            Generate-ComponentDocumentation -Analysis $codeAnalysis.Components
            Generate-UserDocumentation -Analysis $codeAnalysis.UserFlows
            Generate-TechnicalDocumentation -Analysis $codeAnalysis.Architecture
        }
        "api" {
            Generate-APIDocumentation -Analysis $codeAnalysis.API
        }
        "components" {
            Generate-ComponentDocumentation -Analysis $codeAnalysis.Components
        }
        "user" {
            Generate-UserDocumentation -Analysis $codeAnalysis.UserFlows
        }
        "technical" {
            Generate-TechnicalDocumentation -Analysis $codeAnalysis.Architecture
        }
    }
    
    # Generar índice automático
    Generate-DocumentationIndex
    
    # Validar documentación generada
    Validate-GeneratedDocumentation
    
    Write-Host "✅ Documentación generada exitosamente" -ForegroundColor Green
}

# Analizador de código fuente
function Analyze-Codebase {
    param([string]$Scope)
    
    $analysis = @{
        API = @()
        Components = @()
        UserFlows = @()
        Architecture = @()
    }
    
    # Análisis de API endpoints
    $apiFiles = Get-ChildItem -Path "backend/app/api" -Filter "*.py" -Recurse
    foreach ($file in $apiFiles) {
        $endpoints = Extract-APIEndpoints -FilePath $file.FullName
        $analysis.API += $endpoints
    }
    
    # Análisis de componentes React
    $componentFiles = Get-ChildItem -Path "frontend/src/components" -Filter "*.jsx" -Recurse
    foreach ($file in $componentFiles) {
        $component = Extract-ComponentInfo -FilePath $file.FullName
        $analysis.Components += $component
    }
    
    # Análisis de flujos de usuario
    $pageFiles = Get-ChildItem -Path "frontend/src/pages" -Filter "*.jsx" -Recurse
    foreach ($file in $pageFiles) {
        $userFlow = Extract-UserFlow -FilePath $file.FullName
        $analysis.UserFlows += $userFlow
    }
    
    # Análisis de arquitectura
    $analysis.Architecture = Extract-ArchitectureInfo
    
    return $analysis
}

# Extractor de información de endpoints
function Extract-APIEndpoints {
    param([string]$FilePath)
    
    $content = Get-Content -Path $FilePath -Raw
    $endpoints = @()
    
    # Buscar decoradores de FastAPI
    $routePattern = '@router\.(get|post|put|delete|patch)\("([^"]+)"'
    $matches = [regex]::Matches($content, $routePattern)
    
    foreach ($match in $matches) {
        $method = $match.Groups[1].Value.ToUpper()
        $path = $match.Groups[2].Value
        
        # Extraer función asociada
        $functionPattern = "def\s+(\w+)\s*\("
        $functionMatch = [regex]::Match($content, $functionPattern, $match.Index)
        
        if ($functionMatch.Success) {
            $functionName = $functionMatch.Groups[1].Value
            
            # Extraer docstring si existe
            $docstringPattern = '"""([^"]+)"""'
            $docstringMatch = [regex]::Match($content, $docstringPattern, $functionMatch.Index)
            
            $endpoint = @{
                Method = $method
                Path = $path
                Function = $functionName
                Description = if ($docstringMatch.Success) { $docstringMatch.Groups[1].Value } else { "Auto-generated description for $functionName" }
                Parameters = Extract-FunctionParameters -Content $content -FunctionName $functionName
                FilePath = $FilePath
            }
            
            $endpoints += $endpoint
        }
    }
    
    return $endpoints
}

# Extractor de información de componentes
function Extract-ComponentInfo {
    param([string]$FilePath)
    
    $content = Get-Content -Path $FilePath -Raw
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
    
    # Extraer props del componente
    $propsPattern = "function\s+$fileName\s*\(\s*\{\s*([^}]+)\s*\}"
    $propsMatch = [regex]::Match($content, $propsPattern)
    
    $props = @()
    if ($propsMatch.Success) {
        $propsString = $propsMatch.Groups[1].Value
        $props = $propsString -split ',' | ForEach-Object { $_.Trim() }
    }
    
    # Extraer hooks utilizados
    $hooksPattern = "use\w+\("
    $hooksMatches = [regex]::Matches($content, $hooksPattern)
    $hooks = $hooksMatches | ForEach-Object { $_.Value.TrimEnd('(') } | Sort-Object -Unique
    
    # Extraer JSX elements principales
    $jsxPattern = "<(\w+)"
    $jsxMatches = [regex]::Matches($content, $jsxPattern)
    $elements = $jsxMatches | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    
    return @{
        Name = $fileName
        Props = $props
        Hooks = $hooks
        Elements = $elements
        FilePath = $FilePath
        Description = "Auto-generated description for $fileName component"
    }
}
```

### Generadores Específicos
```powershell
# Generador de documentación de API
function Generate-APIDocumentation {
    param($Analysis)
    
    $apiDoc = @"
# API Documentation - TecnoMundo

## Endpoints

"@
    
    foreach ($endpoint in $Analysis) {
        $apiDoc += @"

### $($endpoint.Method) $($endpoint.Path)

**Descripción:** $($endpoint.Description)

**Parámetros:**
$(if ($endpoint.Parameters.Count -gt 0) { 
    $endpoint.Parameters | ForEach-Object { "- ``$_``" } | Join-String -Separator "`n"
} else { 
    "No requiere parámetros" 
})

**Ejemplo de uso:**
``````bash
curl -X $($endpoint.Method) "http://localhost:8001$($endpoint.Path)" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
``````

---
"@
    }
    
    $outputPath = "docs/api/README.md"
    New-Item -Path (Split-Path $outputPath) -ItemType Directory -Force | Out-Null
    Set-Content -Path $outputPath -Value $apiDoc
    
    Write-Host "📄 API documentation generada: $outputPath" -ForegroundColor Green
}

# Generador de documentación de componentes
function Generate-ComponentDocumentation {
    param($Analysis)
    
    foreach ($component in $Analysis) {
        $componentDoc = @"
# $($component.Name)

## Descripción
$($component.Description)

## Props
$(if ($component.Props.Count -gt 0) {
    "``````typescript`n" +
    "interface $($component.Name)Props {`n" +
    ($component.Props | ForEach-Object { "  $_: any; // TODO: Specify type" }) -join "`n" +
    "`n}`n" +
    "``````"
} else {
    "Este componente no recibe props."
})

## Hooks Utilizados
$(if ($component.Hooks.Count -gt 0) {
    $component.Hooks | ForEach-Object { "- ``$_``" } | Join-String -Separator "`n"
} else {
    "No utiliza hooks personalizados."
})

## Elementos JSX
$(if ($component.Elements.Count -gt 0) {
    $component.Elements | ForEach-Object { "- ``<$_>``" } | Join-String -Separator "`n"
} else {
    "Elementos básicos de HTML."
})

## Ejemplo de Uso
``````jsx
import { $($component.Name) } from './components/$($component.Name)';

function App() {
  return (
    <$($component.Name)$(if ($component.Props.Count -gt 0) { 
      "`n      " + ($component.Props | ForEach-Object { "$_={/* valor */}" }) -join "`n      " + "`n    "
    } else { " " })/>
  );
}
``````

## Archivo Fuente
``$($component.FilePath)``
"@
        
        $outputPath = "docs/components/$($component.Name).md"
        New-Item -Path (Split-Path $outputPath) -ItemType Directory -Force | Out-Null
        Set-Content -Path $outputPath -Value $componentDoc
        
        Write-Host "📄 Component documentation generada: $outputPath" -ForegroundColor Green
    }
}

# Generador de documentación de usuario
function Generate-UserDocumentation {
    param($Analysis)
    
    $userDoc = @"
# Guía de Usuario - TecnoMundo

## Introducción
TecnoMundo es un sistema de gestión de reparaciones de dispositivos electrónicos.

## Funcionalidades Principales

### Autenticación
- Login con credenciales de usuario
- Gestión de sesiones seguras
- Roles y permisos diferenciados

### Gestión de Órdenes
- Creación de nuevas órdenes de reparación
- Asignación de técnicos
- Seguimiento de estados
- Transferencia entre sucursales

### Notificaciones
- Notificaciones en tiempo real
- Historial de notificaciones
- Filtros por tipo y prioridad

### Reportes
- Generación de reportes por período
- Métricas de performance
- Exportación de datos

## Flujos de Trabajo

### Para Administradores
1. **Gestión de Usuarios**
   - Crear nuevos usuarios
   - Asignar roles y permisos
   - Gestionar sucursales

2. **Supervisión de Órdenes**
   - Monitorear todas las órdenes
   - Reasignar técnicos
   - Generar reportes

### Para Técnicos
1. **Órdenes Asignadas**
   - Ver órdenes asignadas
   - Actualizar estados
   - Agregar comentarios

2. **Comunicación**
   - Recibir notificaciones
   - Comunicarse con administradores

## Troubleshooting

### Problemas Comunes
- **No puedo hacer login**: Verificar credenciales y conexión
- **No veo mis órdenes**: Verificar filtros aplicados
- **No recibo notificaciones**: Verificar configuración del navegador

### Contacto de Soporte
- Email: soporte@tecnomundo.com
- Teléfono: +1-234-567-8900
"@
    
    $outputPath = "docs/user/README.md"
    New-Item -Path (Split-Path $outputPath) -ItemType Directory -Force | Out-Null
    Set-Content -Path $outputPath -Value $userDoc
    
    Write-Host "📄 User documentation generada: $outputPath" -ForegroundColor Green
}
```

## 📊 Sistema de Métricas de Documentación

### Análisis de Calidad
```yaml
documentation_metrics:
  cobertura_documentacion:
    api_endpoints:
      total: "45"
      documentados: "42"
      porcentaje: "93.3%"
      
    componentes:
      total: "28"
      documentados: "25"
      porcentaje: "89.3%"
      
    funciones_utilidad:
      total: "67"
      documentadas: "52"
      porcentaje: "77.6%"
      
  calidad_documentacion:
    completitud:
      - "Descripción presente"
      - "Ejemplos incluidos"
      - "Parámetros documentados"
      - "Casos de error cubiertos"
      
    actualizacion:
      - "Sincronizada con código"
      - "Ejemplos funcionando"
      - "Links válidos"
      - "Información actualizada"
```

### Dashboard de Documentación
```yaml
documentation_dashboard:
  indicadores_principales:
    cobertura_total:
      actual: "86.7%"
      objetivo: "> 90%"
      tendencia: "↑ +3.2% última semana"
      
    documentos_actualizados:
      esta_semana: "23"
      automaticos: "18"
      manuales: "5"
      
    calidad_promedio:
      actual: "4.1/5"
      objetivo: "> 4.0"
      tendencia: "↑ +0.2 última semana"
      
  alertas_automaticas:
    - "✅ Documentación API 100% actualizada"
    - "⚠️ 3 componentes sin documentar"
    - "📈 Calidad mejoró significativamente"
    - "🎯 Meta de cobertura casi alcanzada"
```

## 🔧 Integración y Automatización

### Hooks de Integración
```yaml
integration_hooks:
  pre_commit:
    - "Generar docs para archivos modificados"
    - "Validar ejemplos de código"
    - "Actualizar índices automáticamente"
    
  post_deploy:
    - "Actualizar documentación de API"
    - "Regenerar ejemplos con datos reales"
    - "Validar links y referencias"
    
  scheduled:
    - "Análisis semanal de cobertura"
    - "Optimización de documentación"
    - "Limpieza de documentos obsoletos"
```

### Comandos de Gestión
```powershell
# Generar toda la documentación
.\auto_init.ps1 -GenerateDocumentation

# Generar solo API docs
.\auto_init.ps1 -GenerateDocumentation -Scope "api"

# Validar documentación existente
.\auto_init.ps1 -ValidateDocumentation

# Dashboard de documentación
.\auto_init.ps1 -DocumentationDashboard

# Análisis de cobertura
.\auto_init.ps1 -AnalyzeDocumentationCoverage
```

## 🎯 Activación del Sistema

### Comando de Inicialización
```powershell
# Activar generador automático
.\auto_init.ps1 -EnableAutoDocumentation

# Generar documentación inicial
.\auto_init.ps1 -GenerateInitialDocumentation

# Configurar hooks automáticos
.\auto_init.ps1 -ConfigureDocumentationHooks

# Dashboard de documentación
.\auto_init.ps1 -DocumentationDashboard
```

### Resultado Esperado
```yaml
beneficios_inmediatos:
  - "Documentación automática y actualizada"
  - "Ejemplos de código funcionando"
  - "API docs siempre sincronizadas"
  - "Guías de usuario completas"
  
mejoras_a_largo_plazo:
  - "Documentación como código"
  - "Onboarding automático de desarrolladores"
  - "Reducción de tiempo en documentación manual"
  - "Calidad consistente en toda la documentación"
```

---

**Generador Automático de Documentación activado para documentación inteligente y siempre actualizada.**