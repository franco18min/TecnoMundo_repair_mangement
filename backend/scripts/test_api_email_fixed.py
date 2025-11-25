"""
Script para obtener token de administrador y probar endpoint de email
"""

import os, sys
import requests
from urllib.parse import urlencode

# Asegurar que el paquete 'app' sea resolvible al ejecutar como script
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Establecer las variables de entorno correctas para el email
os.environ['EMAIL_API_BASE_URL'] = 'https://api.envialosimple.email/api/v1'
os.environ['EMAIL_API_KEY'] = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjIyMTEwNTEsImV4cCI6NDkxNzg4NDY1MSwicm9sZXMiOlsiUk9MRV9BRE1JTiIsIlJPTEVfVVNFUiJdLCJraWQiOiI2OTA5MzRlYjdkNmYwNTg0YjMwYjFkY2YiLCJhaWQiOiI2OGZhNDk4ZDJmNjZkMzM0ZmMwMjNjNDciLCJ1c2VybmFtZSI6Im9tYXJjaWFyZXNAZ21haWwuY29tIn0.lB6sa0Gl_ec-GVBiBalBdfpCGeTB_p9gxFspAXFYteeRe85JI9_IFZPORmkXwi4-WpQ3D24lIabUoxddmSV3KvzVp0bbT_M9fvhPdwHyigTDugbB-dSFRYbytkIGUq48Mn13msopCwrWzb2ARcRn3JY_Edm0pNPmXeUG4z6ZMkYa9gXdxdFM1AtfGv5z07a_RyegvNlYnM7Qxba9LrQAEIDc4c__C0cZSEbAr165RyYj0ork6eaNkZNrH0g4-wG3TplHj_dV83J3wo7Y0Yu11L9nSxnbKCd7ygFw4kUDpDUMo4TxB5Vlah682KlqFat-UY4yPJCObJYr2QTYui92pw'

def login_and_test_email():
    # URL del backend
    base_url = "http://localhost:9001/api/v1"
    
    # Credenciales de administrador (ajustar según tu configuración)
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        # Intentar login con form-data
        print("Intentando login con credenciales de administrador...")
        
        # Preparar datos como form-data
        form_data = urlencode(login_data)
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        login_response = requests.post(f"{base_url}/auth/login", data=form_data, headers=headers)
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get("access_token")
            print(f"✅ Login exitoso. Token obtenido: {token[:20]}...")
            
            # Probar endpoint de email
            email_data = {
                "to": "magnagg@gmail.com",
                "subject": "Prueba desde endpoint API",
                "message": "Este es un correo de prueba enviado desde el endpoint de la API"
            }
            
            api_headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            print("Enviando correo de prueba desde endpoint...")
            email_response = requests.post(f"{base_url}/email-test/send", json=email_data, headers=api_headers)
            
            if email_response.status_code == 200:
                print(f"✅ Correo enviado exitosamente desde API")
                print(f"Respuesta: {email_response.json()}")
            else:
                print(f"❌ Error en envío de email desde API: {email_response.status_code}")
                print(f"Respuesta: {email_response.text}")
                
        else:
            print(f"❌ Error en login: {login_response.status_code}")
            print(f"Respuesta: {login_response.text}")
            
            # Mostrar el formato esperado
            print("\nFormato esperado: application/x-www-form-urlencoded")
            print("Campos requeridos: username, password")
            
    except Exception as e:
        print(f"❌ Error general: {str(e)}")

if __name__ == "__main__":
    login_and_test_email()