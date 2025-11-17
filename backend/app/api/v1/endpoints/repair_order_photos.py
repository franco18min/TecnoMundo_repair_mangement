# backend/app/api/v1/endpoints/repair_order_photos.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
import base64
import io
from PIL import Image, ImageOps

from app.schemas import repair_order_photo as schemas_photo
from app.crud import crud_repair_order_photo, crud_repair_order
from app.models.user import User
from app.api.v1 import dependencies as deps
from app.services.email_transaccional import EmailTransactionalService

router = APIRouter()

def optimize_image(image_data: bytes, max_width: int = 1200, max_height: int = 800, quality: int = 85) -> bytes:
    """
    Optimiza una imagen reduciendo su tamaño y compresión sin comprometer mucho la calidad
    """
    try:
        # Abrir la imagen desde bytes
        image = Image.open(io.BytesIO(image_data))
        
        # Corregir orientación basada en EXIF
        image = ImageOps.exif_transpose(image)
        
        # Convertir a RGB si es necesario (para JPEG)
        if image.mode in ('RGBA', 'P'):
            # Crear fondo blanco para transparencias
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Redimensionar si es necesario manteniendo la proporción
        original_width, original_height = image.size
        if original_width > max_width or original_height > max_height:
            # Calcular nueva dimensión manteniendo proporción
            ratio = min(max_width / original_width, max_height / original_height)
            new_width = int(original_width * ratio)
            new_height = int(original_height * ratio)
            
            # Usar LANCZOS para mejor calidad en redimensionamiento
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Guardar la imagen optimizada
        output_buffer = io.BytesIO()
        image.save(output_buffer, format='JPEG', quality=quality, optimize=True)
        
        return output_buffer.getvalue()
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al procesar la imagen: {str(e)}")


@router.post("/test")
def test_upload(
    order_id: int = Form(...),
    note: str = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_admin)
):
    """Endpoint de prueba para diagnosticar problemas de upload"""
    return {"message": "Test successful", "order_id": order_id, "note": note, "filename": file.filename}

@router.post("/", response_model=schemas_photo.RepairOrderPhoto)
def create_repair_order_photo(
    order_id: int = Form(...),
    note: str = Form(None),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Subir una nueva foto para una orden de reparación"""
    
    # Verificar que la orden existe
    order = crud_repair_order.get_repair_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Verificar que el archivo es una imagen
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
    
    # Verificar tamaño del archivo (máximo 25MB antes de procesar)
    if file.size and file.size > 25 * 1024 * 1024:  # 25MB
        raise HTTPException(status_code=400, detail="El archivo es demasiado grande. Máximo 25MB permitido")
    
    try:
        # Leer la imagen original
        image_data = file.file.read()
        
        # Verificar que no esté vacía
        if not image_data:
            raise HTTPException(status_code=400, detail="El archivo está vacío")
        
        # Optimizar la imagen
        optimized_image_data = optimize_image(image_data)
        
        # Verificar que la imagen optimizada no sea demasiado grande
        # Aproximadamente 500KB después de base64 (que aumenta ~33%)
        if len(optimized_image_data) > 375 * 1024:  # ~375KB en bytes
            # Si aún es muy grande, optimizar más agresivamente
            optimized_image_data = optimize_image(image_data, max_width=800, max_height=600, quality=75)
        
        # Convertir a base64 para almacenar en la base de datos
        base64_image = base64.b64encode(optimized_image_data).decode('utf-8')
        
        # Crear el objeto de foto
        photo_data = schemas_photo.RepairOrderPhotoCreate(
            order_id=order_id,
            photo=f"data:image/jpeg;base64,{base64_image}",
            note=note or ""
        )
        
        # Guardar en la base de datos
        result = crud_repair_order_photo.create_repair_order_photo(db=db, photo=photo_data)
        # Enviar correo al cliente si está suscrito
        try:
            email_service = EmailTransactionalService()
            if background_tasks:
                background_tasks.add_task(email_service.notify_photo_uploaded, order_id=order_id)
            else:
                email_service.notify_photo_uploaded(order_id)
        except Exception:
            pass
        return result
        
    except HTTPException as he:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"Error al procesar la imagen: {str(e)}")


@router.get("/order/{order_id}", response_model=List[schemas_photo.RepairOrderPhoto])
def get_repair_order_photos(
    order_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Obtener todas las fotos de una orden de reparación"""
    # Verificar que la orden existe
    order = crud_repair_order.get_repair_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    return crud_repair_order_photo.get_repair_order_photos(db=db, order_id=order_id)


@router.put("/{photo_id}", response_model=schemas_photo.RepairOrderPhoto)
def update_repair_order_photo(
    photo_id: int,
    photo_update: schemas_photo.RepairOrderPhotoUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Actualizar la nota de una foto"""
    photo = crud_repair_order_photo.update_repair_order_photo(
        db=db, photo_id=photo_id, photo_update=photo_update
    )
    if not photo:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    return photo


@router.patch("/{photo_id}/annotations", response_model=schemas_photo.RepairOrderPhoto)
def update_photo_annotations(
    photo_id: int,
    annotations: schemas_photo.RepairOrderPhotoUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Actualizar marcadores y dibujos de una foto"""
    photo = crud_repair_order_photo.update_repair_order_photo(
        db=db, photo_id=photo_id, photo_update=annotations
    )
    if not photo:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    return photo


@router.delete("/{photo_id}")
def delete_repair_order_photo(
    photo_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Eliminar una foto"""
    success = crud_repair_order_photo.delete_repair_order_photo(db=db, photo_id=photo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    return {"message": "Foto eliminada exitosamente"}
