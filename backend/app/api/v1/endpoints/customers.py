# backend/app/api/v1/endpoints/customers.py

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud import crud_customer
from app.schemas import customer as schemas_customer
from app.db.session import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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