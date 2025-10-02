#!/usr/bin/env python3
"""
Script de prueba para diagnosticar problemas de upload de fotos
"""

import requests
import os
import io
from PIL import Image

# Configuración
BASE_URL = "http://localhost:8001"
ORDER_ID = 105  # ID de orden existente

def create_test_image():
    """Crear una imagen de prueba simple"""
    # Crear una imagen RGB de 100x100 píxeles
    img = Image.new('RGB', (100, 100), color='red')
    
    # Guardar en un buffer de memoria
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

def test_photo_upload():
    """Probar el upload de fotos"""
    print("🔍 Iniciando prueba de upload de fotos...")
    
    # Obtener token
    print("🔍 Obteniendo token de autenticación...")
    token = get_auth_token()
    if not token:
        print("❌ No se pudo obtener el token")
        return
    
    print(f"✅ Token obtenido: {token[:20]}...")
    
    # Crear imagen de prueba
    print("🔍 Creando imagen de prueba...")
    test_image = create_test_image()
    
    # Preparar headers
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Preparar datos del formulario
    files = {
        'file': ('test_image.jpg', test_image, 'image/jpeg')
    }
    
    data = {
        'order_id': str(ORDER_ID),
        'note': 'Imagen de prueba'
    }
    
    print(f"🔍 Enviando POST a {BASE_URL}/api/v1/repair-order-photos/")
    print(f"🔍 Data: {data}")
    print(f"🔍 Files: {list(files.keys())}")
    
    # Hacer la petición al endpoint principal
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/repair-order-photos/",
            headers=headers,
            files=files,
            data=data
        )
        
        print(f"🔍 Status Code: {response.status_code}")
        print(f"🔍 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Prueba exitosa!")
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_photo_upload()