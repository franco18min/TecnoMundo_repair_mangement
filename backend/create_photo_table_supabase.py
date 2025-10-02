# backend/create_photo_table_supabase.py

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def create_photo_table_supabase():
    """Crear la tabla repair_order_photo en Supabase (schema customer)"""
    
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
    
    create_table_sql = """
    -- Crear la tabla repair_order_photo en el schema customer
    CREATE TABLE IF NOT EXISTS customer.repair_order_photo (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES customer.repair_order(id) ON DELETE CASCADE,
        photo TEXT NOT NULL,
        note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Crear índice para mejorar el rendimiento de las consultas
    CREATE INDEX IF NOT EXISTS idx_repair_order_photo_order_id ON customer.repair_order_photo(order_id);
    
    -- Agregar comentarios para documentación
    COMMENT ON TABLE customer.repair_order_photo IS 'Tabla para almacenar fotos de diagnóstico de órdenes de reparación';
    COMMENT ON COLUMN customer.repair_order_photo.photo IS 'Imagen en formato base64 con prefijo data:image/jpeg;base64,';
    COMMENT ON COLUMN customer.repair_order_photo.note IS 'Nota descriptiva opcional de la foto';
    """
    
    # Verificar que la tabla repair_order existe antes de crear la tabla de fotos
    verify_repair_order_sql = """
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'customer' 
        AND table_name = 'repair_order'
    );
    """
    
    try:
        with engine.connect() as connection:
            print("🔍 Verificando que la tabla repair_order existe...")
            
            # Verificar que repair_order existe
            result = connection.execute(text(verify_repair_order_sql))
            repair_order_exists = result.fetchone()[0]
            
            if not repair_order_exists:
                print("❌ Error: La tabla customer.repair_order no existe")
                print("💡 Asegúrate de que la base de datos esté correctamente configurada")
                return False
            
            print("✅ Tabla customer.repair_order encontrada")
            print("🔧 Creando tabla customer.repair_order_photo...")
            
            # Ejecutar el SQL para crear la tabla
            connection.execute(text(create_table_sql))
            connection.commit()
            
            print("✅ Tabla repair_order_photo creada exitosamente en Supabase")
            print("📋 Estructura de la tabla:")
            print("   - id: SERIAL PRIMARY KEY")
            print("   - order_id: INTEGER (FK a customer.repair_order)")
            print("   - photo: TEXT (imagen en base64)")
            print("   - note: TEXT (nota opcional)")
            print("   - created_at: TIMESTAMP WITH TIME ZONE")
            print("📊 Índice creado: idx_repair_order_photo_order_id")
            
            return True
            
    except Exception as e:
        print(f"❌ Error al crear la tabla en Supabase: {e}")
        print("💡 Verifica:")
        print("   - Las credenciales de conexión a Supabase")
        print("   - Los permisos de la base de datos")
        print("   - La conectividad de red")
        return False

if __name__ == "__main__":
    print("🚀 Creando tabla repair_order_photo en Supabase...")
    print("=" * 60)
    
    success = create_photo_table_supabase()
    
    print("=" * 60)
    if success:
        print("🎉 ¡Migración a Supabase completada exitosamente!")
        print("💡 Ahora puedes probar la funcionalidad de fotos en el frontend")
    else:
        print("💥 Error en la migración a Supabase")
        print("🔧 Revisa la configuración y vuelve a intentar")