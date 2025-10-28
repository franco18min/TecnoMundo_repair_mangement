import os
from dotenv import load_dotenv

# Carga las variables de entorno desde un archivo .env
load_dotenv()

class Settings:
    # --- Configuración de la Aplicación ---
    APP_NAME: str = os.getenv("APP_NAME", "TecnoMundo Repair Management")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # --- Configuración de Autenticación ---
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tu_secret_key_super_seguro_aqui")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # --- Configuración MCP ---
    USE_MCP: bool = os.getenv("USE_MCP", "true").lower() == "true"
    MCP_ENABLED: bool = os.getenv("MCP_ENABLED", "true").lower() == "true"

    # --- Configuración de CORS ---
    # Lee los orígenes permitidos desde una variable de entorno.
    # En ausencia de configuración, permitimos el dominio de producción y el frontend local.
    ALLOWED_ORIGINS_STR: str = os.getenv(
        "ALLOWED_ORIGINS",
        "https://tecnoapp.ar,http://localhost:5173"
    )
    ALLOWED_ORIGINS: list[str] = [
        origin.strip() for origin in ALLOWED_ORIGINS_STR.split(',')
    ]

    # --- Configuración de Archivos ---
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")

    # --- Configuración Opcional ---
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Email
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() == "true"

    def get_database_info(self):
        """
        Retorna información sobre la configuración de base de datos.
        En modo MCP, no se requiere conexión directa.
        """
        if self.USE_MCP:
            return {
                "type": "MCP",
                "provider": "Supabase",
                "schemas": ["system", "customer"],
                "connection": "MCP Server"
            }
        else:
            return {
                "type": "Direct",
                "provider": "PostgreSQL",
                "connection": "Direct Database Connection"
            }

settings = Settings()