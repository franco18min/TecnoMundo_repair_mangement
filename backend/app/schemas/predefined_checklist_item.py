# backend/app/schemas/predefined_checklist_item.py

from pydantic import BaseModel, validator
from typing import Optional
import re

class PredefinedChecklistItemBase(BaseModel):
    question: str
    is_default_selected: bool = False
    
    @validator('question')
    def validate_and_format_question(cls, v):
        if not v or not v.strip():
            raise ValueError('La pregunta no puede estar vacía')
        
        # Limpiar espacios al inicio y final
        v = v.strip()
        
        # Verificar que no tenga caracteres especiales problemáticos al inicio
        if v and not v[0].isalpha() and v[0] not in ['¿', '¡']:
            raise ValueError('La pregunta debe comenzar con una letra o signo de interrogación')
        
        # Formatear la pregunta
        # Si no empieza con ¿, agregarlo
        if not v.startswith('¿'):
            v = '¿' + v
        
        # Capitalizar primera letra después del ¿
        if len(v) > 1:
            v = v[0] + v[1].upper() + v[2:].lower()
        
        # Si no termina con ?, agregarlo
        if not v.endswith('?'):
            v = v + '?'
        
        return v

class PredefinedChecklistItemCreate(PredefinedChecklistItemBase):
    pass

class PredefinedChecklistItemUpdate(BaseModel):
    question: Optional[str] = None
    is_default_selected: Optional[bool] = None
    
    @validator('question')
    def validate_and_format_question(cls, v):
        if v is not None:
            return PredefinedChecklistItemBase.validate_and_format_question(v)
        return v

class PredefinedChecklistItem(PredefinedChecklistItemBase):
    id: int
    
    class Config:
        from_attributes = True