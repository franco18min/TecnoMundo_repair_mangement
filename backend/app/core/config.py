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
    DB_SSLMODE: str = os.getenv("DB_SSLMODE", "prefer") # 'require' para Supabase

    # URL de conexión a la base de datos
    DATABASE_URL: str = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@"
        f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
        f"?sslmode={DB_SSLMODE}"
    )

    # --- Configuración de CORS ---
    # Lee los orígenes permitidos desde una variable de entorno.
    # Si no se define, permite solo el frontend local por defecto.
    ALLOWED_ORIGINS_STR: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
    ALLOWED_ORIGINS: list[str] = [
        origin.strip() for origin in ALLOWED_ORIGINS_STR.split(',')
    ]

settings = Settings()