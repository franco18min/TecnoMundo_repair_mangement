#!/usr/bin/env python3
"""
Script para probar la conexión directa a Supabase y verificar el usuario admin
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import psycopg2
from passlib.context import CryptContext

# Configuración de bcrypt
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
    bcrypt__ident="2b"
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    try:
        # Truncar la contraseña a 72 bytes si es necesario
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        if len(plain_password) > 72:
            plain_password = plain_password[:72]
        if isinstance(plain_password, bytes):
            plain_password = plain_password.decode('utf-8')
        
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Error verificando contraseña: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Generar hash de contraseña"""
    try:
        # Truncar la contraseña a 72 bytes si es necesario
        if isinstance(password, str):
            password = password.encode('utf-8')
        if len(password) > 72:
            password = password[:72]
        if isinstance(password, bytes):
            password = password.decode('utf-8')
        
        return pwd_context.hash(password)
    except Exception as e:
        print(f"Error generando hash: {e}")
        return None

def main():
    print("=== Test de Conexión Directa a Supabase ===")
    
    # URL de conexión a Supabase
    DATABASE_URL = "postgresql://postgres.kcqjqjqjqjqjqjqjqjqj:TecnoMundo2024!@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
    
    try:
        # Crear conexión directa con psycopg2
        print("1. Probando conexión directa con psycopg2...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Verificar conexión
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Conexión exitosa. PostgreSQL version: {version[0][:50]}...")
        
        # Verificar esquemas
        cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('system', 'customer');")
        schemas = cursor.fetchall()
        print(f"✅ Esquemas encontrados: {[s[0] for s in schemas]}")
        
        # Verificar tabla de usuarios
        cursor.execute("SELECT COUNT(*) FROM system.user;")
        user_count = cursor.fetchone()[0]
        print(f"✅ Total de usuarios en system.user: {user_count}")
        
        # Buscar usuario admin
        cursor.execute("SELECT id, username, email, password, is_active, role_id, branch_id FROM system.user WHERE username = 'admin';")
        admin_user = cursor.fetchone()
        
        if admin_user:
            print(f"✅ Usuario admin encontrado:")
            print(f"   ID: {admin_user[0]}")
            print(f"   Username: {admin_user[1]}")
            print(f"   Email: {admin_user[2]}")
            print(f"   Password hash: {admin_user[3][:20]}...")
            print(f"   Is Active: {admin_user[4]}")
            print(f"   Role ID: {admin_user[5]}")
            print(f"   Branch ID: {admin_user[6]}")
            
            # Probar verificación de contraseña
            print("\n2. Probando verificación de contraseña...")
            password_test = verify_password("admin123", admin_user[3])
            print(f"✅ Verificación de contraseña 'admin123': {password_test}")
            
            # Generar nuevo hash para comparar
            print("\n3. Generando nuevo hash para comparar...")
            new_hash = get_password_hash("admin123")
            if new_hash:
                print(f"✅ Nuevo hash generado: {new_hash[:20]}...")
                new_verification = verify_password("admin123", new_hash)
                print(f"✅ Verificación con nuevo hash: {new_verification}")
            
        else:
            print("❌ Usuario admin NO encontrado")
            
            # Listar todos los usuarios
            cursor.execute("SELECT username, email, is_active FROM system.user;")
            all_users = cursor.fetchall()
            print(f"Usuarios existentes: {all_users}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()