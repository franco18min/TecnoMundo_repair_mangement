# backend/add_markers_drawings_to_photos.py

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def add_markers_drawings_to_photos():
    """Agregar campos para marcadores y dibujos a la tabla repair_order_photo"""
    
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
    
    # SQL para agregar las nuevas columnas
    add_columns_sql = """
    -- Agregar columna para marcadores (JSON array)
    ALTER TABLE customer.repair_order_photo 
    ADD COLUMN IF NOT EXISTS markers JSONB DEFAULT '[]'::jsonb;
    
    -- Agregar columna para dibujos libres (JSON array)
    ALTER TABLE customer.repair_order_photo 
    ADD COLUMN IF NOT EXISTS drawings JSONB DEFAULT '[]'::jsonb;
    
    -- Agregar comentarios para documentación
    COMMENT ON COLUMN customer.repair_order_photo.markers IS 'Array JSON de marcadores con posición (x, y) y color';
    COMMENT ON COLUMN customer.repair_order_photo.drawings IS 'Array JSON de dibujos libres con paths SVG y color';
    """
    
    # Verificar que la tabla existe antes de agregar columnas
    verify_table_sql = """
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'customer' 
        AND table_name = 'repair_order_photo'
    );
    """
    
    try:
        with engine.connect() as connection:
            print("🔍 Verificando que la tabla repair_order_photo existe...")
            
            # Verificar que la tabla existe
            result = connection.execute(text(verify_table_sql))
            table_exists = result.fetchone()[0]
            
            if not table_exists:
                print("❌ Error: La tabla customer.repair_order_photo no existe")
                print("💡 Ejecuta primero create_photo_table.py o create_photo_table_supabase.py")
                return False
            
            print("✅ Tabla customer.repair_order_photo encontrada")
            print("🔧 Agregando columnas para marcadores y dibujos...")
            
            # Ejecutar el SQL para agregar las columnas
            connection.execute(text(add_columns_sql))
            connection.commit()
            
            print("✅ Columnas agregadas exitosamente:")
            print("   - markers: JSONB (array de marcadores)")
            print("   - drawings: JSONB (array de dibujos)")
            
            # Verificar que las columnas se agregaron correctamente
            verify_columns_sql = """
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'customer' 
            AND table_name = 'repair_order_photo'
            AND column_name IN ('markers', 'drawings')
            ORDER BY column_name;
            """
            
            print("\n🔍 Verificando columnas agregadas...")
            result = connection.execute(text(verify_columns_sql))
            columns = result.fetchall()
            
            for column in columns:
                print(f"   ✅ {column[0]}: {column[1]} (default: {column[2]})")
            
            return True
            
    except Exception as e:
        print(f"❌ Error al agregar las columnas: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Agregando campos para marcadores y dibujos a repair_order_photo...")
    success = add_markers_drawings_to_photos()
    
    if success:
        print("🎉 ¡Migración completada exitosamente!")
    else:
        print("💥 Error en la migración")