# backend/scripts/create_user.py

import os
import sys
from getpass import getpass

# --- Añadir la ruta raíz del proyecto al sys.path ---
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.session import SessionLocal
from app.models.user import User
from app.models.roles import Role
from app.models.repair_order import RepairOrder
from app.models.customer import Customer              # <--- AÑADE ESTA LÍNEA
from app.models.status_order import StatusOrder      # <--- Y AÑADE ESTA LÍNEA
from app.core.security import get_password_hash

def get_db():
    """Generador de sesión de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def list_roles(db: Session):
    """Muestra los roles disponibles en la base de datos."""
    print("\n--- Roles Disponibles ---")
    roles = db.query(Role).all()
    if not roles:
        print("No hay roles en la base de datos. Por favor, añádelos primero.")
        return None
    for role in roles:
        print(f"ID: {role.id}, Nombre: {role.role_name}")
    return roles

def create_user():
    """Función principal para crear un usuario interactivamente."""
    db_gen = get_db()
    db = next(db_gen)

    try:
        print("--- Creación de un Nuevo Usuario ---")

        # 1. Listar y seleccionar rol
        available_roles = list_roles(db)
        if not available_roles:
            return

        role_id_str = input("Introduce el ID del rol para el nuevo usuario: ")
        try:
            role_id = int(role_id_str)
            if not any(r.id == role_id for r in available_roles):
                print(f"❌ Error: El ID de rol '{role_id}' no es válido.")
                return
        except ValueError:
            print("❌ Error: El ID del rol debe ser un número entero.")
            return

        # 2. Pedir datos del usuario
        username = input("Nombre de usuario: ")
        email = input("Email: ")
        password = getpass("Contraseña (no se mostrará al escribir): ")
        password_confirm = getpass("Confirma la contraseña: ")

        if password != password_confirm:
            print("\n❌ Error: Las contraseñas no coinciden.")
            return

        # 3. Cifrar contraseña y crear el objeto de usuario
        hashed_password = get_password_hash(password)

        new_user = User(
            username=username,
            email=email,
            password=hashed_password,
            role_id=role_id
        )

        # 4. Añadir a la base de datos
        db.add(new_user)
        db.commit()

        print(f"\n✅ ¡Usuario '{username}' creado exitosamente!")

    except IntegrityError as e:
        db.rollback()
        # Detectar qué restricción falló (username o email)
        if "uq_user_username" in str(e.orig) or 'Key (username)' in str(e.orig):
            print(f"\n❌ Error: El nombre de usuario '{username}' ya existe.")
        elif "uq_user_email" in str(e.orig) or 'Key (email)' in str(e.orig):
            print(f"\n❌ Error: El email '{email}' ya está registrado.")
        else:
            print(f"\n❌ Error de integridad en la base de datos: {e}")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Ha ocurrido un error inesperado: {e}")

    finally:
        # Asegurarse de cerrar la sesión
        next(db_gen, None)

if __name__ == "__main__":
    create_user()