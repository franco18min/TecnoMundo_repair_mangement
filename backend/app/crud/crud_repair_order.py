from sqlalchemy.orm import Session, joinedload
from app.models.repair_order import RepairOrder as RepairOrderModel
from app.models.customer import Customer as CustomerModel
from app.models.user import User as UserModel

def get_repair_orders(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(RepairOrderModel)
        .options(
            joinedload(RepairOrderModel.customer), # Carga el cliente relacionado
            joinedload(RepairOrderModel.technician) # Carga el técnico relacionado
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

# ... (la función create_repair_order también necesitará ajustes para usar los IDs)