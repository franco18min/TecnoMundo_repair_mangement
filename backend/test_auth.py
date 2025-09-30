# test_auth.py - Script para probar autenticación

import sys
import os

# Agregar el directorio actual al path y remover conflictos
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Remover cualquier 'app' del path que pueda causar conflictos
sys.path = [p for p in sys.path if not p.endswith('site-packages')]
sys.path.insert(0, current_dir)

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash

def test_admin_auth():
    """Prueba la autenticación del usuario admin"""
    db = SessionLocal()
    
    try:
        # Buscar usuario admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        if not admin_user:
            print("❌ Usuario admin no encontrado")
            return
            
        print(f"✅ Usuario admin encontrado:")
        print(f"   - ID: {admin_user.id}")
        print(f"   - Username: {admin_user.username}")
        print(f"   - Email: {admin_user.email}")
        print(f"   - Role ID: {admin_user.role_id}")
        print(f"   - Branch ID: {admin_user.branch_id}")
        print(f"   - Is Active: {admin_user.is_active}")
        print(f"   - Password Hash: {admin_user.password[:50]}...")
        
        # Probar verificación de contraseña
        test_password = "admin123"
        is_valid = verify_password(test_password, admin_user.password)
        
        print(f"\n🔐 Prueba de contraseña '{test_password}': {'✅ VÁLIDA' if is_valid else '❌ INVÁLIDA'}")
        
        # Generar nuevo hash para comparar
        new_hash = get_password_hash(test_password)
        print(f"\n🔄 Nuevo hash generado: {new_hash[:50]}...")
        
        # Verificar el nuevo hash
        is_new_valid = verify_password(test_password, new_hash)
        print(f"🔐 Verificación del nuevo hash: {'✅ VÁLIDA' if is_new_valid else '❌ INVÁLIDA'}")
        
    except Exception as e:
        print(f"❌ Error durante la prueba: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_admin_auth()