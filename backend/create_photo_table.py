# backend/create_photo_table.py

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def create_photo_table():
    """Crear la tabla repair_order_photo en el schema customer"""
    
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
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS customer.repair_order_photo (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES customer.repair_order(id) ON DELETE CASCADE,
        photo TEXT NOT NULL,
        note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Crear índice para mejorar el rendimiento de las consultas
    CREATE INDEX IF NOT EXISTS idx_repair_order_photo_order_id ON customer.repair_order_photo(order_id);
    """
    
    try:
        with engine.connect() as connection:
            # Ejecutar el SQL para crear la tabla
            connection.execute(text(create_table_sql))
            connection.commit()
            print("✅ Tabla repair_order_photo creada exitosamente")
            
    except Exception as e:
        print(f"❌ Error al crear la tabla: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔧 Creando tabla repair_order_photo...")
    success = create_photo_table()
    
    if success:
        print("🎉 ¡Migración completada exitosamente!")
    else:
        print("💥 Error en la migración")
        sys.exit(1)