import os
from dotenv import load_dotenv

# Carga las variables de entorno desde un archivo .env
load_dotenv()

class Settings:
    # --- Configuración de la Base de Datos ---
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "postgres")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password")
    DB_SSLMODE: str = os.getenv("DB_SSLMODE", "prefer")  # 'require' para Supabase
    # Permitir especificar un certificado raíz CA para verificación SSL cuando sea necesario
    DB_SSLROOTCERT = os.getenv("DB_SSLROOTCERT")
    # Nuevo: permite elegir el driver del conector de PostgreSQL
    DB_DRIVER: str = os.getenv("DB_DRIVER", "pg8000")  # por defecto usamos pg8000 para evitar compilación en Windows

    # Construcción de la URL de conexión dependiendo del driver
    if DB_DRIVER == "pg8000":
        # pg8000 no soporta el parámetro 'sslmode' en la URL; se configurará vía connect_args en create_engine
        DATABASE_URL: str = (
            f"postgresql+pg8000://{DB_USER}:{DB_PASSWORD}@"
            f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )
    else:
        # Para psycopg2 (y similares) mantenemos el parámetro sslmode en la URL
        DATABASE_URL: str = (
            f"postgresql+{DB_DRIVER}://{DB_USER}:{DB_PASSWORD}@"
            f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
            f"?sslmode={DB_SSLMODE}"
        )

    # --- Configuración de CORS ---
    # Lee los orígenes permitidos desde una variable de entorno.
    # En ausencia de configuración, permitimos el dominio de producción y el frontend local.
    ALLOWED_ORIGINS_STR: str = os.getenv(
        "ALLOWED_ORIGINS",
        "https://tecnoapp.ar,https://www.tecnoapp.ar,http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
    )
    ALLOWED_ORIGINS: list[str] = [
        origin.strip() for origin in ALLOWED_ORIGINS_STR.split(',')
    ]

    # --- Configuración de Email Transaccional (EnvialoSimple/DonWeb) ---
    EMAIL_PROVIDER: str = os.getenv("EMAIL_PROVIDER", "envialosimple")
    EMAIL_API_BASE_URL: str = os.getenv("EMAIL_API_BASE_URL", "")
    EMAIL_API_KEY: str = os.getenv("EMAIL_API_KEY", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "no-reply@tecnoapp.ar")
    EMAIL_FROM_NAME: str = os.getenv("EMAIL_FROM_NAME", "TecnoMundo")
    EMAIL_REPLY_TO: str = os.getenv("EMAIL_REPLY_TO", "no-reply@tecnoapp.ar")

    # URL del portal de clientes (para enlaces en correos)
    CLIENT_PORTAL_BASE_URL: str = os.getenv("CLIENT_PORTAL_BASE_URL", "https://tecnoapp.ar/client/order")

    # --- Integración con Supabase (REST) para activos de marca ---
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")

settings = Settings()
