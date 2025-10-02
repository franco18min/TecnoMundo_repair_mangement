# backend/verify_photo_table_supabase.py

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def verify_photo_table_supabase():
    """Verificar que la tabla repair_order_photo existe en Supabase"""
    
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
    
    print(f"🔗 Conectando a: {DB_HOST}:{DB_PORT}/{DB_NAME}")
    engine = create_engine(DATABASE_URL)
    
    # Consulta para verificar la estructura de la tabla
    verify_table_sql = """
    SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
    FROM information_schema.columns 
    WHERE table_schema = 'customer' 
    AND table_name = 'repair_order_photo'
    ORDER BY ordinal_position;
    """
    
    # Consulta para verificar índices
    verify_indexes_sql = """
    SELECT 
        indexname,
        indexdef
    FROM pg_indexes 
    WHERE schemaname = 'customer' 
    AND tablename = 'repair_order_photo';
    """
    
    try:
        with engine.connect() as connection:
            print("🔍 Verificando estructura de la tabla repair_order_photo...")
            
            # Verificar columnas
            result = connection.execute(text(verify_table_sql))
            columns = result.fetchall()
            
            if not columns:
                print("❌ Error: La tabla customer.repair_order_photo no existe")
                return False
            
            print("✅ Tabla customer.repair_order_photo encontrada")
            print("📋 Estructura de columnas:")
            print("-" * 80)
            print(f"{'Columna':<20} {'Tipo':<25} {'Nullable':<10} {'Default'}")
            print("-" * 80)
            
            for column in columns:
                column_name, data_type, is_nullable, column_default = column
                default_str = str(column_default) if column_default else "NULL"
                if len(default_str) > 30:
                    default_str = default_str[:27] + "..."
                print(f"{column_name:<20} {data_type:<25} {is_nullable:<10} {default_str}")
            
            # Verificar índices
            print("\n📊 Índices:")
            print("-" * 80)
            result = connection.execute(text(verify_indexes_sql))
            indexes = result.fetchall()
            
            if indexes:
                for index in indexes:
                    index_name, index_def = index
                    print(f"  • {index_name}")
                    print(f"    {index_def}")
            else:
                print("  • No se encontraron índices")
            
            # Verificar que se puede hacer una consulta básica
            print("\n🧪 Probando consulta básica...")
            test_query = "SELECT COUNT(*) FROM customer.repair_order_photo;"
            result = connection.execute(text(test_query))
            count = result.fetchone()[0]
            print(f"✅ Consulta exitosa: {count} registros en la tabla")
            
            return True
            
    except Exception as e:
        print(f"❌ Error al verificar la tabla: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Verificando tabla repair_order_photo en Supabase...")
    print("=" * 80)
    
    success = verify_photo_table_supabase()
    
    print("=" * 80)
    if success:
        print("🎉 ¡Verificación exitosa! La tabla está lista para usar")
    else:
        print("💥 Error en la verificación")