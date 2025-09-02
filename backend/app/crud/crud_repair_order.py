# backend/app/crud/crud_repair_order.py

from sqlalchemy.orm import Session, joinedload
from app.models.repair_order import RepairOrder as RepairOrderModel
from app.models.device_condition import DeviceCondition as DeviceConditionModel  # ¡Importante!
from app.schemas.repair_order import RepairOrderCreate
from app.crud import crud_customer


def get_repair_orders(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(RepairOrderModel)
        .options(
            joinedload(RepairOrderModel.customer),
            joinedload(RepairOrderModel.technician),
            joinedload(RepairOrderModel.status),
            joinedload(RepairOrderModel.device_type),
            joinedload(RepairOrderModel.device_conditions)  # Cargamos el checklist para futuras vistas
        )
        .order_by(RepairOrderModel.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_repair_order(db: Session, order: RepairOrderCreate, technician_id: int | None = None):
    """
    Crea una nueva orden de reparación y, si se proporcionan,
    crea los registros asociados del checklist de condiciones del dispositivo.
    """
    customer_id = order.customer_id

    if not customer_id and order.customer:
        db_customer = crud_customer.get_customer_by_dni(db, dni=order.customer.dni)
        if db_customer:
            customer_id = db_customer.id
        else:
            new_customer = crud_customer.create_customer(db, customer=order.customer)
            customer_id = new_customer.id

    if not customer_id:
        raise ValueError("Se requiere información del cliente para crear una orden.")

    status_id = 1
    if order.is_spare_part_ordered:
        status_id = 6  # Asumiendo que 6 es 'En Espera de Pieza'

    # Separamos los datos para que no haya conflictos al crear el modelo principal
    checklist_data = order.checklist
    # Excluimos los campos que no son columnas directas de la tabla RepairOrder
    order_data = order.dict(exclude={"checklist", "customer", "is_spare_part_ordered"})

    # Creamos el objeto de la orden principal
    db_order = RepairOrderModel(
        **order_data,
        customer_id=customer_id,
        technician_id=technician_id,
        status_id=status_id
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)  # Obtenemos el ID de la orden recién creada

    # --- LÓGICA PARA GUARDAR EL CHECKLIST ---
    # Si el frontend envió ítems en el checklist, los creamos uno por uno
    if checklist_data:
        for item_data in checklist_data:
            db_condition = DeviceConditionModel(
                check_description=item_data.check_description,
                client_answer=item_data.client_answer,
                order_id=db_order.id  # Vinculamos cada ítem con la orden
            )
            db.add(db_condition)
        db.commit()
        db.refresh(db_order)  # Refrescamos el objeto final para que incluya las condiciones

    return db_order