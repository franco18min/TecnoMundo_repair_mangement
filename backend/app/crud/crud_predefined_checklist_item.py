# backend/app/crud/crud_predefined_checklist_item.py

from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.predefined_checklist_item import PredefinedChecklistItem
from app.schemas.predefined_checklist_item import PredefinedChecklistItemCreate, PredefinedChecklistItemUpdate

def get_predefined_questions(db: Session) -> List[PredefinedChecklistItem]:
    """Obtener todas las preguntas predefinidas"""
    return db.query(PredefinedChecklistItem).order_by(PredefinedChecklistItem.id).all()

def get_default_selected_questions(db: Session) -> List[PredefinedChecklistItem]:
    """Obtener preguntas que están marcadas como seleccionadas por defecto"""
    return db.query(PredefinedChecklistItem).filter(
        PredefinedChecklistItem.is_default_selected == True
    ).order_by(PredefinedChecklistItem.id).all()

def get_predefined_question(db: Session, question_id: int) -> Optional[PredefinedChecklistItem]:
    """Obtener una pregunta predefinida por ID"""
    return db.query(PredefinedChecklistItem).filter(PredefinedChecklistItem.id == question_id).first()

def create_predefined_question(db: Session, question: PredefinedChecklistItemCreate) -> PredefinedChecklistItem:
    """Crear una nueva pregunta predefinida"""
    db_question = PredefinedChecklistItem(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def update_predefined_question(
    db: Session, 
    question_id: int, 
    question_update: PredefinedChecklistItemUpdate
) -> Optional[PredefinedChecklistItem]:
    """Actualizar una pregunta predefinida"""
    db_question = get_predefined_question(db, question_id)
    if not db_question:
        return None
    
    update_data = question_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_question, field, value)
    
    db.commit()
    db.refresh(db_question)
    return db_question

def delete_predefined_question(db: Session, question_id: int) -> bool:
    """Eliminar una pregunta predefinida"""
    db_question = get_predefined_question(db, question_id)
    if not db_question:
        return False
    
    db.delete(db_question)
    db.commit()
    return True

def bulk_update_default_selection(db: Session, question_ids: List[int]) -> List[PredefinedChecklistItem]:
    """Actualizar qué preguntas están seleccionadas por defecto"""
    # Primero, desmarcar todas las preguntas
    db.query(PredefinedChecklistItem).update({"is_default_selected": False})
    
    # Luego, marcar las preguntas especificadas
    if question_ids:
        db.query(PredefinedChecklistItem).filter(
            PredefinedChecklistItem.id.in_(question_ids)
        ).update({"is_default_selected": True})
    
    db.commit()
    return get_predefined_questions(db)