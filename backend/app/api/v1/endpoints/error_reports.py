from fastapi import APIRouter, Request
from app.schemas.error_report import ErrorReport
from app.api.v1.dependencies import get_user_from_token, get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from app.core.logger import structured_logger
from app.services.email_transaccional import EmailTransactionalService
from datetime import datetime

router = APIRouter()

@router.post("")
async def submit_error_report(payload: ErrorReport, request: Request, db: Session = Depends(get_db)):
    auth = request.headers.get("Authorization")
    token = None
    if auth and auth.lower().startswith("bearer "):
        token = auth[7:]
    user = get_user_from_token(db=db, token=token) if token else None
    context = {
        "payload": payload.dict(),
        "headers": {"user_agent": request.headers.get("User-Agent")},
    }
    structured_logger.log_event(
        event_type="client_error_report",
        message="Reporte de error del cliente",
        context=context,
        user_id=str(user.id) if user else None,
    )
    try:
        svc = EmailTransactionalService()
        rid = getattr(request.state, "request_id", None)
        subject = f"Reporte de error TecnoApp ({rid or 'sin-id'})"
        user_info = f"Usuario ID: {str(user.id)} | Usuario: {user.username}" if user else "Usuario no autenticado"
        html = f"""
        <div style='font-family:Segoe UI,Roboto,Arial,sans-serif;'>
          <h2 style='margin:0 0 8px 0;'>Reporte de error del cliente</h2>
          <p style='margin:0 0 8px 0;'>Fecha: {datetime.utcnow().isoformat()} UTC</p>
          <p style='margin:0 0 8px 0;'>Request ID: <strong>{rid or 'N/D'}</strong></p>
          <p style='margin:0 0 8px 0;'>Ruta: <code>{payload.route or 'N/D'}</code></p>
          <p style='margin:0 0 8px 0;'>Agente de usuario: <code>{payload.user_agent or request.headers.get('User-Agent')}</code></p>
          <p style='margin:0 0 8px 0;'>{user_info}</p>
          <h3 style='margin:16px 0 8px 0;'>Mensaje del usuario</h3>
          <blockquote style='border-left:4px solid #8b5cf6;padding-left:12px;'>{(payload.user_message or '').strip() or '(sin comentario)'}</blockquote>
          <h3 style='margin:16px 0 8px 0;'>Contexto</h3>
          <pre style='background:#f3f4f6;padding:12px;border-radius:8px;white-space:pre-wrap;'>
{context['payload']}
          </pre>
        </div>
        """
        svc.send_email("magnagg@gmail.com", subject, html)
    except Exception:
        pass
    return {
        "code": "report_received",
        "message": "Reporte recibido",
        "request_id": getattr(request.state, "request_id", None)
    }
