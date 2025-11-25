"""
Script para verificar variables de entorno del sistema
"""

import os

print("=== Variables de Entorno del Sistema ===")
email_vars = ['EMAIL_API_BASE_URL', 'EMAIL_API_KEY', 'EMAIL_PROVIDER', 'EMAIL_FROM', 'EMAIL_FROM_NAME', 'EMAIL_REPLY_TO']

for var in email_vars:
    value = os.environ.get(var)
    if value:
        if var == 'EMAIL_API_KEY':
            print(f"{var}: ***{value[-8:] if len(value) > 8 else value}")
        else:
            print(f"{var}: {value}")
    else:
        print(f"{var}: No definida")

print("\n=== Archivos .env en el proyecto ===")
import glob
for file in glob.glob("**/.env*", recursive=True):
    print(f"Encontrado: {file}")

print("\n=== Ruta actual ===")
print(f"Working directory: {os.getcwd()}")
print(f"Script directory: {os.path.dirname(os.path.abspath(__file__))}")