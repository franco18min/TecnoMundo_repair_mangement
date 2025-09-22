# backend/app/api/v1/endpoints/customers.py

from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.crud import crud_customer
from app.schemas import customer as schemas_customer
from app.api.v1.dependencies import get_db, get_current_admin_or_receptionist_user

router = APIRouter()

# --- ESTA ES LA FUNCIÓN QUE FALTA ---
@router.get("/", response_model=List[schemas_customer.Customer], dependencies=[Depends(get_current_admin_or_receptionist_user)])
def read_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Endpoint para obtener un listado de todos los clientes.
    Solo accesible para Administradores y Recepcionistas.
    """
    customers = crud_customer.get_customers(db, skip=skip, limit=limit)
    return customers
# --- FIN DE LA FUNCIÓN QUE FALTA ---

@router.put("/{customer_id}", response_model=schemas_customer.Customer, dependencies=[Depends(get_current_admin_or_receptionist_user)])
def update_customer_details(
    customer_id: int,
    customer: schemas_customer.CustomerUpdate,
    db: Session = Depends(get_db)
):
    """
    Endpoint para actualizar los datos de un cliente.
    Solo accesible para Administradores y Recepcionistas.
    """
    db_customer = crud_customer.update_customer(db, customer_id=customer_id, customer=customer)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_customer

@router.get("/search", response_model=List[schemas_customer.Customer])
def search_for_customers(
    q: str = Query(..., min_length=3, description="Término de búsqueda para clientes (nombre, apellido, DNI)"),
    db: Session = Depends(get_db)
):
    """
    Endpoint para buscar clientes existentes.
    """
    customers = crud_customer.search_customers(db, query=q)
    return customers