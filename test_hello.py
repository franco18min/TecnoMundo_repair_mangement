import requests

URL = "http://127.0.0.1:8001/hello"

print(f"--- Probando el endpoint de 'Hola Mundo' en {URL} ---")

try:
    response = requests.get(URL)
    print(f"\nRespuesta recibida con código de estado: {response.status_code}")
    print("Respuesta (JSON):")
    print(response.json())

except Exception as e:
    print(f"\n--- ERROR ---")
    print(f"No se pudo conectar o procesar la respuesta. Detalle: {e}")