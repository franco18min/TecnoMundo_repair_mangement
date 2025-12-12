# backend/app/crud/crud_customer.py

from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.customer import Customer as CustomerModel
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.models.repair_order import RepairOrder as RepairOrderModel


def get_customer(db: Session, customer_id: int):
    """
    Obtiene un cliente por su ID.
    """
    return db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()


def get_customers(db: Session, skip: int = 0, limit: int = 100):
    """
    Obtiene un listado de todos los clientes junto con el conteo de sus órdenes
    de reparación en una única y eficiente consulta.
    """
    return (
        db.query(
            CustomerModel,
            func.count(RepairOrderModel.id).label("orders_count")
        )
        .outerjoin(RepairOrderModel, CustomerModel.id == RepairOrderModel.customer_id)
        .group_by(CustomerModel.id)
        .order_by(CustomerModel.last_name)
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_customer(db: Session, customer_id: int, customer: CustomerUpdate):
    """
    Actualiza los datos de un cliente existente.
    """
    db_customer = get_customer(db, customer_id=customer_id)
    if not db_customer:
        return None

    update_data = customer.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)

    db.commit()
    db.refresh(db_customer)
    return db_customer


def search_customers(db: Session, query: str):
    """
    Busca clientes por nombre, apellido, DNI o teléfono.
    """
    search_term = f"%{query}%"
    return db.query(CustomerModel).filter(
        or_(
            CustomerModel.first_name.ilike(search_term),
            CustomerModel.last_name.ilike(search_term),
            CustomerModel.dni.ilike(search_term),
            CustomerModel.phone_number.ilike(search_term)
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