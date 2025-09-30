#!/usr/bin/env python3
"""
Script para regenerar el hash del usuario admin usando la función de seguridad actual
que maneja correctamente el límite de 72 bytes de bcrypt
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

def fix_admin_bcrypt():
    """Regenerar el hash del usuario admin con la función de seguridad actual"""
    print("=== Regenerando Hash del Usuario Admin (Bcrypt Fix) ===")
    
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
        print(f"   Password hash actual: {admin_user.password[:30]}...")
        
        # Probar la contraseña actual
        print("\n🔍 Probando contraseña actual...")
        try:
            current_password_valid = verify_password("admin123", admin_user.password)
            print(f"   Contraseña 'admin123' válida: {current_password_valid}")
        except Exception as e:
            print(f"   ❌ Error verificando contraseña actual: {e}")
            current_password_valid = False
        
        # Generar nuevo hash usando la función de seguridad actual
        print("\n🔧 Generando nuevo hash con función de seguridad actual...")
        try:
            new_password_hash = get_password_hash("admin123")
            print(f"✅ Nuevo hash generado: {new_password_hash[:30]}...")
            
            # Verificar que el nuevo hash funciona
            verification = verify_password("admin123", new_password_hash)
            print(f"✅ Verificación del nuevo hash: {verification}")
            
            if not verification:
                print("❌ Error: El nuevo hash no verifica correctamente")
                return False
            
        except Exception as e:
            print(f"❌ Error generando nuevo hash: {e}")
            return False
        
        # Actualizar la contraseña en la base de datos
        print("\n💾 Actualizando contraseña en la base de datos...")
        admin_user.password = new_password_hash
        
        # Guardar cambios
        db.commit()
        print("✅ Contraseña actualizada exitosamente")
        
        # Verificar la actualización
        print("\n🔍 Verificación final...")
        try:
            final_verification = verify_password("admin123", admin_user.password)
            print(f"✅ Verificación final: {final_verification}")
            return final_verification
        except Exception as e:
            print(f"❌ Error en verificación final: {e}")
            return False
        
    except Exception as e:
        print(f"❌ Error actualizando contraseña: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    
    finally:
        db.close()

def test_password_functions():
    """Probar las funciones de contraseña directamente"""
    print("=== Test de Funciones de Contraseña ===")
    
    test_password = "admin123"
    print(f"Probando con contraseña: '{test_password}'")
    
    try:
        # Generar hash
        hash_result = get_password_hash(test_password)
        print(f"✅ Hash generado: {hash_result[:30]}...")
        
        # Verificar hash
        verify_result = verify_password(test_password, hash_result)
        print(f"✅ Verificación: {verify_result}")
        
        return verify_result
        
    except Exception as e:
        print(f"❌ Error en test de funciones: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("🔧 Iniciando corrección de bcrypt para usuario admin...")
    print("=" * 60)
    
    # Primero probar las funciones de contraseña
    print("1. Probando funciones de contraseña...")
    if not test_password_functions():
        print("❌ Error en las funciones de contraseña, abortando")
        return
    
    print("\n" + "=" * 60)
    print("2. Corrigiendo usuario admin...")
    
    result = fix_admin_bcrypt()
    
    print("\n" + "=" * 60)
    if result:
        print("✅ Hash del usuario admin regenerado exitosamente")
        print("🎯 Ahora debería funcionar: username=admin, password=admin123")
    else:
        print("❌ Error regenerando el hash del usuario admin")

if __name__ == "__main__":
    main()