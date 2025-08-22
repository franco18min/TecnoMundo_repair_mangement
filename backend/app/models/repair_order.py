from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class RepairOrder(Base):
    __tablename__ = "repair_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id_str = Column(String, unique=True, index=True, nullable=False)
    customer_name = Column(String, nullable=False)
    device_type = Column(String)
    device_model = Column(String)
    issue_description = Column(String)
    status = Column(String, default="Pendiente")
    technician_name = Column(String)
    technician_avatar_url = Column(String)
    date_received = Column(Date)