"""
Script de prueba de conexión a la base de datos.

Uso:
  1) Copia backend/.env.example a backend/.env y ajusta credenciales.
  2) Ejecuta: python backend/scripts/test_db_connection.py

Este script intenta conectarse usando SQLAlchemy y ejecuta SELECT 1.
Imprime detalles mínimos (sin exponer la contraseña) para ayudarte a depurar.
"""

import os
from sqlalchemy import create_engine, text
import ssl
from dotenv import load_dotenv


def mask(s: str, visible: int = 4) -> str:
    if s is None:
        return "<none>"
    if len(s) <= visible:
        return "*" * len(s)
    return s[:visible] + "*" * (len(s) - visible)


def main():
    # Cargar variables desde backend/.env
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    load_dotenv(env_path)

    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_SSLMODE = os.getenv("DB_SSLMODE", "prefer")
    DB_DRIVER = os.getenv("DB_DRIVER", "pg8000")

    print("[DB] Driver:", DB_DRIVER)
    print("[DB] Host:", DB_HOST)
    print("[DB] Port:", DB_PORT)
    print("[DB] Name:", DB_NAME)
    print("[DB] User:", DB_USER)
    print("[DB] Password(masked):", mask(DB_PASSWORD))
    print("[DB] SSL mode:", DB_SSLMODE)

    if DB_DRIVER == "pg8000":
        database_url = f"postgresql+pg8000://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        # Configurar SSL para pg8000 usando ssl_context (compatibilidad con versiones actuales de pg8000)
        mode = (DB_SSLMODE or "require").lower()
        ssl_context = ssl.create_default_context()
        print("[DB] pg8000 ssl mode:", mode)
        if mode == "require":
            # Cifrado requerido pero sin verificación de certificado
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
        elif mode == "verify-ca":
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_REQUIRED
            # Si hubiera variable DB_SSLROOTCERT, podríamos cargarla aquí
            rootcert = os.getenv("DB_SSLROOTCERT")
            if rootcert:
                try:
                    ssl_context.load_verify_locations(cafile=rootcert)
                    print(f"[DB][SSL] CA cargada: {rootcert}")
                except Exception as e:
                    print(f"[DB][SSL] No se pudo cargar CA {rootcert}: {e}")
        elif mode == "verify-full":
            ssl_context.check_hostname = True
            ssl_context.verify_mode = ssl.CERT_REQUIRED
            rootcert = os.getenv("DB_SSLROOTCERT")
            if rootcert:
                try:
                    ssl_context.load_verify_locations(cafile=rootcert)
                    print(f"[DB][SSL] CA cargada: {rootcert}")
                except Exception as e:
                    print(f"[DB][SSL] No se pudo cargar CA {rootcert}: {e}")
        connect_args = {"ssl_context": ssl_context}
    else:
        database_url = (
            f"postgresql+{DB_DRIVER}://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            f"?sslmode={DB_SSLMODE}"
        )
        connect_args = {}

    print("[DB] URL:", database_url.replace(DB_PASSWORD, "<masked>"))

    try:
        engine = create_engine(database_url, pool_pre_ping=True, echo=False, connect_args=connect_args)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("[DB] SELECT 1 ->", list(result))
        print("✅ Conexión exitosa.")
    except Exception as e:
        print("❌ Error al conectar:", type(e).__name__, "-", e)
        raise


if __name__ == "__main__":
    main()