# Orquestación paralela de agentes en Trae 2.0 (modo solo)

## Visión general
Trae 2.0 en modo solo permite lanzar y coordinar múltiples agentes de forma paralela dentro de una misma acción. Esto acelera la investigación y el análisis cuando descompones un objetivo en subconsultas independientes.

## Capacidades clave
- Paralelismo: envía varias invocaciones de agentes en una sola acción; se ejecutan en paralelo.
- Respuestas únicas por agente: cada agente devuelve un único mensaje con sus hallazgos.
- Sin estado entre invocaciones: no hay memoria conversacional por agente; incluye todos los requisitos en cada invocación.
- Entrega al usuario: los resultados del agente no se muestran automáticamente; resume e integra sus hallazgos en tu salida.

## Cuándo usar paralelismo
- Búsquedas amplias (p.ej., autenticación, pagos, logging) sobre el repositorio.
- Mapeo de arquitectura y dependencias.
- Verificación cruzada en áreas separadas del código.

## Cómo hacerlo (paso a paso)
1. Define el objetivo y descompón en 3–6 subconsultas concretas.
2. Prepara una invocación por subconsulta, especificando exactamente qué debe devolver el agente.
3. Lanza todas las invocaciones dentro de una misma acción para que corran en paralelo.
4. Recoge cada respuesta y crea un resumen integrado y accionable para el usuario.

## Estructura de la invocación de agente
Cada invocación debe incluir:
- `description`: breve etiqueta (3–5 palabras).
- `query`: tarea precisa (≤30 palabras, sin ambigüedad, sin fabricación).
- `subagent_type`: tipo de agente especializado (p.ej., `search`).
- `response_language`: idioma deseado (p.ej., `es`).

Ejemplo de múltiples invocaciones en paralelo dentro de una misma acción:

```json
{
  "description": "Mapa autenticación",
  "query": "Localiza flujo de login y verificación JWT, devuelve rutas y funciones",
  "subagent_type": "search",
  "response_language": "es"
}
{
  "description": "Pagos backend",
  "query": "Encuentra dónde se procesa pago y validaciones, devuelve endpoints y modelos",
  "subagent_type": "search",
  "response_language": "es"
}
{
  "description": "Uso de logger",
  "query": "Localiza inicialización/configuración del logger y puntos de uso clave",
  "subagent_type": "search",
  "response_language": "es"
}
```

Tras recibir las respuestas, entrega al usuario un resumen con:
- Rutas y archivos clave por área.
- Funciones críticas con referencias `ruta:línea`.
- Riesgos/pendientes detectados.

## Buenas prácticas
- Especifica exactamente qué información debe devolver cada agente.
- Evita preguntas abiertas; usa verbos de acción y límites claros.
- Usa lenguaje consistente (`response_language`) para respuestas homogéneas.
- Lanza agentes sólo donde haya independencia real para maximizar el paralelismo.
- Integra resultados con referencias precisas `file_path:line_number`.

## Limitaciones y advertencias
- Cada agente es independiente y sin estado: incluye todo lo necesario en la `query`.
- No puedes seguir conversando con un agente tras su respuesta: prepara bien los requerimientos.
- Los resultados del agente no aparecen solos ante el usuario: resume y presenta tú los hallazgos.
- Usa agentes para investigación/lectura; no les pidas escribir código salvo que el tipo de agente lo soporte explícitamente.

## Ejemplo de flujo
1. Objetivo: documentar autenticación.
2. Lanza en paralelo: búsqueda de rutas de login, middleware JWT, manejo de errores.
3. Recoge respuestas: archivos y funciones con referencias.
4. Entrega resumen: diagrama de flujo, puntos de validación, riesgos.

## Solución de problemas
- Respuestas vacías: ajusta `query` con nombres de módulos, patrones y límites de directorio.
- Resultados excesivos: pide “devuelve sólo rutas + nombres de función”, o limita a directorios.
- Ambigüedad: especifica el tipo de retorno deseado (lista de archivos, funciones, rutas, etc.).

## Checklist rápido
- [ ] Descomponer el objetivo en subconsultas independientes.
- [ ] Redactar `query` precisas con resultados esperados.
- [ ] Lanzar todas las invocaciones en una sola acción.
- [ ] Integrar y presentar hallazgos con referencias.