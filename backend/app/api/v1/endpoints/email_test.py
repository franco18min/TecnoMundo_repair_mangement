# backend/app/api/v1/endpoints/email_test.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1 import dependencies as deps
from app.models.user import User
from app.services.email_transaccional import EmailTransactionalService

router = APIRouter()

class EmailTestPayload(BaseModel):
    to: str
    subject: str = "Prueba de envío TecnoMundo"
    message: str = "Este es un correo de prueba del sistema de notificaciones. No responder."

@router.post("/send")
def send_test_email(
    payload: EmailTestPayload,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin)
):
    """
    Envía un correo de prueba al destinatario indicado. Solo administradores.
    """
    svc = EmailTransactionalService()
    html = (
        f"<h3>Prueba de envío</h3>"
        f"<p>{payload.message}</p>"
        f"<p style='color:#6b7280;font-size:12px'>Este es un correo automático. Por favor, no respondas a este mensaje.</p>"
    )
    ok = svc.send_email(str(payload.to), payload.subject, html)
    if not ok:
        raise HTTPException(status_code=500, detail="Fallo en el envío de correo")
    return {"message": "Correo de prueba enviado", "to": str(payload.to)}