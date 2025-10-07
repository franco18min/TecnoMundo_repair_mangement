# backend/scripts/create_predefined_checklist_table.py

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_table_and_populate():
    # Crear engine directamente
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as connection:
        # Crear la tabla si no existe
        print("Verificando/creando tabla customer.predefined_checklist_item...")
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS customer.predefined_checklist_item (
            id SERIAL PRIMARY KEY,
            question VARCHAR(500) NOT NULL
        );
        """
        connection.execute(text(create_table_sql))
        
        # Verificar si la columna is_default_selected existe
        check_column_sql = """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'customer' 
        AND table_name = 'predefined_checklist_item' 
        AND column_name = 'is_default_selected'
        """
        result = connection.execute(text(check_column_sql))
        column_exists = result.fetchone() is not None
        
        if not column_exists:
            print("Agregando columna is_default_selected...")
            add_column_sql = """
            ALTER TABLE customer.predefined_checklist_item 
            ADD COLUMN is_default_selected BOOLEAN NOT NULL DEFAULT FALSE
            """
            connection.execute(text(add_column_sql))
            print("Columna agregada exitosamente.")
        else:
            print("La columna is_default_selected ya existe.")
        
        connection.commit()
        print("Tabla verificada/creada exitosamente.")
        
        # Verificar si ya existen preguntas
        check_sql = "SELECT COUNT(*) as count FROM customer.predefined_checklist_item"
        result = connection.execute(text(check_sql))
        count = result.fetchone()[0]
        
        if count > 0:
            print(f"La tabla ya contiene {count} preguntas. No se agregaron nuevas preguntas.")
            return
        
        # Poblar la tabla
        print("Poblando tabla con preguntas iniciales...")
        
        initial_questions = [
            ("¿El equipo enciende correctamente?", True),
            ("¿La pantalla funciona sin problemas?", True),
            ("¿Los botones responden adecuadamente?", True),
            ("¿El equipo tiene daños físicos visibles?", True),
            ("¿La batería mantiene la carga?", False),
            ("¿Los puertos de carga funcionan?", False),
            ("¿El audio funciona correctamente?", False),
            ("¿La cámara toma fotos nítidas?", False),
            ("¿El equipo se sobrecalienta?", False),
            ("¿Hay problemas de conectividad?", False)
        ]
        
        for question, is_default in initial_questions:
            insert_sql = """
            INSERT INTO customer.predefined_checklist_item (question, is_default_selected) 
            VALUES (:question, :is_default)
            """
            connection.execute(text(insert_sql), {"question": question, "is_default": is_default})
        
        connection.commit()
        print(f"Se agregaron {len(initial_questions)} preguntas iniciales exitosamente.")

if __name__ == "__main__":
    try:
        create_table_and_populate()
        print("Proceso completado exitosamente.")
    except Exception as e:
        print(f"Error: {e}")