import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "postgres")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password")
    DB_SSLMODE: str = os.getenv("DB_SSLMODE", "prefer")

    DATABASE_URL: str = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@"
        f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
        f"?sslmode={DB_SSLMODE}"
    )

    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
    ]


settings = Settings()