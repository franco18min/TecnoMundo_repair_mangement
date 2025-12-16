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
    
    # Convertir strings vacíos a None
    if 'dni' in update_data and update_data['dni'] is not None and not update_data['dni'].strip():
        update_data['dni'] = None
    if 'phone_number' in update_data and update_data['phone_number'] is not None and not update_data['phone_number'].strip():
        update_data['phone_number'] = None
        
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


def get_customer_by_phone(db: Session, phone_number: str):
    """
    Obtiene un cliente por su número de teléfono.
    """
    return db.query(CustomerModel).filter(CustomerModel.phone_number == phone_number).first()

def create_customer(db: Session, customer: CustomerCreate):
    """
    Crea un nuevo cliente.
    """
    # Convertir strings vacíos a None para campos opcionales únicos
    dni = customer.dni if customer.dni and customer.dni.strip() else None
    phone_number = customer.phone_number if customer.phone_number and customer.phone_number.strip() else None
    
    # Validar duplicados antes de insertar
    if dni:
        existing_dni = get_customer_by_dni(db, dni)
        if existing_dni:
            raise ValueError(f"Ya existe un cliente con el DNI {dni}")
            
    if phone_number:
        existing_phone = get_customer_by_phone(db, phone_number)
        if existing_phone:
            raise ValueError(f"Ya existe un cliente con el teléfono {phone_number}")
    
    db_customer = CustomerModel(
        first_name=customer.first_name,
        last_name=customer.last_name,
        phone_number=phone_number,
        dni=dni,
        email=customer.email,
        is_subscribed=customer.is_subscribed
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer