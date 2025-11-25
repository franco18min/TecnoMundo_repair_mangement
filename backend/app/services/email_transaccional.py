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
from pathlib import Path


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
        wapp = f"<p style='margin:0'>Contacto por WhatsApp: <a href='{wa}' target='_blank'>WhatsApp del taller</a></p>" if wa else ''
        unsub = self._unsubscribe_link(order.id, to_email)
        return (
            f"{wapp}"
            f"<p style='font-size:12px;color:#6b7280;margin:0'>Si no deseas seguir recibiendo correos sobre esta orden, <a href='{unsub}' target='_blank'>haz clic aquí para desuscribirte</a>.</p>"
        )

    def _get_logo_base64_from_public(self) -> Optional[str]:
        """Obtiene el logo desde public/logo.png y lo convierte a base64.
        Primero intenta leer localmente, luego desde URL.
        """
        try:
            candidates = ['logo.png', 'logo.svg', 'logo.jpg', 'logo.jpeg']
            
            logging.info(f"[Email] Buscando logo en candidatos: {candidates}")
            
            # Primero: intentar leer localmente desde frontend/public
            for candidate in candidates:
                # La ruta correcta: desde backend/app/services/ -> ../../frontend/public/
                local_path = Path(__file__).parent.parent.parent.parent / "frontend" / "public" / candidate
                logging.info(f"[Email] Verificando logo local: {local_path}")
                
                if local_path.exists():
                    logging.info(f"[Email] Logo encontrado localmente: {local_path}")
                    try:
                        import base64
                        with open(local_path, 'rb') as f:
                            image_data = f.read()
                            image_base64 = base64.b64encode(image_data).decode('utf-8')
                            
                            # Detectar tipo MIME
                            if candidate.endswith('.svg'):
                                mime_type = 'image/svg+xml'
                            elif candidate.endswith('.jpg') or candidate.endswith('.jpeg'):
                                mime_type = 'image/jpeg'
                            else:
                                mime_type = 'image/png'
                            
                            logging.info(f"[Email] Logo cargado localmente: {candidate}")
                            return f"data:{mime_type};base64,{image_base64}"
                    except Exception as e:
                        logging.warning(f"[Email] Error leyendo logo local {candidate}: {e}")
                        continue
                else:
                    logging.info(f"[Email] Logo no encontrado en: {local_path}")
            
            logging.info("[Email] No se encontraron logos locales, intentando desde URL...")
            
            # Segundo: intentar desde URL (como fallback)
            base_url = settings.CLIENT_PORTAL_BASE_URL.rstrip('/')
            
            for candidate in candidates:
                logo_url = f"{base_url}/{candidate}"
                try:
                    # Descargar el logo
                    resp = requests.get(logo_url, timeout=10)
                    if resp.status_code == 200:
                        import base64
                        image_base64 = base64.b64encode(resp.content).decode('utf-8')
                        
                        # Detectar tipo MIME
                        if candidate.endswith('.svg'):
                            mime_type = 'image/svg+xml'
                        elif candidate.endswith('.jpg') or candidate.endswith('.jpeg'):
                            mime_type = 'image/jpeg'
                        else:
                            mime_type = 'image/png'
                        
                        logging.info(f"[Email] Logo descargado desde URL: {candidate}")
                        return f"data:{mime_type};base64,{image_base64}"
                except Exception as e:
                    logging.warning(f"[Email] Error descargando logo desde URL {logo_url}: {e}")
                    continue
                    
        except Exception as e:
            logging.warning(f"[Email] Error al obtener logo base64: {e}")
        
        logging.warning("[Email] No se pudo obtener ningún logo")
        return None

    def _get_logo_url_or_fallback(self) -> str:
        try:
            base_site = self.client_portal_base.replace('/client/order', '')
            candidates = [
                'email-logo-trimmed.png',
                'logo.png',
                'logo.svg',
                'logo.jpg',
                'logo.jpeg',
            ]
            for candidate in candidates:
                logo_url = f"{base_site}/{candidate}"
                try:
                    resp = requests.head(logo_url, timeout=5)
                    if resp.status_code == 200:
                        return logo_url
                except:
                    continue
        except Exception as e:
            logging.warning(f"[Email] Error al obtener logo: {e}")
        return f"<span style='font-size: 28px; font-weight: bold; color: #111111; font-family: Arial, sans-serif;'>{self.from_name or 'TecnoMundo'}</span>"

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
        """Aplica un diseño consistente inspirado en el template proporcionado, adaptado a TecnoMundo."""
        # Color scheme de TecnoMundo (indigo)
        primary_color = "#4f46e5"  # indigo-600
        primary_dark = "#4338ca"  # indigo-700
        background_color = "#f6f6f6"
        card_background = "#ffffff"
        border_color = "#e0e0e0"
        text_main = "#333333"
        text_header = "#111111"
        text_muted = "#888888"
        link_color = "#4f46e5"
        
        brand = self.from_name or "TecnoMundo"
        order_no = str(order.id).zfill(8)
        portal_link = f"{self.client_portal_base}/{order.id}"
        
        # Saludo con nombre del cliente
        first_name = getattr(getattr(order, 'customer', None), 'first_name', '') or ''
        last_name = getattr(getattr(order, 'customer', None), 'last_name', '') or ''
        full_name = (first_name + ' ' + last_name).strip() or 'Cliente'
        device_model = getattr(order, 'device_model', 'Dispositivo')
        
        logo_url_or_html = self._get_logo_url_or_fallback()
        if logo_url_or_html.startswith('http'):
            logo_html = f"<img src='{logo_url_or_html}' alt='Logo' style='height: 168px; max-height: 168px; width: auto; display:block; margin: 0 auto;' />"
        else:
            logo_b64 = self._get_logo_base64_from_public()
            if logo_b64:
                logo_html = f"<img src='{logo_b64}' alt='Logo' style='height: 168px; max-height: 168px; width: auto; display:block; margin: 0 auto;' />"
            else:
                logo_html = f"<span style='font-size: 28px; font-weight: bold; color: {text_header}; font-family: Arial, sans-serif;'>{brand}</span>"
        
        # Footer con WhatsApp y desuscripción
        footer_html = self._email_footer(order, to_email)

        return f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    background-color: {background_color};
                }}
                a {{
                    color: {link_color};
                    text-decoration: none;
                }}
                a:hover {{
                    text-decoration: underline;
                }}
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: {background_color};">
        
            <!-- Contenedor principal del correo -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: {card_background}; border: 1px solid {border_color}; border-radius: 8px; overflow: hidden;">
                
                <!-- 1. Cabecera (Logo/Nombre de la Empresa) -->
                <tr>
                    <td style="padding: 12px 30px 10px 30px; text-align: center; border-bottom: 2px solid {primary_color}; line-height:0;">
                        {logo_html}
                    </td>
                </tr>
        
                <!-- 2. Cuerpo del Mensaje -->
                <tr>
                    <td style="padding: 20px 40px 40px 40px; font-family: Arial, sans-serif; color: {text_main}; font-size: 16px; line-height: 1.6;">
                        
                        <h1 style="font-size: 24px; color: {text_header}; margin: 0 0 25px 0; font-weight: 600;">
                            {title}
                        </h1>
                        
                        <p style="margin: 0 0 20px 0;">
                            Hola <strong>{full_name}</strong>,
                        </p>
                        
                        {body_html}
        
                        <!-- Botón de Acción (CTA) -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
                            <tr>
                                <td align="center">
                                    <a href="{portal_link}" style="background-color: {primary_color}; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                                        Ver Detalles de la Orden
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
        
                <!-- 3. Pie de Página (Footer) -->
                <tr>
                    <td style="padding: 12px 20px; background-color: {card_background}; font-family: Arial, sans-serif; color: {text_muted}; font-size: 12px; text-align: center; line-height: 1.4;">
                        <div style="margin:0">{footer_html}</div>
                    </td>
                </tr>
            </table>
        
        </body>
        </html>
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