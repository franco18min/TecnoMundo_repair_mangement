from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base_class import Base

class TypeRecord(Base):
    __tablename__ = "type_record"
    __table_args__ = {'schema': 'system'}

    id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String, unique=True, nullable=False)

    records = relationship("Record", back_populates="type_record")
