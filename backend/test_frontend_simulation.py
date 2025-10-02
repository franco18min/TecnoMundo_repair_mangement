#!/usr/bin/env python3
"""
Script que simula exactamente lo que hace el frontend
"""

import requests
import io
from PIL import Image

# Configuración
BASE_URL = "http://127.0.0.1:8001"  # Usar la misma URL que el frontend
ORDER_ID = 105

def create_test_image():
    """Crear una imagen de prueba simple"""
    img = Image.new('RGB', (100, 100), color='blue')
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='JPEG')
    img_buffer.seek(0)
    return img_buffer

def get_auth_token():
    """Obtener token de autenticación"""
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", data=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Error al hacer login: {response.status_code} - {response.text}")
        return None

def test_frontend_simulation():
    """Simular exactamente lo que hace el frontend"""
    print("🔍 Simulando petición del frontend...")
    
    # Obtener token
    token = get_auth_token()
    if not token:
        print("❌ No se pudo obtener el token")
        return
    
    print(f"✅ Token obtenido")
    
    # Crear imagen de prueba
    test_image = create_test_image()
    
    # Preparar headers exactamente como el frontend
    headers = {
        "Authorization": f"Bearer {token}"
        # No incluir Content-Type para FormData, como hace el frontend
    }
    
    # Preparar FormData exactamente como el frontend
    files = {
        'file': ('test_image.jpg', test_image, 'image/jpeg')
    }
    
    data = {
        'order_id': str(ORDER_ID),  # String como en el frontend
        'note': ''  # Nota vacía como en el frontend
    }
    
    print(f"🔍 Enviando POST a {BASE_URL}/api/v1/repair-order-photos/")
    print(f"🔍 Headers: {headers}")
    print(f"🔍 Data: {data}")
    print(f"🔍 Files: {list(files.keys())}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/repair-order-photos/",
            headers=headers,
            files=files,
            data=data
        )
        
        print(f"🔍 Status Code: {response.status_code}")
        print(f"🔍 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Simulación exitosa!")
            print(f"🔍 Response: {response.json()}")
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"🔍 Error Data: {error_data}")
            except:
                print(f"🔍 Response Text: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_frontend_simulation()