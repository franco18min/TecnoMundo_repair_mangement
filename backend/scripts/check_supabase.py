# backend/scripts/check_supabase.py

import os
import sys
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Añadir la ruta raíz del proyecto al sys.path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def check_supabase_connection():
    """Verificar la conexión y estructura de Supabase."""
    
    # Configuración de la base de datos
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "postgres")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
    DB_SSLMODE = os.getenv("DB_SSLMODE", "prefer")
    
    DATABASE_URL = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@"
        f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
        f"?sslmode={DB_SSLMODE}"
    )
    
    print(f"🔗 Conectando a: {DB_HOST}:{DB_PORT}")
    print(f"📊 Base de datos: {DB_NAME}")
    print(f"👤 Usuario: {DB_USER}")
    print(f"🔒 SSL Mode: {DB_SSLMODE}")
    print("-" * 50)
    
    try:
        # Crear engine
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Probar conexión
        with engine.connect() as connection:
            print("✅ Conexión exitosa a Supabase!")
            
            # Verificar schemas
            print("\n📁 Schemas disponibles:")
            result = connection.execute(text("""
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name IN ('customer', 'system', 'public')
                ORDER BY schema_name
            """))
            
            schemas = [row[0] for row in result]
            for schema in schemas:
                print(f"  - {schema}")
            
            # Verificar tablas en schema system
            if 'system' in schemas:
                print("\n🏢 Tablas en schema 'system':")
                result = connection.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'system'
                    ORDER BY table_name
                """))
                
                system_tables = [row[0] for row in result]
                for table in system_tables:
                    print(f"  - system.{table}")
                    
                    # Contar registros
                    try:
                        count_result = connection.execute(text(f"SELECT COUNT(*) FROM system.{table}"))
                        count = count_result.scalar()
                        print(f"    ({count} registros)")
                    except Exception as e:
                        print(f"    (Error al contar: {e})")
            
            # Verificar tablas en schema customer
            if 'customer' in schemas:
                print("\n👥 Tablas en schema 'customer':")
                result = connection.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'customer'
                    ORDER BY table_name
                """))
                
                customer_tables = [row[0] for row in result]
                for table in customer_tables:
                    print(f"  - customer.{table}")
                    
                    # Contar registros
                    try:
                        count_result = connection.execute(text(f"SELECT COUNT(*) FROM customer.{table}"))
                        count = count_result.scalar()
                        print(f"    ({count} registros)")
                    except Exception as e:
                        print(f"    (Error al contar: {e})")
            
            # Verificar si existe el usuario admin
            if 'system' in schemas and 'user' in [t for t in system_tables if 'user' in t]:
                print("\n👤 Verificando usuario admin:")
                try:
                    result = connection.execute(text("""
                        SELECT username, email, is_active 
                        FROM system.user 
                        WHERE username = 'admin'
                    """))
                    
                    admin_user = result.fetchone()
                    if admin_user:
                        print(f"  ✅ Usuario admin encontrado: {admin_user[1]} (activo: {admin_user[2]})")
                    else:
                        print("  ❌ Usuario admin NO encontrado")
                except Exception as e:
                    print(f"  ❌ Error al verificar usuario admin: {e}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔍 Verificando conexión a Supabase...")
    print("=" * 50)
    
    success = check_supabase_connection()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Verificación completada exitosamente")
    else:
        print("❌ Verificación falló")