#!/usr/bin/env bash
set -u
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUT_DIR="${OUT_DIR:-/home/apitecnoapp/health}"
OUT_FILE="$OUT_DIR/health_$TIMESTAMP.txt"
mkdir -p "$OUT_DIR"
echo "HEALTH CHECK $(date -Iseconds)" >"$OUT_FILE"
echo "HOST: $(hostname)" >>"$OUT_FILE"
echo "KERNEL: $(uname -a)" >>"$OUT_FILE"
echo >>"$OUT_FILE"
run() { echo "== $1 ==" >>"$OUT_FILE"; shift; "$@" >>"$OUT_FILE" 2>&1 || true; echo >>"$OUT_FILE"; }
run "Backend procesos (uvicorn)" bash -lc "ps aux | grep uvicorn | grep -v grep"
run "Backend puerto 9001" bash -lc "(command -v netstat >/dev/null && netstat -tulpn | grep :9001) || (command -v ss >/dev/null && ss -lntp | grep :9001) || true"
run "Backend /hello" curl -I http://localhost:9001/hello
run "API dominio" curl -I https://api.tecnoapp.ar
run "Preflight CORS client-search" curl -I -X OPTIONS "https://api.tecnoapp.ar/api/v1/client-orders/client-search?q=115" -H "Origin: https://tecnoapp.ar" -H "Access-Control-Request-Method: GET"
run "Logs backend últimos 200" tail -n 200 /tmp/tecnoapp-backend.log
run "Estado NGINX" systemctl is-active nginx
run "Errores NGINX últimos 100" tail -n 100 /var/log/nginx/error.log
run "Archivos frontend clave" bash -lc "ls -lh /home/tecnoapp/htdocs/tecnoapp.ar/index.html /home/tecnoapp/htdocs/tecnoapp.ar/favicon.ico /home/tecnoapp/htdocs/tecnoapp.ar/favicon.png 2>/dev/null || ls -lh /home/tecnoapp/htdocs/tecnoapp.ar || true"
run "Frontend dominio" curl -I https://tecnoapp.ar
run "Clusters PostgreSQL" bash -lc "(command -v pg_lsclusters >/dev/null && pg_lsclusters) || echo 'pg_lsclusters no disponible'"
run "PostgreSQL puerto 5433" bash -lc "(command -v netstat >/dev/null && netstat -tulpn | grep :5433) || (command -v ss >/dev/null && ss -lntp | grep :5433) || true"
run "Disco" df -h
run "Memoria" free -h
run "Carga" uptime
FRONTEND_DOMAIN="${FRONTEND_DOMAIN:-tecnoapp.ar}"
API_DOMAIN="${API_DOMAIN:-api.tecnoapp.ar}"
API_LOCAL="${API_LOCAL:-http://localhost:9001}"
FRONTEND_ROOT="${FRONTEND_ROOT:-/home/tecnoapp/htdocs/tecnoapp.ar}"
run "Timings frontend" bash -lc "curl -s -o /dev/null -w 'time_namelookup:%{time_namelookup}\\ntime_connect:%{time_connect}\\ntime_appconnect:%{time_appconnect}\\ntime_starttransfer:%{time_starttransfer}\\ntime_total:%{time_total}\\n' https://$FRONTEND_DOMAIN"
run "Timings api" bash -lc "curl -s -o /dev/null -w 'time_namelookup:%{time_namelookup}\\ntime_connect:%{time_connect}\\ntime_appconnect:%{time_appconnect}\\ntime_starttransfer:%{time_starttransfer}\\ntime_total:%{time_total}\\n' https://$API_DOMAIN/hello"
run "SSL frontend" bash -lc "echo | openssl s_client -servername $FRONTEND_DOMAIN -connect $FRONTEND_DOMAIN:443 2>/dev/null | openssl x509 -noout -issuer -subject -dates"
run "SSL api" bash -lc "echo | openssl s_client -servername $API_DOMAIN -connect $API_DOMAIN:443 2>/dev/null | openssl x509 -noout -issuer -subject -dates"
run "DNS frontend" bash -lc "getent hosts $FRONTEND_DOMAIN || dig +short $FRONTEND_DOMAIN || true"
run "DNS api" bash -lc "getent hosts $API_DOMAIN || dig +short $API_DOMAIN || true"
run "Backend preflight" curl -i -X OPTIONS "$API_LOCAL/api/v1/client-orders/client-search?q=115" -H "Origin: https://$FRONTEND_DOMAIN" -H "Access-Control-Request-Method: GET"
run "API /hello" curl -i "https://$API_DOMAIN/hello"
run "API preflight" curl -i -X OPTIONS "https://$API_DOMAIN/api/v1/client-orders/client-search?q=115" -H "Origin: https://$FRONTEND_DOMAIN" -H "Access-Control-Request-Method: GET"
run "CORS GET client-search" curl -i -H "Origin: https://$FRONTEND_DOMAIN" "https://$API_DOMAIN/api/v1/client-orders/client-search?q=115"
run "WS handshake" curl -i -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Origin: https://$FRONTEND_DOMAIN" "https://$API_DOMAIN/api/v1/notifications/ws"
run "NGINX accesos" tail -n 100 /var/log/nginx/access.log
run "NGINX vhost frontend" bash -lc "grep -R \"server_name $FRONTEND_DOMAIN\" /etc/nginx/sites-enabled || ls /etc/nginx/sites-enabled"
run "NGINX vhost api" bash -lc "grep -R \"server_name $API_DOMAIN\" /etc/nginx/sites-enabled || ls /etc/nginx/sites-enabled"
run "Puertos abiertos" bash -lc "(command -v ss >/dev/null && ss -lntp | head -n 200) || (command -v netstat >/dev/null && netstat -tulpn | head -n 200) || true"
run "Permisos start.sh" bash -lc "stat /home/apitecnoapp/htdocs/api.tecnoapp.ar/TecnoMundo_repair_mangement/backend/start.sh 2>/dev/null || echo 'start.sh no encontrado'"
run "ALLOWED_ORIGINS .env" bash -lc "grep -E '^ALLOWED_ORIGINS=' /home/apitecnoapp/htdocs/api.tecnoapp.ar/TecnoMundo_repair_mangement/backend/.env 2>/dev/null || echo 'variable no encontrada'"
run "PostgreSQL ready" bash -lc "(command -v pg_isready >/dev/null && pg_isready -h localhost -p 5433) || echo 'pg_isready no disponible'"
echo "Salida: $OUT_FILE" >>"$OUT_FILE"
