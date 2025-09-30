#!/usr/bin/env python3
"""
Script para actualizar el hash del usuario admin usando el nuevo sistema hashlib.
Evita problemas de bcrypt con límites de 72 bytes.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.security import get_password_hash
from app.core.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session

def update_admin_hash():
    """Actualiza el hash del usuario admin con el nuevo sistema."""
    
    # Obtener sesión de base de datos
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        # Buscar usuario admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        if not admin_user:
            print("❌ Usuario admin no encontrado")
            return False
        
        print(f"✅ Usuario admin encontrado:")
        print(f"   ID: {admin_user.id}")
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   Hash actual: {admin_user.password[:50]}...")
        
        # Generar nuevo hash con el sistema hashlib
        new_password = "admin123"
        new_hash = get_password_hash(new_password)
        
        print(f"\n🔧 Generando nuevo hash con sistema hashlib...")
        print(f"   Nuevo hash: {new_hash[:50]}...")
        
        # Actualizar en la base de datos
        admin_user.password = new_hash
        db.commit()
        
        print(f"\n✅ Hash actualizado exitosamente")
        print(f"   Usuario: {admin_user.username}")
        print(f"   Nuevo hash: {new_hash[:50]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al actualizar hash: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Actualizando hash del usuario admin con sistema hashlib...")
    success = update_admin_hash()
    
    if success:
        print("\n✅ Proceso completado exitosamente")
        print("   El usuario admin ahora usa el nuevo sistema de hashing")
    else:
        print("\n❌ Error en el proceso")
        sys.exit(1)