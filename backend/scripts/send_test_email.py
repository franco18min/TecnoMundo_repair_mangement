"""
Script rápido para enviar un correo de prueba usando el servicio de email transaccional.

Uso:
    python backend/scripts/send_test_email.py <destinatario_email>

Requiere backend/.env configurado con claves del servicio.
"""

import os, sys

# Asegurar que el paquete 'app' sea resolvible al ejecutar como script
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.services.email_transaccional import EmailTransactionalService

def main():
    if len(sys.argv) < 2:
        print("Uso: python backend/scripts/send_test_email.py destinatario@example.com")
        sys.exit(1)
    to = sys.argv[1]
    svc = EmailTransactionalService()
    subject = "Prueba de envío TecnoMundo"
    html = (
        "<h3>Prueba de envío</h3>"
        "<p>Este es un correo de prueba del sistema de notificaciones. No responder.</p>"
        "<p style='color:#6b7280;font-size:12px'>Este es un correo automático. Por favor, no respondas a este mensaje.</p>"
    )
    ok = svc.send_email(to, subject, html)
    if ok:
        print(f"✅ Correo de prueba enviado a {to}")
    else:
        print(f"❌ Fallo en el envío de correo a {to}")

if __name__ == "__main__":
    main()