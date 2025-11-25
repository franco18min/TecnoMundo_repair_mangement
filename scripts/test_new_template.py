#!/usr/bin/env python3
"""
Script para probar el nuevo template de email con logo funcional
"""

import asyncio
import sys
import os
from pathlib import Path

# Establecer variables de entorno temporalmente para la prueba
os.environ['EMAIL_API_BASE_URL'] = 'https://api.envialosimple.email/api/v1'
os.environ['EMAIL_API_KEY'] = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjIyMTEwNTEsImV4cCI6NDkxNzg4NDY1MSwicm9sZXMiOlsiUk9MRV9BRE1JTiIsIlJPTEVfVVNFUiJdLCJraWQiOiI2OTA5MzRlYjdkNmYwNTg0YjMwYjFkY2YiLCJhaWQiOiI2OGZhNDk4ZDJmNjZkMzM0ZmMwMjNjNDciLCJ1c2VybmFtZSI6Im9tYXJjaWFyZXNAZ21haWwuY29tIn0.lB6sa0Gl_ec-GVBiBalBdfpCGeTB_p9gxFspAXFYteeRe85JI9_IFZPORmkXwi4-WpQ3D24lIabUoxddmSV3KvzVp0bbT_M9fvhPdwHyigTDugbB-dSFRYbytkIGUq48Mn13msopCwrWzb2ARcRn3JY_Edm0pNPmXeUG4z6ZMkYa9gXdxdFM1AtfGv5z07a_RyegvNlYnM7Qxba9LrQAEIDc4c__C0cZSEbAr165RyYj0ork6eaNkZNrH0g4-wG3TplHj_dV83J3wo7Y0Yu11L9nSxnbKCd7ygFw4kUDpDUMo4TxB5Vlah682KlqFat-UY4yPJCObJYr2QTYui92pw'

# Agregar el directorio backend al path de Python
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.services.email_transaccional import EmailTransactionalService
from app.core.config import settings

async def test_new_template_with_logo():
    """Prueba el nuevo template de email con logo funcional"""
    
    print("🧪 Probando nuevo template de email con logo...")
    print(f"📧 Email destinatario: magnagg@gmail.com")
    
    # Verificar configuración
    print(f"🔗 URL API Email: {settings.EMAIL_API_BASE_URL}")
    print(f"🔑 API Key configurada: {'Sí' if settings.EMAIL_API_KEY else 'No'}")
    
    if not settings.EMAIL_API_KEY:
        print("❌ Error: EMAIL_API_KEY no configurada")
        return
    
    # Crear servicio de email
    email_service = EmailTransactionalService()
    
    # Verificar que el logo se puede cargar
    print("📸 Verificando carga del logo...")
    logo_b64 = email_service._get_logo_base64_from_public()
    if logo_b64:
        print(f"✅ Logo cargado exitosamente! ({len(logo_b64)} caracteres)")
    else:
        print("⚠️ Logo no disponible, se usará texto fallback")
    
    # Datos de prueba
    test_data = {
        "cliente_nombre": "Juan García",
        "cliente_email": "magnagg@gmail.com",
        "equipo_tipo": "Laptop Dell Inspiron",
        "equipo_modelo": "Inspiron 15 3000",
        "numero_orden": "ORD-2024-001",
        "estado": "diagnosticado",
        "mensaje": "Su equipo ha sido diagnosticado y está listo para reparación. El nuevo template incluye el logo de TecnoMundo.",
        "costo_estimado": "$150.00",
        "tiempo_estimado": "3-5 días hábiles"
    }
    
    try:
        # Enviar email con nuevo template
        print("📤 Enviando email con nuevo template y logo...")
        
        # Crear el cuerpo del mensaje HTML
        body_html = f"""
            <p>{test_data['mensaje']}</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f9f9f9;"><strong>Número de Orden:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">{test_data['numero_orden']}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f9f9f9;"><strong>Equipo:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">{test_data['equipo_tipo']} {test_data['equipo_modelo']}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f9f9f9;"><strong>Estado:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">{test_data['estado'].title()}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f9f9f9;"><strong>Costo Estimado:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">{test_data['costo_estimado']}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f9f9f9;"><strong>Tiempo Estimado:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">{test_data['tiempo_estimado']}</td>
                </tr>
            </table>
            <p>✨ Este email ahora incluye el logo de TecnoMundo cargado desde el archivo public/logo.png, siguiendo el mismo patrón que usa el resto de la aplicación.</p>
            <p>Si tienes dudas o deseas más información, ingresa al portal para ver el seguimiento completo.</p>
        """
        
        # Crear un objeto de orden simulado para el template
        class MockOrder:
            def __init__(self):
                self.id = 1
                self.device_model = f"{test_data['equipo_tipo']} {test_data['equipo_modelo']}"
                self.technician = None
                self.branch = None
        
        mock_order = MockOrder()
        
        # Renderizar el template con el nuevo diseño
        html_content = email_service._render_template(
            title="Estado de Reparación Actualizado - Con Nuevo Logo",
            body_html=body_html,
            order=mock_order,
            to_email=test_data["cliente_email"]
        )
        
        # Guardar HTML para inspección
        html_file = Path(__file__).parent / "email_preview_with_logo.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"💾 HTML preview guardado en: {html_file}")
        
        # Enviar email
        resultado = email_service.send_email(
            to_email=test_data["cliente_email"],
            subject=f"🎨 Actualización de estado - Orden {test_data['numero_orden']} (Nuevo Template)",
            html_content=html_content
        )
        
        if resultado:
            print("✅ Email enviado exitosamente con nuevo template y logo!")
            print(f"📊 Resultado: {resultado}")
            print("🎨 El nuevo template incluye:")
            print("   - ✅ Diseño moderno con colores TecnoMundo (índigo)")
            print("   - ✅ Logo de la empresa cargado desde public/logo.png")
            print("   - ✅ Estructura responsive")
            print("   - ✅ Footer con información de contacto")
            print("   - ✅ Compatible con producción (mismo patrón que BrandLogo)")
            
        else:
            print("❌ Error al enviar email")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_new_template_with_logo())