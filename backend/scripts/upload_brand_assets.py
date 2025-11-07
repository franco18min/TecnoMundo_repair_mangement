import os
import sys
import base64
import ssl
from pathlib import Path

from dotenv import load_dotenv
import pg8000


def load_env():
    # Cargar .env del backend
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=str(env_path))
    else:
        # Intentar cargar de la raíz del proyecto
        load_dotenv()


def connect_db():
    host = os.getenv("DB_HOST")
    port = int(os.getenv("DB_PORT", "5432"))
    database = os.getenv("DB_NAME", "postgres")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    sslmode = os.getenv("DB_SSLMODE", "require").lower()
    sslrootcert = os.getenv("DB_SSLROOTCERT")
    if not all([host, user, password]):
        print("Faltan variables DB_HOST, DB_USER o DB_PASSWORD en backend/.env")
        sys.exit(2)

    # Configurar SSL según sslmode
    if sslmode == "require":
        # TLS sin verificación de certificado (equivalente a 'require')
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
    else:
        # verify-ca / verify-full requieren CA
        ctx = ssl.create_default_context()
        if sslrootcert and Path(sslrootcert).exists():
            ctx.load_verify_locations(cafile=sslrootcert)
        if sslmode == "verify-full":
            ctx.check_hostname = True
            ctx.verify_mode = ssl.CERT_REQUIRED
        elif sslmode == "verify-ca":
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_REQUIRED

    conn = pg8000.connect(host=host, port=port, database=database, user=user, password=password, ssl_context=ctx)
    return conn


def get_columns(conn):
    q = """
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'system' AND table_name = 'photo';
    """
    cur = conn.cursor()
    cur.execute(q)
    cols = [r[0] for r in cur.fetchall()]
    cur.close()
    return cols


def ensure_table(conn):
    cur = conn.cursor()
    # Crear schema y tabla si no existen
    cur.execute("CREATE SCHEMA IF NOT EXISTS system")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS system.photo (
          id uuid primary key default gen_random_uuid(),
          name text not null unique,
          mime_type text not null default 'image/png',
          data_base64 text,
          url text,
          created_at timestamptz default now(),
          updated_at timestamptz default now()
        )
        """
    )
    conn.commit()
    cur.close()


def upsert_base64(conn, name: str, mime_type: str, b64: str, cols):
    cur = conn.cursor()
    if "data_base64" in cols:
        sql = (
            "INSERT INTO system.photo (name, mime_type, data_base64, updated_at) "
            "VALUES (%s, %s, %s, now()) "
            "ON CONFLICT (name) DO UPDATE SET data_base64 = EXCLUDED.data_base64, updated_at = now()"
        )
        params = (name, mime_type, b64)
    elif "data" in cols:
        # Insertar bytes en BYTEA
        data_bytes = base64.b64decode(b64)
        sql = (
            "INSERT INTO system.photo (name, mime_type, data, updated_at) "
            "VALUES (%s, %s, %s, now()) "
            "ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data, updated_at = now()"
        )
        params = (name, mime_type, pg8000.Binary(data_bytes))
    else:
        # Agregar columna data_base64 si no existe
        cur.execute("ALTER TABLE system.photo ADD COLUMN IF NOT EXISTS data_base64 text")
        conn.commit()
        sql = (
            "INSERT INTO system.photo (name, mime_type, data_base64, updated_at) "
            "VALUES (%s, %s, %s, now()) "
            "ON CONFLICT (name) DO UPDATE SET data_base64 = EXCLUDED.data_base64, updated_at = now()"
        )
        params = (name, mime_type, b64)

    cur.execute(sql, params)
    conn.commit()
    cur.close()


def main():
    load_env()
    conn = connect_db()
    ensure_table(conn)
    cols = get_columns(conn)

    project_root = Path(__file__).resolve().parents[2]
    photo_dir = project_root / "photo"
    favicon_path = photo_dir / "FAVICON.png"
    logo_path = photo_dir / "LOGO.png"

    if not favicon_path.exists() or not logo_path.exists():
        print("No se encontraron FAVICON.png y LOGO.png en la carpeta 'photo' del proyecto.")
        sys.exit(2)

    with open(favicon_path, "rb") as f:
        favicon_b64 = base64.b64encode(f.read()).decode("ascii")
    with open(logo_path, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("ascii")

    upsert_base64(conn, "favicon", "image/png", favicon_b64, cols)
    upsert_base64(conn, "logo", "image/png", logo_b64, cols)

    # Verificar
    cur = conn.cursor()
    cur.execute("SELECT name, mime_type FROM system.photo WHERE name IN ('favicon','logo')")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    print("Registros presentes en system.photo:")
    for r in rows:
        print("-", r)


if __name__ == "__main__":
    main()