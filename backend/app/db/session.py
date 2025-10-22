from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import URL
from app.core.config import settings

print(f"[DB] Using driver: {settings.DB_DRIVER}, url: {settings.DATABASE_URL}")

# Configuración de SSL para pg8000 según DB_SSLMODE
connect_args = {}
try:
    if settings.DB_DRIVER == "pg8000":
        import ssl
        ssl_context = ssl.create_default_context()
        mode = (settings.DB_SSLMODE or "require").lower()
        print(f"[DB] SSL mode: {mode}")
        # Mapeo de modos de SSL a configuración de SSLContext
        if mode == "require":
            # Cifrado requerido pero sin verificación de certificado (equivalente a libpq 'require')
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
        elif mode == "verify-ca":
            # Verifica contra CA pero no hostname
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_REQUIRED
            if getattr(settings, "DB_SSLROOTCERT", None):
                try:
                    ssl_context.load_verify_locations(cafile=settings.DB_SSLROOTCERT)
                    print(f"[DB][SSL] CA cargada: {settings.DB_SSLROOTCERT}")
                except Exception as e:
                    print(f"[DB][SSL] No se pudo cargar CA {settings.DB_SSLROOTCERT}: {e}")
        elif mode == "verify-full":
            # Verifica CA y hostname
            ssl_context.check_hostname = True
            ssl_context.verify_mode = ssl.CERT_REQUIRED
            if getattr(settings, "DB_SSLROOTCERT", None):
                try:
                    ssl_context.load_verify_locations(cafile=settings.DB_SSLROOTCERT)
                    print(f"[DB][SSL] CA cargada: {settings.DB_SSLROOTCERT}")
                except Exception as e:
                    print(f"[DB][SSL] No se pudo cargar CA {settings.DB_SSLROOTCERT}: {e}")
        # Asignamos el contexto SSL al conector pg8000
        connect_args = {"ssl_context": ssl_context}
except Exception as e:
    print(f"[DB] Error configurando SSL: {e}")
    connect_args = {}

if settings.DB_DRIVER == "pg8000":
    # Construimos la URL sin parámetros de query para evitar 'sslmode'
    url = URL.create(
        drivername="postgresql+pg8000",
        username=settings.DB_USER,
        password=settings.DB_PASSWORD,
        host=settings.DB_HOST,
        port=int(settings.DB_PORT) if settings.DB_PORT else None,
        database=settings.DB_NAME,
    )
    engine = create_engine(url, pool_pre_ping=True, connect_args=connect_args)
else:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)