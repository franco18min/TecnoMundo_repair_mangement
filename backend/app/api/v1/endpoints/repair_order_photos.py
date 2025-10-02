# backend/app/api/v1/endpoints/repair_order_photos.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import base64
import io
from PIL import Image, ImageOps

from app.schemas import repair_order_photo as schemas_photo
from app.crud import crud_repair_order_photo, crud_repair_order
from app.models.user import User
from app.api.v1 import dependencies as deps

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
    file: UploadFile = File(...)
):
    """Endpoint de prueba para diagnosticar problemas de upload"""
    print(f"🔍 TEST: order_id={order_id}, note='{note}', file={file.filename}")
    print(f"🔍 TEST: content_type={file.content_type}, size={file.size}")
    return {"message": "Test successful", "order_id": order_id, "note": note, "filename": file.filename}

@router.post("/", response_model=schemas_photo.RepairOrderPhoto)
def create_repair_order_photo(
    order_id: int = Form(...),
    note: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Subir una nueva foto para una orden de reparación"""
    print(f"🔍 DEBUG: Iniciando upload - order_id={order_id}, note='{note}', file={file.filename}")
    print(f"🔍 DEBUG: file.content_type={file.content_type}, file.size={file.size}")
    
    # Verificar que la orden existe
    print(f"🔍 DEBUG: Verificando orden {order_id}...")
    order = crud_repair_order.get_repair_order(db, order_id)
    if not order:
        print(f"❌ DEBUG: Orden {order_id} no encontrada")
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    print(f"✅ DEBUG: Orden {order_id} encontrada")
    
    # Verificar que el archivo es una imagen
    print(f"🔍 DEBUG: Verificando content_type: {file.content_type}")
    if not file.content_type.startswith('image/'):
        print(f"❌ DEBUG: Content type inválido: {file.content_type}")
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
    
    # Verificar tamaño del archivo (máximo 25MB antes de procesar)
    print(f"🔍 DEBUG: Verificando tamaño: {file.size}")
    if file.size and file.size > 25 * 1024 * 1024:  # 25MB
        print(f"❌ DEBUG: Archivo muy grande: {file.size}")
        raise HTTPException(status_code=400, detail="El archivo es demasiado grande. Máximo 25MB permitido")
    
    try:
        print("🔍 DEBUG: Leyendo imagen...")
        # Leer la imagen original
        image_data = file.file.read()
        
        # Verificar que no esté vacía
        print(f"🔍 DEBUG: Datos leídos: {len(image_data)} bytes")
        if not image_data:
            print("❌ DEBUG: Archivo vacío")
            raise HTTPException(status_code=400, detail="El archivo está vacío")
        
        # Optimizar la imagen
        print("🔍 DEBUG: Optimizando imagen...")
        optimized_image_data = optimize_image(image_data)
        print(f"🔍 DEBUG: Imagen optimizada: {len(optimized_image_data)} bytes")
        
        # Verificar que la imagen optimizada no sea demasiado grande
        # Aproximadamente 500KB después de base64 (que aumenta ~33%)
        if len(optimized_image_data) > 375 * 1024:  # ~375KB en bytes
            print("🔍 DEBUG: Re-optimizando imagen...")
            # Si aún es muy grande, optimizar más agresivamente
            optimized_image_data = optimize_image(image_data, max_width=800, max_height=600, quality=75)
            print(f"🔍 DEBUG: Imagen re-optimizada: {len(optimized_image_data)} bytes")
        
        # Convertir a base64 para almacenar en la base de datos
        print("🔍 DEBUG: Convirtiendo a base64...")
        base64_image = base64.b64encode(optimized_image_data).decode('utf-8')
        print(f"🔍 DEBUG: Base64 generado: {len(base64_image)} caracteres")
        
        # Crear el objeto de foto
        print("🔍 DEBUG: Creando objeto RepairOrderPhotoCreate...")
        photo_data = schemas_photo.RepairOrderPhotoCreate(
            order_id=order_id,
            photo=f"data:image/jpeg;base64,{base64_image}",
            note=note or ""
        )
        print(f"🔍 DEBUG: Objeto creado - order_id={photo_data.order_id}, note='{photo_data.note}', photo_length={len(photo_data.photo)}")
        
        # Guardar en la base de datos
        print("🔍 DEBUG: Guardando en base de datos...")
        result = crud_repair_order_photo.create_repair_order_photo(db=db, photo=photo_data)
        print(f"✅ DEBUG: Foto guardada con ID: {result.id}")
        return result
        
    except HTTPException as he:
        print(f"❌ DEBUG: HTTPException - {he.status_code}: {he.detail}")
        raise
    except Exception as e:
        print(f"❌ DEBUG: Exception - {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
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