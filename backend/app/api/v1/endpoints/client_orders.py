# backend/app/api/v1/endpoints/client_orders.py

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.v1.dependencies import get_db
from app.models.repair_order import RepairOrder
from app.models.customer import Customer
from app.models.branch import Branch
from app.models.user import User
from app.models.status_order import StatusOrder
from app.models.device_type import DeviceType
from app.schemas.repair_order import RepairOrderPublic
from app.services.email_transaccional import EmailTransactionalService
from app.crud import crud_email_subscription

router = APIRouter()

@router.get("/client-search", response_model=RepairOrderPublic)
def search_order_by_client_query(
    q: str = Query(..., description="DNI del cliente o número de orden"),
    db: Session = Depends(get_db)
):
    """
    Endpoint público para buscar órdenes por DNI del cliente o número de orden.
    No requiere autenticación para permitir consultas de clientes.
    """
    if not q or len(q.strip()) < 3:
        raise HTTPException(
            status_code=400, 
            detail="La consulta debe tener al menos 3 caracteres"
        )
    
    query_param = q.strip()
    
    # Buscar por ID de orden o DNI del cliente
    from sqlalchemy.orm import joinedload
    
    order = db.query(RepairOrder).options(
        joinedload(RepairOrder.customer),
        joinedload(RepairOrder.status),
        joinedload(RepairOrder.technician),
        joinedload(RepairOrder.device_type),
        joinedload(RepairOrder.branch)
    ).join(Customer).filter(
        or_(
            RepairOrder.id == int(query_param) if query_param.isdigit() else False,
            Customer.dni == query_param
        )
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="No se encontró ninguna orden con ese DNI o número de orden"
        )
    
    return order

@router.get("/client/{order_id}", response_model=RepairOrderPublic)
def get_client_order_details(
    order_id: int,
    db: Session = Depends(get_db)
):
    """
    Endpoint público para obtener detalles completos de una orden.
    No requiere autenticación para permitir consultas de clientes.
    """
    from sqlalchemy.orm import joinedload
    
    order = db.query(RepairOrder).options(
        joinedload(RepairOrder.customer),
        joinedload(RepairOrder.status),
        joinedload(RepairOrder.technician),
        joinedload(RepairOrder.device_type),
        joinedload(RepairOrder.branch)
    ).filter(RepairOrder.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Orden no encontrada"
        )
    
    return order

@router.post("/{order_id}/subscribe")
def subscribe_to_order_notifications(
    order_id: int,
    email_data: dict,
    db: Session = Depends(get_db)
):
    """
    Endpoint para suscribirse a notificaciones de una orden.
    """
    order = db.query(RepairOrder).filter(RepairOrder.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Orden no encontrada"
        )
    
    email = email_data.get("email")
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email requerido"
        )
    # Persistir email de contacto en el cliente (opcional)
    if order.customer:
        order.customer.email = email
        db.commit()
    # Suscribir email a ESTA orden
    crud_email_subscription.subscribe(db, order_id=order_id, email=email)
    
    # Opcional: enviar confirmación de suscripción
    try:
        email_service = EmailTransactionalService()
        subject = f"Suscripción activada – Orden #{order.id}"
        html = (
            f"<h3>Suscripción activada</h3>"
            f"<p>Has activado las notificaciones por email para la orden <strong>#{order.id}</strong>.</p>"
            f"<p>Te enviaremos actualizaciones de estado, diagnóstico y fotos.</p>"
        )
        email_service.send_email(email, subject, html)
    except Exception:
        # No bloquear por errores de email
        pass

    return {"message": "Suscripción exitosa", "order_id": order_id, "email": email}

@router.post("/{order_id}/unsubscribe")
def unsubscribe_from_order_notifications(
    order_id: int,
    email_data: dict,
    db: Session = Depends(get_db)
):
    """
    Endpoint para desuscribirse de notificaciones de una orden.
    """
    order = db.query(RepairOrder).filter(RepairOrder.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Orden no encontrada"
        )
    
    email = email_data.get("email")
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email requerido"
        )
    crud_email_subscription.unsubscribe(db, order_id=order_id, email=email)

    return {"message": "Desuscripción exitosa", "order_id": order_id, "email": email}

@router.get("/{order_id}/subscription-status")
def get_subscription_status(
    order_id: int,
    email: str,
    db: Session = Depends(get_db)
):
    """Devuelve si ese email está suscrito activamente a la orden."""
    return {"order_id": order_id, "email": email, "is_subscribed": crud_email_subscription.is_subscribed(db, order_id, email)}

@router.get("/{order_id}/unsubscribe-email")
def unsubscribe_via_link(
    order_id: int,
    email: str,
    db: Session = Depends(get_db)
):
    """Permite desuscribirse mediante un enlace GET (usable desde correos)."""
    ok = crud_email_subscription.unsubscribe(db, order_id=order_id, email=email)
    if not ok:
        raise HTTPException(status_code=404, detail="No se encontró suscripción activa para esa orden y email")
    return {"message": "Has sido desuscrito de las notificaciones de esta orden.", "order_id": order_id, "email": email}

@router.get("/{order_id}/photos")
def get_order_photos(
    order_id: int,
    db: Session = Depends(get_db)
):
    """
    Endpoint público para obtener fotos de una orden.
    """
    from app.crud import crud_repair_order_photo
    
    order = db.query(RepairOrder).filter(RepairOrder.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Orden no encontrada"
        )
    
    # Obtener fotos reales de la base de datos
    photos = crud_repair_order_photo.get_repair_order_photos(db=db, order_id=order_id)
    return photos
