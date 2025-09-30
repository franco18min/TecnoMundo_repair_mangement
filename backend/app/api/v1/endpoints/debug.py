# backend/app/api/v1/endpoints/debug.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.v1.dependencies import get_db
from app.models.user import User
from app.models.roles import Role
from app.models.branch import Branch
from app.core.security import verify_password, get_password_hash

router = APIRouter()

@router.get("/db-status")
def check_database_status(db: Session = Depends(get_db)):
    """Endpoint para verificar el estado de la base de datos"""
    try:
        # Contar usuarios
        user_count = db.query(User).count()
        
        # Contar roles
        role_count = db.query(Role).count()
        
        # Contar sucursales
        branch_count = db.query(Branch).count()
        
        # Buscar usuario admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        return {
            "status": "connected",
            "counts": {
                "users": user_count,
                "roles": role_count,
                "branches": branch_count
            },
            "admin_user": {
                "exists": admin_user is not None,
                "id": admin_user.id if admin_user else None,
                "username": admin_user.username if admin_user else None,
                "email": admin_user.email if admin_user else None,
                "is_active": admin_user.is_active if admin_user else None,
                "role_id": admin_user.role_id if admin_user else None,
                "branch_id": admin_user.branch_id if admin_user else None
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "type": type(e).__name__
        }

@router.post("/test-auth")
def test_authentication(db: Session = Depends(get_db)):
    """Endpoint para probar la autenticación del usuario admin"""
    try:
        # Buscar usuario admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        if not admin_user:
            return {
                "status": "error",
                "message": "Usuario admin no encontrado"
            }
        
        # Probar verificación de contraseña
        test_password = "admin123"
        is_valid = verify_password(test_password, admin_user.password)
        
        # Generar nuevo hash para comparar
        new_hash = get_password_hash(test_password)
        is_new_valid = verify_password(test_password, new_hash)
        
        return {
            "status": "success",
            "user_found": True,
            "password_verification": {
                "original_hash_valid": is_valid,
                "new_hash_valid": is_new_valid,
                "original_hash_preview": admin_user.password[:50] + "...",
                "new_hash_preview": new_hash[:50] + "..."
            },
            "user_details": {
                "id": admin_user.id,
                "username": admin_user.username,
                "email": admin_user.email,
                "is_active": admin_user.is_active,
                "role_id": admin_user.role_id,
                "branch_id": admin_user.branch_id
            }
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc()
        }