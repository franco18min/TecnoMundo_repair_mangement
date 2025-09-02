# backend/app/crud/crud_customer.py

from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.customer import Customer as CustomerModel
from app.schemas.customer import CustomerCreate # Asumiremos que este schema existe

def search_customers(db: Session, query: str):
    """
    Busca clientes por nombre, apellido o DNI.
    """
    search_term = f"%{query}%"
    return db.query(CustomerModel).filter(
        or_(
            CustomerModel.first_name.ilike(search_term),
            CustomerModel.last_name.ilike(search_term),
            CustomerModel.dni.ilike(search_term)
        )
    ).limit(10).all()

def get_customer_by_dni(db: Session, dni: str):
    """
    Obtiene un cliente por su DNI.
    """
    return db.query(CustomerModel).filter(CustomerModel.dni == dni).first()

def create_customer(db: Session, customer: CustomerCreate):
    """
    Crea un nuevo cliente.
    """
    db_customer = CustomerModel(
        first_name=customer.first_name,
        last_name=customer.last_name,
        phone_number=customer.phone_number,
        dni=customer.dni
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer