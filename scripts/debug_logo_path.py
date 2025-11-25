#!/usr/bin/env python3
"""
Script simple para debuggear la carga del logo
"""

import sys
from pathlib import Path

# Agregar el directorio backend al path de Python
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

# Probar la ruta del logo directamente
logo_path = Path(__file__).parent.parent / "frontend" / "public" / "logo.png"
print(f"🎯 Verificando ruta del logo: {logo_path}")
print(f"📍 Existe: {logo_path.exists()}")
if logo_path.exists():
    print(f"📊 Tamaño: {logo_path.stat().st_size} bytes")
    
    # Intentar leer y convertir a base64
    try:
        import base64
        with open(logo_path, 'rb') as f:
            image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            print(f"✅ Base64 generado exitosamente!")
            print(f"📏 Tamaño del base64: {len(image_base64)} caracteres")
            print(f"🔍 Preview: {image_base64[:100]}...")
            
            # Crear data URL
            data_url = f"data:image/png;base64,{image_base64}"
            print(f"🌐 Data URL creada: {data_url[:100]}...")
            
    except Exception as e:
        print(f"❌ Error al procesar logo: {e}")
        import traceback
        traceback.print_exc()

# Verificar también las rutas relativas
print(f"\n🔍 Información de rutas:")
print(f"Script actual: {Path(__file__)}")
print(f"Backend dir: {backend_dir}")
print(f"Service path: {backend_dir / 'app' / 'services' / 'email_transaccional.py'}")

# Probar importar el servicio
try:
    from app.services.email_transaccional import EmailTransactionalService
    print(f"✅ Servicio importado exitosamente")
    
    # Verificar el método
    service = EmailTransactionalService()
    print(f"📧 Servicio creado")
    
except Exception as e:
    print(f"❌ Error importando servicio: {e}")
    import traceback
    traceback.print_exc()