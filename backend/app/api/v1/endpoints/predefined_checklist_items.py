# backend/app/api/v1/endpoints/predefined_checklist_items.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.v1.dependencies import get_db, get_current_user
from app.schemas.predefined_checklist_item import (
    PredefinedChecklistItem,
    PredefinedChecklistItemCreate,
    PredefinedChecklistItemUpdate
)
from app.crud import crud_predefined_checklist_item
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[PredefinedChecklistItem])
def get_predefined_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener todas las preguntas predefinidas"""
    return crud_predefined_checklist_item.get_predefined_questions(db)

@router.get("/default", response_model=List[PredefinedChecklistItem])
def get_default_selected_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener preguntas que están marcadas como seleccionadas por defecto"""
    return crud_predefined_checklist_item.get_default_selected_questions(db)

@router.post("/", response_model=PredefinedChecklistItem)
def create_predefined_question(
    question: PredefinedChecklistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear una nueva pregunta predefinida (solo administradores)"""
    if current_user.role.role_name != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden crear preguntas predefinidas"
        )
    
    try:
        return crud_predefined_checklist_item.create_predefined_question(db, question)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{question_id}", response_model=PredefinedChecklistItem)
def update_predefined_question(
    question_id: int,
    question_update: PredefinedChecklistItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar una pregunta predefinida (solo administradores)"""
    if current_user.role.role_name != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden actualizar preguntas predefinidas"
        )
    
    try:
        db_question = crud_predefined_checklist_item.update_predefined_question(
            db, question_id, question_update
        )
        if not db_question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pregunta no encontrada"
            )
        return db_question
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{question_id}")
def delete_predefined_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar una pregunta predefinida (solo administradores)"""
    if current_user.role.role_name != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden eliminar preguntas predefinidas"
        )
    
    success = crud_predefined_checklist_item.delete_predefined_question(db, question_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pregunta no encontrada"
        )
    
    return {"message": "Pregunta eliminada exitosamente"}

@router.put("/default-selection", response_model=List[PredefinedChecklistItem])
def update_default_selection(
    question_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar qué preguntas están seleccionadas por defecto (solo administradores)"""
    if current_user.role.role_name != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden configurar preguntas por defecto"
        )
    
    return crud_predefined_checklist_item.bulk_update_default_selection(db, question_ids)