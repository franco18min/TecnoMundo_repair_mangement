# Trae 2.0 – Sistema de Contexto, Mapeo y Optimización

Este directorio implementa un sistema completo para integrar Trae 2.0 con el chat de IA, proporcionando:

- Optimización de tokens (modo "max") con compresión, priorización, métricas y alertas.
- Sistema de mapeo fullstack (backend, frontend, base de datos) basado en YAML.
- Gestión de contexto automatizada con caché y priorización de la actividad previa.
- Motor de prompts inteligentes que ejecuta mapeos y contexto, mantiene coherencia con el historial e optimiza instrucciones.
- Sistema de rules para usuarios y proyectos.
- Procesamiento de lenguaje natural (comandos en español) con manejo de ambigüedades.
- Configuración por entorno (dev, test, prod), monitoreo de rendimiento y bucle de retroalimentación.
- Pruebas unitarias y de integración con Vitest.

## Estructura

```
.trae/
  config/               # Configuraciones por entorno
  rules/                # Reglas de usuario y de proyecto
  prompts/              # Prompt del sistema y plantillas de acciones
  mapping/              # Mapeos YAML (backend, frontend, database)
  src/                  # Código fuente TypeScript
    engine/             # Motor de prompts
    token/              # Optimización de tokens
    context/            # Gestión de contexto
    mapping/            # Registro y carga de mapeos
    nlp/                # Interpretación de lenguaje natural (ES)
    monitoring/         # Métricas y alertas
    feedback/           # Bucle de feedback
  tests/                # Pruebas unitarias e integración
  cache/                # Persistencia de contexto y métricas
  manifest.json         # Declaración de compatibilidad con Trae 2.0
  package.json          # Scripts y dependencias del sistema
  tsconfig.json         # Configuración TypeScript
  README.md             # Este documento
```

## Uso

1. Instalar dependencias (desde el directorio `.trae/`):
   - `npm install`
2. Ejecutar pruebas:
   - `npm test`
3. Construir el sistema:
   - `npm run build`

### CLI rápido (recomendado)

- Construir prompt optimizado:
  - `npm run prompt -- --env dev --target frontend --command "crear componente para frontend navbar" --details "Accesible con TailwindCSS y mobile-first"`
  - Flags:
    - `--env`: dev | test | prod (por defecto dev)
    - `--target`: backend | frontend | database (opcional; si falta, se deduce con NLP)
    - `--command`: texto del comando en español (obligatorio si no se usa STDIN)
    - `--details`: texto adicional (opcional)
    - `--confirmLast`: true|false (opcional; si true, limpia el contexto al final)

- Reporte de métricas de tokens:
  - `npm run report`

## Integración con el chat de IA

- El motor de prompts (`src/engine/PromptEngine.ts`) consume:
  - Rules (`rules/*.json`)
  - Mapeos (`mapping/*.yaml`)
  - Contexto persistido (`cache/context.json`)
  - Prompts (`prompts/system.md` y plantillas)
- Exporta funciones para generar prompts coherentes y optimizados.
- Incluye comportamiento de cierre: al finalizar una petición pregunta si es la última de la tarea; si lo es, limpia el contexto.

## Uso desde el chat del IDE de Trae (Agente IA)

Sigue estos pasos para que el agente de chat del IDE de Trae utilice el sistema alojado en `.trae`:

1) Preparación del sistema (una sola vez)
- En el directorio `.trae/` ejecuta:
  - `npm install`
  - `npm test` (debe pasar)
  - `npm run build` (genera `dist/` y habilita la entrada declarada en `manifest.json`)
- Verifica que existe `dist/index.js` y que `manifest.json` tiene `"entry": "dist/index.js"`.

2) Configurar el Agente IA del chat
- Usa el “Prompt Maestro” del sistema como Prompt del Sistema del agente (el contenido de `prompts/system.md`).
- El agente debe trabajar en español y seguirá las reglas y mapeos que se inyectan automáticamente cuando el motor construye el prompt (TraeAdapter + PromptEngine).

3) Flujo dentro del chat
- Escribe comandos naturales en español (ejemplos):
  - `crear componente para frontend navbar responsive`
  - `hay error en backend api de clientes`
  - `necesito migración para nueva columna en tickets`
- El pipeline del chat debe:
  - Interpretar el comando con NLP (NLPInterpreter).
  - Construir el prompt con TraeAdapter(`dev`|`test`|`prod`).buildPromptForTrae({ command, target, details }).
  - Enviar ese prompt optimizado al modelo de IA.
  - Al finalizar, el agente debe preguntar: “¿Es esta la última petición para esta tarea? Si lo es, limpiaré el contexto y te pediré una nueva tarea.”
  - Si confirmas que es la última, el sistema limpia el contexto (ContextManager.clear()).

4) Selección de entorno
- Por defecto usamos `dev`. Para producción, instanciar el adaptador como `TraeAdapter('prod')`.
- Ajusta umbrales de tokens y logging en `config/dev.json`, `config/test.json`, `config/prod.json`.

5) Verificación de caché y contexto
- `cache/context.json`: lista de elementos de contexto priorizados por fecha (se limpia al confirmar cierre).
- `cache/metrics.json`: entradas de métricas por cada prompt (estimatedTokens, length, ts, etc.).
- `cache/feedback.json` (opcional): observaciones para mejora continua.

6) Solución de problemas
- Si el chat no parece usar el sistema, asegúrate de haber corrido `npm run build` y de que `dist/index.js` exista.
- Reinicia el IDE de Trae o recarga el workspace si no detecta el `manifest.json` actualizado.
- Ejecuta `npm run demo` para validar el flujo completo.

### Integración de favicon y logo desde Supabase
1) Crea la tabla `system.photos` en el editor de SQL de Supabase:
```
create schema if not exists system;
create table if not exists system.photos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mime_type text not null default 'image/png',
  data_base64 text,
  url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```
2) Sube las imágenes:
- Convierte `photo/FAVICON.png` y `photo/LOGO.png` a base64 y haz `POST` a `/rest/v1/system.photos` con `{ name: 'favicon'|'logo', mime_type: 'image/png', data_base64: '<base64>' }`.
3) Frontend:
- Define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env`.
- El favicon se carga dinámicamente (index.html) desde `system.photos` (`name='favicon'`).
- El logo del sidebar se carga dinámicamente (Sidebar.jsx) desde `system.photos` (`name='logo'`).
4) Backend (emails):
- Define `SUPABASE_URL` y `SUPABASE_ANON_KEY` en el `.env` del backend.
- El círculo del encabezado del correo usará el logo (`name='logo'`) si está disponible; fallback al ícono 📧.

### Demo

- `npm run demo` ejecuta un flujo completo con NLP + PromptEngine y muestra métricas y la pregunta de cierre.

## Compatibilidad

- `manifest.json` declara compatibilidad con Trae >= 2.0.
- Los mapeos y reglas siguen convenciones neutras para integrarse con distintas bases de código.

## Seguridad y buenas prácticas

- Configuración CORS y JWT (solo referencia) en `rules/project.json`.
- Políticas de contraseñas y rate-limiting documentadas.
- Documentación concisa y comentarios técnicos en inglés cuando corresponde.

## Mantenimiento

- Métricas de tokens y rendimiento se guardan en `cache/metrics.json`.
- El bucle de feedback (`src/feedback/FeedbackLoop.ts`) recopila señales para ajuste continuo.