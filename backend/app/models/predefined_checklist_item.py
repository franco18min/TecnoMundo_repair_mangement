# backend/app/models/predefined_checklist_item.py

from sqlalchemy import Column, Integer, String, Boolean
from app.models.base_class import Base

class PredefinedChecklistItem(Base):
    __tablename__ = "predefined_checklist_item"
    __table_args__ = {'schema': 'customer'}
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    is_default_selected = Column(Boolean, default=False, nullable=False)