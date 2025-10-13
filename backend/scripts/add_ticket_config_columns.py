#!/usr/bin/env python3
"""
Script para agregar columnas de configuración de tickets a la tabla system.branch
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.session import engine

def add_ticket_config_columns():
    """Agregar columnas de configuración de tickets a la tabla system.branch"""
    
    # Lista de columnas a agregar
    columns_to_add = [
        # Estilos de cabecera para tickets de cliente
        "client_header_style TEXT DEFAULT '{}'",
        
        # Estilos de cabecera para tickets de taller
        "workshop_header_style TEXT DEFAULT '{}'",
        
        # Contenido del cuerpo para tickets de cliente
        "client_body_content TEXT DEFAULT ''",
        
        # Contenido del cuerpo para tickets de taller  
        "workshop_body_content TEXT DEFAULT ''",
        
        # Estilos del cuerpo para tickets de cliente
        "client_body_style TEXT DEFAULT '{}'",
        
        # Estilos del cuerpo para tickets de taller
        "workshop_body_style TEXT DEFAULT '{}'"
    ]
    
    try:
        with engine.connect() as connection:
            # Verificar si las columnas ya existen
            check_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'system' 
                AND table_name = 'branch'
                AND column_name IN (
                    'client_header_style', 
                    'workshop_header_style',
                    'client_body_content',
                    'workshop_body_content', 
                    'client_body_style',
                    'workshop_body_style'
                )
            """)
            
            existing_columns = connection.execute(check_query).fetchall()
            existing_column_names = [row[0] for row in existing_columns]
            
            print(f"Columnas existentes encontradas: {existing_column_names}")
            
            # Mapeo de nombres de columnas a sus definiciones
            column_definitions = {
                'client_header_style': "client_header_style TEXT DEFAULT '{}'",
                'workshop_header_style': "workshop_header_style TEXT DEFAULT '{}'", 
                'client_body_content': "client_body_content TEXT DEFAULT ''",
                'workshop_body_content': "workshop_body_content TEXT DEFAULT ''",
                'client_body_style': "client_body_style TEXT DEFAULT '{}'",
                'workshop_body_style': "workshop_body_style TEXT DEFAULT '{}'"
            }
            
            # Agregar solo las columnas que no existen
            for column_name, column_def in column_definitions.items():
                if column_name not in existing_column_names:
                    alter_query = text(f"ALTER TABLE system.branch ADD COLUMN {column_def}")
                    connection.execute(alter_query)
                    print(f"✓ Columna '{column_name}' agregada exitosamente")
                else:
                    print(f"- Columna '{column_name}' ya existe, omitiendo")
            
            connection.commit()
            print("\n✅ Migración completada exitosamente")
            
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        raise

def verify_columns():
    """Verificar que las columnas fueron agregadas correctamente"""
    try:
        with engine.connect() as connection:
            verify_query = text("""
                SELECT column_name, data_type, column_default
                FROM information_schema.columns 
                WHERE table_schema = 'system' 
                AND table_name = 'branch'
                AND column_name IN (
                    'client_header_style', 
                    'workshop_header_style',
                    'client_body_content',
                    'workshop_body_content', 
                    'client_body_style',
                    'workshop_body_style'
                )
                ORDER BY column_name
            """)
            
            result = connection.execute(verify_query).fetchall()
            
            print("\n📋 Verificación de columnas agregadas:")
            print("-" * 60)
            for row in result:
                print(f"Columna: {row[0]:<25} Tipo: {row[1]:<10} Default: {row[2]}")
            
            if len(result) == 6:
                print("\n✅ Todas las columnas fueron agregadas correctamente")
            else:
                print(f"\n⚠️  Solo {len(result)} de 6 columnas encontradas")
                
    except Exception as e:
        print(f"❌ Error durante la verificación: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando migración de columnas de configuración de tickets...")
    print("=" * 60)
    
    add_ticket_config_columns()
    verify_columns()
    
    print("\n🎉 Proceso completado")