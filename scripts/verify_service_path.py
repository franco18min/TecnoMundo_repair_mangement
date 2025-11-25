#!/usr/bin/env python3
"""
Script para verificar la ruta exacta que usa el servicio
"""

import sys
from pathlib import Path

# Agregar el directorio backend al path de Python
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

# Simular la ruta que usa el servicio
service_path = Path(__file__).parent.parent / "backend" / "app" / "services" / "email_transaccional.py"
print(f"📍 Ruta del servicio: {service_path}")
print(f"📍 Existe el servicio: {service_path.exists()}")

# Calcular la ruta relativa como lo hace el servicio
# Path(__file__).parent.parent.parent.parent / "frontend" / "public" / candidate
frontend_public_path = service_path.parent.parent.parent.parent / "frontend" / "public"
print(f"📍 Ruta frontend/public: {frontend_public_path}")
print(f"📍 Existe frontend/public: {frontend_public_path.exists()}")

logo_path = frontend_public_path / "logo.png"
print(f"📍 Ruta del logo: {logo_path}")
print(f"📍 Existe el logo: {logo_path.exists()}")

# También verificar la ruta anterior (la incorrecta)
old_frontend_public_path = service_path.parent.parent.parent / "frontend" / "public"
print(f"\n📍 Ruta ANTIGUA frontend/public: {old_frontend_public_path}")
print(f"📍 Existe la ruta antigua: {old_frontend_public_path.exists()}")

# Ver todos los archivos en frontend/public
if frontend_public_path.exists():
    print(f"\n📁 Archivos en {frontend_public_path}:")
    for file in frontend_public_path.iterdir():
        print(f"   - {file.name}")