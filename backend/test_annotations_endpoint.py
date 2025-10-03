#!/usr/bin/env python3
"""
Script para probar el endpoint de anotaciones directamente
"""

import requests
import json

# Configuración
BASE_URL = "http://localhost:8001"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"

def get_auth_token():
    """Obtener token de autenticación"""
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(LOGIN_URL, data=login_data)
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"❌ Error al hacer login: {response.status_code}")
            print(f"❌ Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def get_repair_orders():
    """Obtener órdenes de reparación para encontrar fotos"""
    token = get_auth_token()
    if not token:
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Obtener órdenes
        response = requests.get(f"{BASE_URL}/api/v1/repair-orders/", headers=headers)
        if response.status_code == 200:
            orders = response.json()
            print(f"✅ Encontradas {len(orders)} órdenes")
            
            # Buscar órdenes con fotos
            for order in orders[:3]:  # Solo las primeras 3
                order_id = order["id"]
                print(f"🔍 Orden {order_id}: {order.get('device_type', 'N/A')}")
                
                # Obtener fotos de la orden
                photos_response = requests.get(f"{BASE_URL}/api/v1/repair-orders/{order_id}/photos", headers=headers)
                if photos_response.status_code == 200:
                    photos = photos_response.json()
                    print(f"  📸 Fotos: {len(photos)}")
                    for photo in photos:
                        print(f"    - Foto ID: {photo['id']}")
                        return photo['id']  # Retornar el primer ID de foto encontrado
                else:
                    print(f"  ❌ Error obteniendo fotos: {photos_response.status_code}")
        else:
            print(f"❌ Error obteniendo órdenes: {response.status_code}")
            print(f"❌ Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return None

def test_annotations_with_photo_id(photo_id):
    """Probar el endpoint de anotaciones con un ID de foto válido"""
    token = get_auth_token()
    if not token:
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    annotations_url = f"{BASE_URL}/api/v1/repair-order-photos/{photo_id}/annotations"
    
    # Datos de prueba
    test_data = {
        "markers": [
            {"x": 50.0, "y": 30.0, "color": "#ff0000"}
        ],
        "drawings": [
            {"path": "M10,10 L20,20", "color": "#00ff00", "strokeWidth": 2.0}
        ]
    }
    
    print(f"🔍 Probando anotaciones en foto ID: {photo_id}")
    print(f"🔍 URL: {annotations_url}")
    print(f"🔍 Data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.patch(annotations_url, headers=headers, json=test_data)
        print(f"🔍 Status: {response.status_code}")
        print(f"🔍 Response: {response.text}")
        
        if response.status_code == 422:
            try:
                error_data = response.json()
                print(f"🔍 Error details: {json.dumps(error_data, indent=2)}")
            except:
                pass
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando prueba del endpoint de anotaciones...")
    photo_id = get_repair_orders()
    if photo_id:
        test_annotations_with_photo_id(photo_id)
    else:
        print("❌ No se encontraron fotos para probar")