import psycopg2

try:
    conn = psycopg2.connect(
        host="aws-1-sa-east-1.pooler.supabase.com",
        port=6543,
        dbname="users",
        user="postgres.zshbhslyzclpovyngryf",
        password="UoF45N8dpSFyXs9y",
        sslmode="require"
    )
    cur = conn.cursor()
    cur.execute('SELECT * FROM system_users.users LIMIT 1;')
    row = cur.fetchone()
    if row:
        print("Conexión exitosa y acceso a la tabla confirmado.")
    else:
        print("Conexión exitosa, pero la tabla está vacía.")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error al conectar o consultar: {e}")