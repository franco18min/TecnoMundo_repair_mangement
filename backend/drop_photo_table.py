# backend/drop_photo_table.py

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def drop_photo_table():
    """Eliminar la tabla repair_order_photo del schema customer"""
    
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
    
    drop_table_sql = """
    -- Eliminar índice primero
    DROP INDEX IF EXISTS customer.idx_repair_order_photo_order_id;
    
    -- Eliminar la tabla
    DROP TABLE IF EXISTS customer.repair_order_photo;
    """
    
    try:
        with engine.connect() as connection:
            # Ejecutar el SQL para eliminar la tabla
            connection.execute(text(drop_table_sql))
            connection.commit()
            print("✅ Tabla repair_order_photo eliminada exitosamente")
            
    except Exception as e:
        print(f"❌ Error al eliminar la tabla: {e}")

if __name__ == "__main__":
    drop_photo_table()