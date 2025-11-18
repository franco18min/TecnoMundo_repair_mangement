# Sistema de Manejo y Reporte de Errores

## Objetivo

- Proveer un manejo de errores consistente, seguro y observable para backend (FastAPI) y frontend (React), con recopilación estructurada y trazabilidad mediante `request_id`.

## Componentes

- Middleware `request_id` y manejadores globales en FastAPI (`backend/main.py`).
- Logger estructurado (`backend/app/core/logger.py`).
- Endpoint de reporte de errores del cliente (`POST /api/v1/error-reports`).
- Cliente HTTP unificado (`frontend/src/api/apiClient.js`).
- `ErrorBoundary` con botón de reporte (`frontend/src/components/common/ErrorBoundary.jsx`).
- Captura global de errores del navegador (`frontend/src/main.jsx`).

## Contrato de Error (API)

- Respuesta JSON estandarizada:
  - `code`: identificador del error (ej. `validation_error`, `http_error`, `internal_error`).
  - `message`: texto seguro para usuario/cliente.
  - `details`: objeto con datos mínimos (ej. `errors` de validación).
  - `request_id`: UUID para correlación.
  - `detail`: réplica de `message` para compatibilidad.
- Header: `X-Request-Id` en todas las respuestas.

## Flujo Backend

1. `RequestIdMiddleware` genera `request_id` por petición y lo adjunta al header `X-Request-Id`.
2. Manejadores globales:
   - `RequestValidationError` → `422 validation_error` + log categoría `VALIDATION`.
   - `HTTPException` → `http_error` con severidad según `status_code` + log categoría `API`.
   - `Exception` genérica → `500 internal_error` + log `CRITICAL`, categoría `SYSTEM`.
3. `StructuredLogger` guarda en `backend/errors/errors-YYYY-MM-DD.json` y eventos en `backend/errors/events-YYYY-MM-DD.json`.
4. Endpoint `POST /api/v1/error-reports` recibe reportes del cliente, registra evento `client_error_report`.

## Flujo Frontend

1. `apiClient` adjunta `Authorization` si existe y, ante errores, propaga `status`, `code`, `details`, `message` y `requestId` (desde `X-Request-Id`).
2. `ErrorBoundary` muestra UI de fallo y permite “Enviar reporte”, enviando ruta, user agent y contexto del error.
3. Captura global:
   - `window.onerror` y `unhandledrejection` reportan automáticamente al backend con metadatos mínimos.

## Ubicación de Registros

- Desarrollo:
  - Errores backend: `backend/errors/errors-YYYY-MM-DD.json`.
  - Eventos/reportes cliente: `backend/errors/events-YYYY-MM-DD.json`.
  - Consola backend: salida de `uvicorn`.
- Producción:
  - Backend runtime: `/tmp/tecnoapp-backend.log`.
  - NGINX: `/var/log/nginx/error.log` y access log del vHost.
  - PostgreSQL: `journalctl -u postgresql -f`, `sudo pg_lsclusters`.

## Uso en Desarrollo

- Backend: `./venv/Scripts/python.exe -m uvicorn main:app --reload --port 9001`.
- Verificar:
  - `GET /hello` devuelve `200` y `X-Request-Id`.
  - `POST /api/v1/error-reports` sin body devuelve `422 validation_error` y se registra.
  - `GET /api/v1/repair-orders` sin token devuelve `401 http_error` y se registra.
  - Provocar un error en React para ver `ErrorBoundary` y enviar reporte.

## Uso en Producción

- Backend: `.env` con `ENVIRONMENT=production`, despliegue habitual.
- Frontend: `VITE_ENVIRONMENT=production`, `VITE_API_BASE_URL=https://api.tecnoapp.ar`.
- Verificación: `curl -I https://api.tecnoapp.ar/hello` comprueba `X-Request-Id`.

## Seguridad y Privacidad

- No exponer stack traces al usuario en producción.
- No capturar PII por defecto en reportes; solo metadatos mínimos.
- Mensajes seguros y mínimos en 4xx/5xx; detalles internos solo en logs.

## Extensión y Monitoreo

- Opcional: integrar Sentry (backend y frontend) y/o OpenTelemetry.
- Métricas y alertas: contar errores por categoría/severidad, latencias por endpoint.

## Referencias de Código

- `backend/main.py:41-83` – Middleware `request_id` y handlers.
- `backend/app/core/logger.py:27-41`, `backend/app/core/logger.py:117-135` – Logger estructurado.
- `backend/app/api/v1/endpoints/error_reports.py:1-31` – Endpoint de reportes.
- `backend/app/api/v1/api.py:4-21` – Registro del router.
- `frontend/src/api/apiClient.js:28-52` – Propagación de `requestId`, `code`, `details`.
- `frontend/src/components/common/ErrorBoundary.jsx:26-84` – Botón de reporte y UI.
- `frontend/src/main.jsx:17-56` – Captura global de errores de navegador.