#!/usr/bin/env python3
"""
Script para actualizar la contraseña del usuario admin
"""

import os
import sys
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Añadir la ruta raíz del proyecto al sys.path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, verify_password

def fix_admin_password():
    """Actualizar la contraseña del usuario admin"""
    print("=== Actualizando Contraseña del Usuario Admin ===")
    
    # Crear sesión de base de datos
    db: Session = SessionLocal()
    
    try:
        # Buscar usuario admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        if not admin_user:
            print("❌ Usuario admin NO encontrado")
            return False
        
        print(f"✅ Usuario admin encontrado:")
        print(f"   ID: {admin_user.id}")
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   Password hash actual: {admin_user.password[:20]}...")
        
        # Verificar contraseña actual
        current_password_valid = verify_password("admin123", admin_user.password)
        print(f"   Contraseña 'admin123' válida: {current_password_valid}")
        
        if current_password_valid:
            print("✅ La contraseña ya es correcta, no se necesita actualización")
            return True
        
        # Generar nuevo hash para admin123
        print("\n🔧 Generando nuevo hash para 'admin123'...")
        new_password_hash = get_password_hash("admin123")
        print(f"✅ Nuevo hash generado: {new_password_hash[:20]}...")
        
        # Verificar que el nuevo hash funciona
        verification = verify_password("admin123", new_password_hash)
        print(f"✅ Verificación del nuevo hash: {verification}")
        
        if not verification:
            print("❌ Error: El nuevo hash no verifica correctamente")
            return False
        
        # Actualizar la contraseña en la base de datos
        print("\n💾 Actualizando contraseña en la base de datos...")
        admin_user.password = new_password_hash
        
        # También actualizar el email si es necesario
        if admin_user.email != "admin@tecnomundo.com":
            print(f"📧 Actualizando email de '{admin_user.email}' a 'admin@tecnomundo.com'")
            admin_user.email = "admin@tecnomundo.com"
        
        # Asegurar que el usuario esté activo
        if not admin_user.is_active:
            print("🔓 Activando usuario admin")
            admin_user.is_active = True
        
        # Guardar cambios
        db.commit()
        print("✅ Contraseña actualizada exitosamente")
        
        # Verificar la actualización
        print("\n🔍 Verificando la actualización...")
        final_verification = verify_password("admin123", admin_user.password)
        print(f"✅ Verificación final: {final_verification}")
        
        return final_verification
        
    except Exception as e:
        print(f"❌ Error actualizando contraseña: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    
    finally:
        db.close()

def main():
    print("🔧 Iniciando corrección de contraseña admin...")
    print("=" * 50)
    
    result = fix_admin_password()
    
    print("\n" + "=" * 50)
    if result:
        print("✅ Contraseña del usuario admin corregida exitosamente")
        print("🎯 Ahora puedes usar: username=admin, password=admin123")
    else:
        print("❌ Error corrigiendo la contraseña del usuario admin")

if __name__ == "__main__":
    main()