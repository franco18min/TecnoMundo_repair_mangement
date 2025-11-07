"""
Script de migración: agrega columnas 'email' y 'is_subscribed' a la tabla customer.customer.

Uso:
    python backend/scripts/add_customer_email_subscription_columns.py

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
        # Agregar columna email si no existe
        conn.execute(text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'customer' AND table_name = 'customer' AND column_name = 'email'
                ) THEN
                    ALTER TABLE customer.customer ADD COLUMN email VARCHAR(255);
                END IF;
            END;
            $$;
            """
        ))

        # Agregar columna is_subscribed si no existe
        conn.execute(text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'customer' AND table_name = 'customer' AND column_name = 'is_subscribed'
                ) THEN
                    ALTER TABLE customer.customer ADD COLUMN is_subscribed BOOLEAN DEFAULT FALSE;
                    UPDATE customer.customer SET is_subscribed = FALSE WHERE is_subscribed IS NULL;
                END IF;
            END;
            $$;
            """
        ))
        conn.commit()
        print("✅ Migración completada: columnas 'email' e 'is_subscribed' listas.")

if __name__ == "__main__":
    run()