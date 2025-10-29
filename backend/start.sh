#!/usr/bin/env bash
set -euo pipefail

# TecnoMundo Repair Management - Arranque de backend para producción
# Carga variables de entorno si existe backend/.env
if [ -f "$(dirname "$0")/.env" ]; then
  echo "[start] Cargando variables desde backend/.env"
  set -a
  source "$(dirname "$0")/.env"
  set +a
fi

APP_PORT="${APP_PORT:-9001}"
WORKERS="${WORKERS:-2}"

echo "[start] Iniciando Uvicorn en 127.0.0.1:${APP_PORT} con ${WORKERS} workers"
exec uvicorn main:app \
  --host 127.0.0.1 \
  --port "${APP_PORT}" \
  --workers "${WORKERS}" \
  --log-level info

# Alternativa Gunicorn (ASGI) si se prefiere:
# exec gunicorn -k uvicorn.workers.UvicornWorker main:app \
#   --bind 127.0.0.1:${APP_PORT} \
#   --workers ${WORKERS} \
#   --access-logfile - \
#   --error-logfile -