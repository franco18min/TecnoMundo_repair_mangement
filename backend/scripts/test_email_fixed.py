"""
Script de prueba con variables de entorno correctas
"""

import os, sys

# Establecer las variables de entorno correctas
os.environ['EMAIL_API_BASE_URL'] = 'https://api.envialosimple.email/api/v1'
os.environ['EMAIL_API_KEY'] = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjIyMTEwNTEsImV4cCI6NDkxNzg4NDY1MSwicm9sZXMiOlsiUk9MRV9BRE1JTiIsIlJPTEVfVVNFUiJdLCJraWQiOiI2OTA5MzRlYjdkNmYwNTg0YjMwYjFkY2YiLCJhaWQiOiI2OGZhNDk4ZDJmNjZkMzM0ZmMwMjNjNDciLCJ1c2VybmFtZSI6Im9tYXJjaWFyZXNAZ21haWwuY29tIn0.lB6sa0Gl_ec-GVBiBalBdfpCGeTB_p9gxFspAXFYteeRe85JI9_IFZPORmkXwi4-WpQ3D24lIabUoxddmSV3KvzVp0bbT_M9fvhPdwHyigTDugbB-dSFRYbytkIGUq48Mn13msopCwrWzb2ARcRn3JY_Edm0pNPmXeUG4z6ZMkYa9gXdxdFM1AtfGv5z07a_RyegvNlYnM7Qxba9LrQAEIDc4c__C0cZSEbAr165RyYj0ork6eaNkZNrH0g4-wG3TplHj_dV83J3wo7Y0Yu11L9nSxnbKCd7ygFw4kUDpDUMo4TxB5Vlah682KlqFat-UY4yPJCObJYr2QTYui92pw'
os.environ['EMAIL_FROM'] = 'no-reply@tecnoapp.ar'
os.environ['EMAIL_FROM_NAME'] = 'TecnoMundo'
os.environ['EMAIL_REPLY_TO'] = 'no-reply@tecnoapp.ar'

# Asegurar que el paquete 'app' sea resolvible al ejecutar como script
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.services.email_transaccional import EmailTransactionalService

def main():
    to = "magnagg@gmail.com"
    svc = EmailTransactionalService()
    subject = "Prueba de envío TecnoMundo - Variables Corregidas"
    html = (
        "<h3>Prueba de envío con variables corregidas</h3>"
        "<p>Este es un correo de prueba del sistema de notificaciones con las variables de entorno correctas.</p>"
        "<p style='color:#6b7280;font-size:12px'>Este es un correo automático. Por favor, no respondas a este mensaje.</p>"
    )
    
    print(f"Intentando enviar a: {to}")
    print(f"URL base: {svc.api_base}")
    print(f"API Key: {'***' + svc.api_key[-8:] if svc.api_key else 'VACÍO'}")
    
    ok = svc.send_email(to, subject, html)
    if ok:
        print(f"✅ Correo de prueba enviado a {to}")
    else:
        print(f"❌ Fallo en el envío de correo a {to}")

if __name__ == "__main__":
    main()