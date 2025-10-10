#!/usr/bin/env python3
"""
Script de migración para agregar campos de personalización de tickets a la tabla system.branch
"""

import sys
import os

# Agregar el directorio padre al path para importar módulos de la app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.session import SessionLocal
from app.core.config import settings

def add_branch_ticket_fields():
    """
    Agrega las columnas necesarias para personalización de tickets a la tabla system.branch
    """
    db = SessionLocal()
    
    try:
        print("🔄 Iniciando migración de campos de tickets para sucursales...")
        
        # Lista de columnas a agregar
        columns_to_add = [
            "company_name VARCHAR",
            "address VARCHAR", 
            "phone VARCHAR",
            "email VARCHAR",
            "icon_name VARCHAR DEFAULT 'Building'"
        ]
        
        for column_def in columns_to_add:
            column_name = column_def.split()[0]
            
            # Verificar si la columna ya existe
            check_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'system' 
                AND table_name = 'branch' 
                AND column_name = :column_name
            """)
            
            result = db.execute(check_query, {"column_name": column_name}).fetchone()
            
            if result:
                print(f"✅ La columna '{column_name}' ya existe, omitiendo...")
                continue
            
            # Agregar la columna
            alter_query = text(f"ALTER TABLE system.branch ADD COLUMN {column_def}")
            db.execute(alter_query)
            print(f"✅ Columna '{column_name}' agregada exitosamente")
        
        # Actualizar sucursales existentes con valores por defecto
        update_query = text("""
            UPDATE system.branch 
            SET 
                company_name = COALESCE(company_name, 'TECNO MUNDO'),
                address = COALESCE(address, 'OTERO 280'),
                phone = COALESCE(phone, '3884087444'),
                email = COALESCE(email, 'INFO@TECNOVENTAS.COM.AR'),
                icon_name = COALESCE(icon_name, 'Building')
            WHERE company_name IS NULL OR address IS NULL OR phone IS NULL OR email IS NULL OR icon_name IS NULL
        """)
        
        result = db.execute(update_query)
        db.commit()
        
        print(f"✅ {result.rowcount} sucursales actualizadas con valores por defecto")
        print("🎉 Migración completada exitosamente!")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print(f"🔗 Conectando a la base de datos: {settings.DATABASE_URL}")
    add_branch_ticket_fields()