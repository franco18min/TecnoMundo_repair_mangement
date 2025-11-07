"""
Crea la tabla customer.email_subscription para gestionar suscripciones por orden/email.

Uso:
    python backend/scripts/create_email_subscriptions_table.py
"""

import os, sys
from sqlalchemy import text

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.db.session import engine

def run():
    with engine.connect() as conn:
        conn.execute(text(
            """
            CREATE TABLE IF NOT EXISTS customer.email_subscription (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES customer.repair_order(id) ON DELETE CASCADE,
                email VARCHAR(255) NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS idx_email_subscription_order ON customer.email_subscription(order_id);
            CREATE INDEX IF NOT EXISTS idx_email_subscription_email ON customer.email_subscription(email);
            CREATE UNIQUE INDEX IF NOT EXISTS uq_email_subscription_order_email ON customer.email_subscription(order_id, email);
            """
        ))
        conn.commit()
        print("✅ Tabla customer.email_subscription lista.")

if __name__ == "__main__":
    run()