"""
Servicio de Email Transaccional integrado con EnvialoSimple (DonWeb).

Este módulo provee una interfaz para enviar correos informativos al cliente
cuando ocurren eventos en su orden: diagnóstico actualizado, cambio de estado,
subida de fotos, etc.

Notas:
- Este correo es NO-RESPONDER (responder a no-reply).
- Incluye un enlace de WhatsApp al teléfono de la sucursal (fallback) o del técnico si está disponible.
"""

from typing import Optional
import requests
import logging
from app.core.config import settings
from app.db.session import SessionLocal
from app.crud.crud_repair_order import get_repair_order
import json


class EmailTransactionalService:
    def __init__(self):
        self.provider = settings.EMAIL_PROVIDER
        self.api_base = settings.EMAIL_API_BASE_URL
        self.api_key = settings.EMAIL_API_KEY
        self.from_email = settings.EMAIL_FROM
        self.from_name = settings.EMAIL_FROM_NAME
        self.reply_to = settings.EMAIL_REPLY_TO
        self.client_portal_base = settings.CLIENT_PORTAL_BASE_URL.rstrip('/')

    def _send_envialosimple(self, to_email: str, subject: str, html_content: str) -> bool:
        """Envía un correo usando la API de EnvialoSimple.

        IMPORTANTE: Se requiere configurar EMAIL_API_BASE_URL y EMAIL_API_KEY en .env.
        Como los endpoints específicos pueden variar, este método intenta un POST genérico.
        Ajustar los nombres de campos según la documentación oficial.
        """
        if not self.api_base or not self.api_key:
            logging.warning("[Email] API base URL o API key no configurados. Simulando envío.")
            return False

        try:
            # Según datos provistos: endpoint de envío es /mail/send
            url = f"{self.api_base.rstrip('/')}/mail/send"
            payload = {
                "to": to_email,
                "subject": subject,
                "html": html_content,
                "from": self.from_email,
                "from_name": self.from_name,
                "reply_to": self.reply_to
            }
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            resp = requests.post(url, json=payload, headers=headers, timeout=10)
            if resp.status_code >= 200 and resp.status_code < 300:
                logging.info(f"[Email] Enviado a {to_email}: {subject}")
                return True
            logging.error(f"[Email] Error {resp.status_code}: {resp.text}")
            return False
        except Exception as e:
            logging.exception(f"[Email] Excepción enviando correo: {e}")
            return False

    def send_email(self, to_email: Optional[str], subject: str, html_content: str) -> bool:
        if not to_email:
            logging.warning("[Email] Sin destinatario. Cancelado.")
            return False
        if self.provider == "envialosimple":
            return self._send_envialosimple(to_email, subject, html_content)
        logging.error(f"[Email] Proveedor desconocido: {self.provider}")
        return False

    # -------------- Helpers de contenido --------------
    def _wa_link_for_order(self, order) -> Optional[str]:
        # Preferir teléfono del técnico si existe; de lo contrario usar teléfono de la sucursal
        phone = None
        if order.technician and getattr(order.technician, 'phone_number', None):
            phone = order.technician.phone_number
        elif order.branch and order.branch.phone:
            phone = order.branch.phone
        if not phone:
            return None
        digits = ''.join([c for c in phone if c.isdigit()])
        formatted_phone = f"+549{digits}"
        order_number = str(order.id).zfill(8)
        message = (
            f"Hola, me comunico por la orden N° {order_number}. Me gustaría hacer una consulta adicional "
            f"sobre los detalles de mi orden."
        )
        return f"https://wa.me/{formatted_phone}?text={requests.utils.quote(message)}"

    def _unsubscribe_link(self, order_id: int, to_email: str) -> str:
        # Enlace al frontend para desuscribirse; la página realizará la llamada al endpoint
        base_site = self.client_portal_base.replace('/client/order','')
        return f"{base_site}/client/unsubscribe?order_id={order_id}&email={requests.utils.quote(to_email)}"

    def _email_footer(self, order, to_email: str) -> str:
        wa = self._wa_link_for_order(order)
        wapp = f"<p>Contacto por WhatsApp: <a href='{wa}' target='_blank'>WhatsApp del taller</a></p>" if wa else ''
        unsub = self._unsubscribe_link(order.id, to_email)
        return (
            "<hr>"
            "<p style='color:#6b7280;font-size:12px'>Este es un correo automático. Por favor, no respondas a este mensaje.</p>"
            f"{wapp}"
            f"<p style='font-size:12px;color:#6b7280'>Si no deseas seguir recibiendo correos sobre esta orden, <a href='{unsub}' target='_blank'>haz clic aquí para desuscribirte</a>.</p>"
        )

    def _get_logo_base64(self) -> Optional[str]:
        """Obtiene el logo desde Supabase REST (system.photos, name='logo').
        Retorna base64 o None si no disponible.
        """
        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            return None
        try:
            endpoint = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/system.photo?select=data_base64,name&name=eq.logo"
            headers = {
                "apikey": settings.SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}",
            }
            resp = requests.get(endpoint, headers=headers, timeout=8)
            if resp.status_code >= 200 and resp.status_code < 300:
                rows = resp.json()
                if isinstance(rows, list) and rows:
                    data_b64 = rows[0].get("data_base64")
                    return data_b64 if isinstance(data_b64, str) and data_b64 else None
        except Exception as e:
            logging.warning(f"[Email] No se pudo obtener logo desde Supabase: {e}")
        return None

    def _status_info(self, order) -> tuple[str, str]:
        """Retorna nombre de estado (ES) y una descripción breve en español."""
        sid = getattr(order, 'status_id', None)
        # Fallback al nombre que venga de la BD si no hay mapping
        fallback_name = order.status.status_name if getattr(order, 'status', None) else 'Estado'
        mapping = {
            1: ("Pendiente", "Tu equipo fue recibido y está en la cola para ser tomado por un técnico. Te avisaremos cuando comience el diagnóstico."),
            2: ("En Proceso", "Un técnico está trabajando en tu equipo: diagnóstico, pruebas y la reparación según corresponda."),
            3: ("Completado", "La reparación fue finalizada. Puedes coordinar el retiro o entrega del dispositivo."),
            5: ("Entregado", "El dispositivo ya fue entregado y la orden se considera cerrada."),
            6: ("Esperando repuesto", "Estamos esperando la llegada de un repuesto para continuar con la reparación. Te notificaremos cuando se reciba.")
        }
        if sid in mapping:
            return mapping[sid]
        # Si el ID no está, usar el nombre que nos provee la BD y una descripción genérica
        return (fallback_name, "Tu orden ha cambiado de estado. Ingresa al portal para ver el detalle y los próximos pasos.")

    def _render_template(self, title: str, body_html: str, order, to_email: str) -> str:
        """Aplica un diseño consistente (similar al sitio) con estilos inline seguros para email."""
        # Paleta inspirada en Tailwind (emerald/teal) pero inline para emails
        # Colores del Dashboard (indigo)
        header_bg = "#4f46e5"  # indigo-600
        header_bg2 = "#4338ca"  # indigo-700
        card_bg = "#ffffff"
        border_color = "#e5e7eb"  # gray-200
        text_main = "#111827"  # gray-900
        text_muted = "#6b7280"  # gray-500
        brand = self.from_name or "TecnoMundo"
        order_no = str(order.id).zfill(8)
        portal_link = f"{self.client_portal_base}/{order.id}"
        footer_html = self._email_footer(order, to_email)
        # Saludo con nombre del cliente
        first_name = getattr(getattr(order, 'customer', None), 'first_name', '') or ''
        last_name = getattr(getattr(order, 'customer', None), 'last_name', '') or ''
        full_name = (first_name + ' ' + last_name).strip() or 'Cliente'

        # Intentar logo desde Supabase (base64)
        logo_b64 = self._get_logo_base64()
        logo_circle = (
            f"<img src='data:image/png;base64,{logo_b64}' alt='Logo' style='width:40px;height:40px;border-radius:20px;object-fit:contain;background-color:rgba(255,255,255,0.2);' />"
            if logo_b64 else "<div style='width:40px;height:40px;border-radius:20px;background-color:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;'>📧</div>"
        )

        return f"""
        <div style='background:#f8fafc;padding:24px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;'>
          <div style='max-width:680px;margin:0 auto;'>
            <div style='background:{header_bg};background-image:linear-gradient(90deg,{header_bg},{header_bg2});color:#fff;border-radius:12px 12px 0 0;padding:16px 20px;'>
              <div style='display:flex;align-items:center;justify-content:space-between;'>
                <div style='display:flex;align-items:center;gap:12px;'>
                  {logo_circle}
                  <div>
                    <div style='font-size:18px;font-weight:700'>{brand}</div>
                    <div style='font-size:12px;opacity:0.85'>Orden #{order_no}</div>
                  </div>
                </div>
                <a href='{portal_link}' target='_blank' style='color:#fff;text-decoration:none;font-size:12px;border:1px solid rgba(255,255,255,0.5);padding:6px 10px;border-radius:8px;'>Ver en el portal</a>
              </div>
            </div>
            <div style='background:{card_bg};border:1px solid {border_color};border-top:none;border-radius:0 0 12px 12px;padding:20px;color:{text_main}'>
              <h2 style='margin:0 6px 4px 0;font-size:18px;font-weight:700'>¡Hola, {full_name}!</h2>
              <div style='margin:0 0 10px 0;font-size:15px;font-weight:600;color:{text_main}'>{title}</div>
              <div style='font-size:14px;line-height:1.6;color:{text_main}'>
                {body_html}
              </div>
              <div style='margin-top:16px;font-size:13px;color:{text_muted}'>
                {footer_html}
              </div>
            </div>
          </div>
        </div>
        """

    # -------------- Notificaciones por evento --------------
    def notify_diagnosis_update(self, order_id: int):
        with SessionLocal() as db:
            order = get_repair_order(db, order_id)
            if not order:
                return
            from app.crud import crud_email_subscription
            recipients = crud_email_subscription.get_active_emails_by_order(db, order_id)
            if not recipients:
                return
            subject = f"Diagnóstico actualizado para tu orden #{order.id}"
            diag = order.technician_diagnosis or "(sin detalles)"
            tech_name = order.technician.username if order.technician else "técnico"
            for to_email in recipients:
                body = (
                    f"<p>El técnico <strong>{tech_name}</strong> ha actualizado el diagnóstico de tu dispositivo <strong>{order.device_model}</strong>.</p>"
                    f"<blockquote style='border-left:4px solid #10b981;padding-left:12px;color:#111827'>{diag}</blockquote>"
                    f"<p>En el portal podrás ver el detalle completo y los próximos pasos.</p>"
                )
                html = self._render_template("Diagnóstico del técnico", body, order, to_email)
                self.send_email(to_email, subject, html)

    def notify_status_change(self, order_id: int, prev_status_id: Optional[int], new_status_id: int):
        with SessionLocal() as db:
            order = get_repair_order(db, order_id)
            if not order:
                return
            if prev_status_id == new_status_id:
                return
            from app.crud import crud_email_subscription
            recipients = crud_email_subscription.get_active_emails_by_order(db, order_id)
            if not recipients:
                return
            status_name, status_desc = self._status_info(order)
            subject = f"Tu orden #{order.id} cambió de estado: {status_name}"
            for to_email in recipients:
                body = (
                    f"<p>La orden <strong>#{order.id}</strong> del dispositivo <strong>{order.device_model}</strong> se encuentra ahora en estado: <strong>{status_name}</strong>.</p>"
                    f"<p style='color:#374151'>{status_desc}</p>"
                    f"<p>Si tienes dudas o deseas más información, ingresa al portal para ver el seguimiento completo.</p>"
                )
                html = self._render_template("Actualización de estado", body, order, to_email)
                self.send_email(to_email, subject, html)

    def notify_photo_uploaded(self, order_id: int):
        with SessionLocal() as db:
            order = get_repair_order(db, order_id)
            if not order:
                return
            from app.crud import crud_email_subscription
            recipients = crud_email_subscription.get_active_emails_by_order(db, order_id)
            if not recipients:
                return
            subject = f"Nuevas fotos añadidas a tu orden #{order.id}"
            for to_email in recipients:
                body = (
                    f"<p>Se han añadido nuevas fotos del proceso de reparación de tu dispositivo <strong>{order.device_model}</strong>.</p>"
                    f"<p>Ingresa al portal para verlas y seguir el detalle del trabajo realizado.</p>"
                )
                html = self._render_template("Actualización visual", body, order, to_email)
                self.send_email(to_email, subject, html)