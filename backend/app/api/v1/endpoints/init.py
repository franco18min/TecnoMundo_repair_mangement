# backend/app/api/v1/endpoints/init.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.api.v1.dependencies import get_db
from app.models.user import User
from app.models.roles import Role
from app.models.branches import Branch
from app.models.status_order import StatusOrder
from app.models.device_type import DeviceType
from app.core.security import get_password_hash

router = APIRouter()

@router.post("/production-data")
def initialize_production_data(db: Session = Depends(get_db)):
    """
    Endpoint para inicializar datos básicos en producción.
    Solo se ejecuta si no existen datos previos.
    """
    try:
        # Verificar si ya existen datos
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            return {"message": "Los datos de producción ya están inicializados", "status": "already_exists"}

        # 1. Crear roles si no existen
        roles_data = [
            {"id": 1, "role_name": "Administrator"},
            {"id": 2, "role_name": "Receptionist"},
            {"id": 3, "role_name": "Technician"}
        ]
        
        for role_data in roles_data:
            existing_role = db.query(Role).filter(Role.id == role_data["id"]).first()
            if not existing_role:
                role = Role(**role_data)
                db.add(role)

        # 2. Crear sucursales si no existen
        branches_data = [
            {"id": 1, "name": "Sucursal Principal", "address": "Dirección Principal", "phone": "123-456-7890"},
            {"id": 2, "name": "Sucursal Norte", "address": "Dirección Norte", "phone": "123-456-7891"},
            {"id": 3, "name": "Sucursal Sur", "address": "Dirección Sur", "phone": "123-456-7892"}
        ]
        
        for branch_data in branches_data:
            existing_branch = db.query(Branch).filter(Branch.id == branch_data["id"]).first()
            if not existing_branch:
                branch = Branch(**branch_data)
                db.add(branch)

        # 3. Crear estados de órdenes si no existen
        status_data = [
            {"id": 1, "status_name": "Pending"},
            {"id": 2, "status_name": "In Process"},
            {"id": 3, "status_name": "Completed"},
            {"id": 4, "status_name": "Waiting for parts"},
            {"id": 5, "status_name": "Delivered"},
            {"id": 6, "status_name": "Cancelled"}
        ]
        
        for status_item in status_data:
            existing_status = db.query(StatusOrder).filter(StatusOrder.id == status_item["id"]).first()
            if not existing_status:
                status = StatusOrder(**status_item)
                db.add(status)

        # 4. Crear tipos de dispositivos si no existen
        device_types_data = [
            {"id": 1, "type_name": "Smartphone"},
            {"id": 2, "type_name": "Tablet"},
            {"id": 3, "type_name": "Laptop"},
            {"id": 4, "type_name": "Desktop"},
            {"id": 5, "type_name": "Gaming Console"}
        ]
        
        for device_type_data in device_types_data:
            existing_device_type = db.query(DeviceType).filter(DeviceType.id == device_type_data["id"]).first()
            if not existing_device_type:
                device_type = DeviceType(**device_type_data)
                db.add(device_type)

        # Commit de datos básicos
        db.commit()

        # 5. Crear usuario administrador
        admin_user = User(
            username="admin",
            email="admin@tecnomundo.com",
            password=get_password_hash("admin123"),
            role_id=1,  # Administrator
            branch_id=1,  # Sucursal Principal
            is_active=True
        )
        db.add(admin_user)

        # 6. Crear usuario técnico
        tech_user = User(
            username="tecnico1",
            email="tecnico1@tecnomundo.com",
            password=get_password_hash("tecnico123"),
            role_id=3,  # Technician
            branch_id=1,  # Sucursal Principal
            is_active=True
        )
        db.add(tech_user)

        # Commit final
        db.commit()

        return {
            "message": "Datos de producción inicializados correctamente",
            "status": "success",
            "created": {
                "roles": len(roles_data),
                "branches": len(branches_data),
                "status_orders": len(status_data),
                "device_types": len(device_types_data),
                "users": 2
            }
        }

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error de integridad en la base de datos: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.get("/health")
def check_database_health(db: Session = Depends(get_db)):
    """
    Endpoint para verificar la salud de la base de datos.
    """
    try:
        # Verificar conexión básica
        db.execute("SELECT 1")
        
        # Contar registros en tablas principales
        users_count = db.query(User).count()
        roles_count = db.query(Role).count()
        branches_count = db.query(Branch).count()
        
        return {
            "status": "healthy",
            "database": "connected",
            "counts": {
                "users": users_count,
                "roles": roles_count,
                "branches": branches_count
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error de conexión a la base de datos: {str(e)}"
        )