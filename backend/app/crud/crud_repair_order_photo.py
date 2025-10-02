# backend/app/crud/crud_repair_order_photo.py

from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.repair_order_photo import RepairOrderPhoto as RepairOrderPhotoModel
from app.schemas.repair_order_photo import RepairOrderPhotoCreate, RepairOrderPhotoUpdate


def create_repair_order_photo(db: Session, photo: RepairOrderPhotoCreate) -> RepairOrderPhotoModel:
    """Crear una nueva foto para una orden de reparación"""
    db_photo = RepairOrderPhotoModel(
        order_id=photo.order_id,
        photo=photo.photo,
        note=photo.note
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo


def get_repair_order_photos(db: Session, order_id: int) -> List[RepairOrderPhotoModel]:
    """Obtener todas las fotos de una orden de reparación"""
    return db.query(RepairOrderPhotoModel).filter(
        RepairOrderPhotoModel.order_id == order_id
    ).order_by(RepairOrderPhotoModel.created_at.desc()).all()


def get_repair_order_photo(db: Session, photo_id: int) -> Optional[RepairOrderPhotoModel]:
    """Obtener una foto específica por ID"""
    return db.query(RepairOrderPhotoModel).filter(
        RepairOrderPhotoModel.id == photo_id
    ).first()


def update_repair_order_photo(db: Session, photo_id: int, photo_update: RepairOrderPhotoUpdate) -> Optional[RepairOrderPhotoModel]:
    """Actualizar la nota de una foto"""
    db_photo = get_repair_order_photo(db, photo_id)
    if db_photo:
        if photo_update.note is not None:
            db_photo.note = photo_update.note
        db.commit()
        db.refresh(db_photo)
    return db_photo


def delete_repair_order_photo(db: Session, photo_id: int) -> bool:
    """Eliminar una foto"""
    db_photo = get_repair_order_photo(db, photo_id)
    if db_photo:
        db.delete(db_photo)
        db.commit()
        return True
    return False