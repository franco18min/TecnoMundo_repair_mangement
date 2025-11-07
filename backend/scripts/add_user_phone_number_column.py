"""
Script de migración: agrega columna 'phone_number' a la tabla system.user.

Uso:
    python backend/scripts/add_user_phone_number_column.py

Requiere que las variables de entorno de la BD estén configuradas (ver backend/.env.example).
"""

import os, sys
from sqlalchemy import text

# Asegurar que el paquete 'app' sea resolvible al ejecutar como script
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.db.session import engine

def run():
    with engine.connect() as conn:
        conn.execute(text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'system' AND table_name = 'user' AND column_name = 'phone_number'
                ) THEN
                    ALTER TABLE system."user" ADD COLUMN phone_number VARCHAR(30);
                END IF;
            END;
            $$;
            """
        ))
        conn.commit()
        print("✅ Migración completada: columna 'phone_number' en system.user lista.")

if __name__ == "__main__":
    run()