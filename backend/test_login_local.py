#!/usr/bin/env python3
"""
Script para probar el login localmente y diagnosticar el problema
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
from app.crud import crud_user
from app.core.security import verify_password, create_access_token
from datetime import timedelta

def test_login_process():
    """Simular el proceso completo de login"""
    print("=== Test de Proceso de Login ===")
    
    # Crear sesión de base de datos
    db: Session = SessionLocal()
    
    try:
        # 1. Buscar usuario admin
        print("1. Buscando usuario admin...")
        user = crud_user.get_by_username(db, username="admin")
        
        if not user:
            print("❌ Usuario admin NO encontrado")
            return False
        
        print(f"✅ Usuario admin encontrado:")
        print(f"   ID: {user.id}")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Is Active: {user.is_active}")
        print(f"   Role ID: {user.role_id}")
        print(f"   Branch ID: {user.branch_id}")
        print(f"   Password hash: {user.password[:20]}...")
        
        # 2. Verificar contraseña
        print("\n2. Verificando contraseña...")
        password_valid = verify_password("admin123", user.password)
        print(f"✅ Verificación de contraseña: {password_valid}")
        
        if not password_valid:
            print("❌ Contraseña incorrecta")
            return False
        
        # 3. Verificar si el usuario está activo
        print("\n3. Verificando estado del usuario...")
        if not user.is_active:
            print("❌ Usuario inactivo")
            return False
        
        print("✅ Usuario activo")
        
        # 4. Crear token de acceso
        print("\n4. Creando token de acceso...")
        try:
            access_token_expires = timedelta(minutes=30)  # ACCESS_TOKEN_EXPIRE_MINUTES
            access_token = create_access_token(
                data={"sub": user.username}, 
                expires_delta=access_token_expires
            )
            print(f"✅ Token creado exitosamente: {access_token[:20]}...")
            
            return {
                "access_token": access_token,
                "token_type": "bearer"
            }
            
        except Exception as e:
            print(f"❌ Error creando token: {e}")
            import traceback
            traceback.print_exc()
            return False
        
    except Exception as e:
        print(f"❌ Error en el proceso de login: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        db.close()

def test_password_verification():
    """Probar diferentes aspectos de la verificación de contraseñas"""
    print("\n=== Test de Verificación de Contraseñas ===")
    
    from app.core.security import get_password_hash, verify_password
    
    # Probar con la contraseña admin123
    test_password = "admin123"
    
    print(f"1. Probando con contraseña: '{test_password}'")
    
    # Generar nuevo hash
    new_hash = get_password_hash(test_password)
    print(f"✅ Nuevo hash generado: {new_hash[:20]}...")
    
    # Verificar con el nuevo hash
    verification = verify_password(test_password, new_hash)
    print(f"✅ Verificación con nuevo hash: {verification}")
    
    # Probar con diferentes longitudes
    long_password = "admin123" * 10  # Contraseña muy larga
    print(f"\n2. Probando con contraseña larga ({len(long_password)} caracteres)...")
    
    try:
        long_hash = get_password_hash(long_password)
        print(f"✅ Hash de contraseña larga generado: {long_hash[:20]}...")
        
        long_verification = verify_password(long_password, long_hash)
        print(f"✅ Verificación de contraseña larga: {long_verification}")
        
    except Exception as e:
        print(f"❌ Error con contraseña larga: {e}")

def main():
    print("🔍 Iniciando diagnóstico de login...")
    print("=" * 50)
    
    # Test 1: Verificación de contraseñas
    test_password_verification()
    
    # Test 2: Proceso completo de login
    result = test_login_process()
    
    print("\n" + "=" * 50)
    if result:
        print("✅ Proceso de login completado exitosamente")
        print(f"Token generado: {result}")
    else:
        print("❌ Proceso de login falló")

if __name__ == "__main__":
    main()