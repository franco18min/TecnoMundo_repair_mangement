#!/usr/bin/env python3
"""
Script para probar la subida de fotos simulando exactamente el frontend corregido
"""

import requests
import json
from io import BytesIO
from PIL import Image

# Configuración
BASE_URL = "http://127.0.0.1:8001"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
UPLOAD_URL = f"{BASE_URL}/api/v1/repair-order-photos/"

def test_photo_upload():
    print("🧪 Iniciando prueba de subida de fotos (Frontend Corregido)")
    
    # 1. Obtener token de autenticación
    print("1️⃣ Obteniendo token de autenticación...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    login_response = requests.post(LOGIN_URL, data=login_data)
    if login_response.status_code != 200:
        print(f"❌ Error en login: {login_response.status_code}")
        print(login_response.text)
        return
    
    token = login_response.json()["access_token"]
    print(f"✅ Token obtenido: {token[:20]}...")
    
    # 2. Crear imagen de prueba
    print("2️⃣ Creando imagen de prueba...")
    img = Image.new('RGB', (100, 100), color='red')
    img_buffer = BytesIO()
    img.save(img_buffer, format='JPEG')
    img_buffer.seek(0)
    
    # 3. Preparar FormData exactamente como el frontend corregido
    print("3️⃣ Preparando FormData...")
    files = {
        'file': ('test_image.jpg', img_buffer, 'image/jpeg')
    }
    
    data = {
        'order_id': '105',  # Como string, igual que el frontend
        'note': ''  # Siempre incluido, igual que la corrección
    }
    
    # 4. Headers sin Content-Type (como la corrección)
    headers = {
        'Authorization': f'Bearer {token}'
        # Sin Content-Type para que requests lo establezca automáticamente
    }
    
    print("4️⃣ Enviando petición POST...")
    print(f"   URL: {UPLOAD_URL}")
    print(f"   Headers: {headers}")
    print(f"   Data: {data}")
    print(f"   File: test_image.jpg (JPEG)")
    
    # 5. Enviar petición
    response = requests.post(UPLOAD_URL, headers=headers, data=data, files=files)
    
    print(f"5️⃣ Respuesta recibida:")
    print(f"   Status Code: {response.status_code}")
    print(f"   Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        print("✅ ¡Subida exitosa!")
        response_data = response.json()
        print(f"   ID de foto: {response_data.get('id')}")
        print(f"   Order ID: {response_data.get('order_id')}")
        print(f"   Nota: '{response_data.get('note')}'")
        print(f"   Tamaño de foto: {len(response_data.get('photo_data', ''))} caracteres")
    else:
        print("❌ Error en la subida:")
        try:
            error_data = response.json()
            print(f"   Error: {json.dumps(error_data, indent=2)}")
        except:
            print(f"   Error text: {response.text}")

if __name__ == "__main__":
    test_photo_upload()