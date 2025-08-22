import psycopg2

# --- Credenciales de tu base de datos Supabase ---
db_config = {
    "host": "aws-1-sa-east-1.pooler.supabase.com",
    "port": "6543",
    "dbname": "postgres",
    "user": "postgres.zshbhslyzclpovyngryf",
    "password": "UoF45N8dpSFyXs9y",
    "sslmode": "require"  # ¡Este parámetro es crucial para Supabase!
}
# -------------------------------------------------

print(f"Intentando conectar a '{db_config['host']}'...")

try:
    # Intenta establecer la conexión con los datos del diccionario
    conn = psycopg2.connect(**db_config)

    # Si llegas aquí, la conexión fue exitosa
    print("\n✅ ¡Conexión exitosa!")

    # Opcional: Verificamos que podemos ejecutar una consulta
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    db_version = cursor.fetchone()
    print(f"Versión de PostgreSQL: {db_version[0]}")

    # Cerramos el cursor y la conexión
    cursor.close()
    conn.close()
    print("Conexión cerrada correctamente.")

except psycopg2.OperationalError as e:
    # Capturamos errores específicos de conexión (firewall, host incorrecto, etc.)
    print("\n❌ ERROR: No se pudo conectar a la base de datos.")
    print("Este error suele estar relacionado con:")
    print("  - Un firewall bloqueando el puerto 5432.")
    print("  - El 'host' o 'puerto' son incorrectos.")
    print("  - La base de datos no está accesible desde tu IP.\n")
    print(f"Detalle técnico del error:\n{e}")

except Exception as e:
    # Capturamos otros posibles errores (contraseña incorrecta, etc.)
    print(f"\n❌ Ocurrió un error inesperado: {e}")