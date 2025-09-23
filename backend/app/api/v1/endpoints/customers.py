# backend/app/api/v1/endpoints/customers.py

from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.crud import crud_customer, crud_repair_order
from app.schemas import customer as schemas_customer
from app.schemas import repair_order as schemas_repair_order
from app.api.v1.dependencies import get_db, get_current_admin_or_receptionist_user

router = APIRouter()


@router.get("/", response_model=List[schemas_customer.Customer],
            dependencies=[Depends(get_current_admin_or_receptionist_user)])
def read_customers(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """
    Endpoint para obtener un listado de todos los clientes con su conteo de órdenes.
    """
    # 1. Obtenemos los datos brutos del CRUD: una lista de tuplas (CustomerModel, count)
    customers_with_count = crud_customer.get_customers(db, skip=skip, limit=limit)

    # 2. Aquí, en el endpoint, ensamblamos el objeto de respuesta final.
    response = []
    for customer_model, count in customers_with_count:
        # Convertimos el modelo SQLAlchemy a un objeto Pydantic
        customer_schema = schemas_customer.Customer.from_orm(customer_model)
        # Asignamos manualmente el conteo al campo correspondiente del esquema
        customer_schema.repair_orders_count = count
        response.append(customer_schema)

    return response


@router.post("/", response_model=schemas_customer.Customer,
             dependencies=[Depends(get_current_admin_or_receptionist_user)])
def create_new_customer(
        customer: schemas_customer.CustomerCreate,
        db: Session = Depends(get_db)
):
    """
    Endpoint para crear un nuevo cliente.
    Solo accesible para Administradores y Recepcionistas.
    """
    try:
        new_customer = crud_customer.create_customer(db, customer=customer)
        return new_customer
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"El DNI '{customer.dni}' ya se encuentra registrado."
        )


@router.put("/{customer_id}", response_model=schemas_customer.Customer,
            dependencies=[Depends(get_current_admin_or_receptionist_user)])
def update_customer_details(
        customer_id: int,
        customer: schemas_customer.CustomerUpdate,
        db: Session = Depends(get_db)
):
    """
    Endpoint para actualizar los datos de un cliente.
    """
    db_customer = crud_customer.update_customer(db, customer_id=customer_id, customer=customer)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_customer


@router.get("/{customer_id}/orders", response_model=List[schemas_repair_order.RepairOrder],
            dependencies=[Depends(get_current_admin_or_receptionist_user)])
def read_customer_orders(
        customer_id: int,
        db: Session = Depends(get_db)
):
    """
    Endpoint para obtener las órdenes de reparación de un cliente específico.
    """
    # Verificamos primero que el cliente exista para dar un error 404 claro
    db_customer = crud_customer.get_customer(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    orders = crud_repair_order.get_repair_orders_by_customer(db, customer_id=customer_id)
    return orders


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