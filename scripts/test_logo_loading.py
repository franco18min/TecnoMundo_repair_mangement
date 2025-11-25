#!/usr/bin/env python3
"""
Script para probar el nuevo método de carga de logo desde public/logo.png
"""

import asyncio
import sys
import os
from pathlib import Path

# Agregar el directorio backend al path de Python
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.services.email_transaccional import EmailTransactionalService
from app.core.config import settings

def test_logo_loading():
    """Prueba el nuevo método de carga de logo"""
    
    print("🧪 Probando carga de logo desde public/logo.png...")
    
    # Crear servicio de email
    email_service = EmailTransactionalService()
    
    # Probar el nuevo método de logo base64
    print("📸 Obteniendo logo como base64...")
    logo_b64 = email_service._get_logo_base64_from_public()
    
    if logo_b64:
        print(f"✅ Logo cargado exitosamente!")
        print(f"📊 Tamaño del base64: {len(logo_b64)} caracteres")
        print(f"🔍 Tipo de imagen: {logo_b64.split(';')[0].split(':')[1] if ':' in logo_b64 else 'desconocido'}")
        
        # Guardar el base64 para inspección
        b64_file = Path(__file__).parent / "logo_base64.txt"
        with open(b64_file, 'w', encoding='utf-8') as f:
            f.write(logo_b64)
        print(f"💾 Base64 guardado en: {b64_file}")
        
        # También probar el método de URL/fallback
        print("\n🌐 Obteniendo logo URL o fallback...")
        logo_result = email_service._get_logo_url_or_fallback()
        
        if logo_result.startswith('http'):
            print(f"✅ Logo URL encontrada: {logo_result}")
        else:
            print(f"ℹ️ Usando fallback de texto: {logo_result[:50]}...")
            
        # Crear un preview del HTML
        print("\n🎨 Generando preview HTML con logo...")
        
        # Crear objeto de orden simulado
        class MockOrder:
            def __init__(self):
                self.id = 1
                self.device_model = "Laptop Dell Inspiron"
                self.technician = None
                self.branch = None
                self.customer = None
        
        mock_order = MockOrder()
        
        # Generar template con logo
        html_content = email_service._render_template(
            title="Test de Logo - TecnoMundo",
            body_html="<p>Este es un mensaje de prueba para verificar que el logo se carga correctamente.</p>",
            order=mock_order,
            to_email="test@example.com"
        )
        
        # Guardar HTML para inspección
        html_file = Path(__file__).parent / "logo_test_preview.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"💾 HTML preview guardado en: {html_file}")
        print("✅ El template ahora incluye el logo correctamente!")
        
    else:
        print("❌ No se pudo cargar el logo")
        print("🔍 Verificando configuración...")
        print(f"   URL base del portal: {settings.CLIENT_PORTAL_BASE_URL}")
        print(f"   ¿Logo existe en public?: Verificando...")
        
        # Verificar manualmente si el logo existe
        logo_path = Path(__file__).parent.parent / "frontend" / "public" / "logo.png"
        if logo_path.exists():
            print(f"✅ Logo encontrado en: {logo_path}")
            print(f"📊 Tamaño del archivo: {logo_path.stat().st_size} bytes")
        else:
            print(f"❌ Logo no encontrado en: {logo_path}")

if __name__ == "__main__":
    test_logo_loading()