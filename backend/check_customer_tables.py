# backend/check_customer_tables.py

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def check_customer_tables():
    """Verificar qué tablas existen en el schema customer"""
    
    # Construir URL de base de datos desde variables de entorno
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
    
    engine = create_engine(DATABASE_URL)
    
    # Consulta para ver todas las tablas en el schema customer
    tables_query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'customer'
    ORDER BY table_name;
    """
    
    # Consulta para ver las columnas de cada tabla
    columns_query = """
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'customer'
    ORDER BY table_name, ordinal_position;
    """
    
    try:
        with engine.connect() as connection:
            print("🔍 Consultando tablas en el schema 'customer'...")
            print("=" * 60)
            
            # Obtener lista de tablas
            result = connection.execute(text(tables_query))
            tables = result.fetchall()
            
            if not tables:
                print("❌ No se encontraron tablas en el schema 'customer'")
                return
            
            print(f"📋 Tablas encontradas ({len(tables)}):")
            for table in tables:
                print(f"  - {table[0]}")
            
            print("\n" + "=" * 60)
            print("📊 Estructura detallada de las tablas:")
            print("=" * 60)
            
            # Obtener estructura de columnas
            result = connection.execute(text(columns_query))
            columns = result.fetchall()
            
            current_table = None
            for column in columns:
                table_name, column_name, data_type, is_nullable, column_default = column
                
                if current_table != table_name:
                    if current_table is not None:
                        print()
                    print(f"\n🗂️  Tabla: {table_name}")
                    print("-" * 40)
                    current_table = table_name
                
                nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
                default = f" DEFAULT {column_default}" if column_default else ""
                print(f"  {column_name:<25} {data_type:<15} {nullable}{default}")
            
            # Buscar específicamente tablas relacionadas con fotos
            print("\n" + "=" * 60)
            print("🔍 Buscando tablas relacionadas con fotos...")
            print("=" * 60)
            
            photo_tables = [table[0] for table in tables if 'photo' in table[0].lower()]
            if photo_tables:
                print("📸 Tablas de fotos encontradas:")
                for table in photo_tables:
                    print(f"  ✅ {table}")
            else:
                print("❌ No se encontraron tablas relacionadas con fotos")
                print("💡 Posibles nombres a buscar: repair_order_photo, photos, images, attachments")
            
    except Exception as e:
        print(f"❌ Error al consultar la base de datos: {e}")

if __name__ == "__main__":
    check_customer_tables()