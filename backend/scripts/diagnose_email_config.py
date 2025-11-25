"""
Script de diagnóstico para verificar configuración de email
"""

import os, sys

# Asegurar que el paquete 'app' sea resolvible al ejecutar como script
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.core.config import settings

print("=== Diagnóstico de Configuración de Email ===")
print(f"EMAIL_PROVIDER: {settings.EMAIL_PROVIDER}")
print(f"EMAIL_API_BASE_URL: '{settings.EMAIL_API_BASE_URL}'")
print(f"EMAIL_API_KEY: {'***' + settings.EMAIL_API_KEY[-8:] if settings.EMAIL_API_KEY else 'VACÍO'}")
print(f"EMAIL_FROM: {settings.EMAIL_FROM}")
print(f"EMAIL_FROM_NAME: {settings.EMAIL_FROM_NAME}")
print(f"EMAIL_REPLY_TO: {settings.EMAIL_REPLY_TO}")
print(f"CLIENT_PORTAL_BASE_URL: {settings.CLIENT_PORTAL_BASE_URL}")

# Verificar si las variables están vacías
if not settings.EMAIL_API_BASE_URL:
    print("\n⚠️  ERROR: EMAIL_API_BASE_URL está vacía!")
if not settings.EMAIL_API_KEY:
    print("\n⚠️  ERROR: EMAIL_API_KEY está vacía!")
if not settings.EMAIL_API_BASE_URL or not settings.EMAIL_API_KEY:
    print("\n❌ El servicio de email no funcionará hasta que configures estas variables.")
else:
    print(f"\n✅ Configuración completa. URL base: {settings.EMAIL_API_BASE_URL}")
    # Verificar que la URL termine sin barra diagonal
    if settings.EMAIL_API_BASE_URL.endswith('/'):
        print("⚠️  ADVERTENCIA: La URL base termina con '/'. Esto puede causar doble barra en las peticiones.")