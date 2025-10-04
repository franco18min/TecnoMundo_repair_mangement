import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Trash2, Edit3, Save, RotateCcw, ZoomIn, Download, Plus } from 'lucide-react';
import { PhotoModal } from './PhotoModal.jsx';
import { ConfirmationModal } from '../../../shared/ConfirmationModal';
import { PhotoGrid } from './PhotoGrid.jsx';
import { UploadControls } from './UploadControls.jsx';
import { uploadRepairOrderPhoto, updateRepairOrderPhoto, deleteRepairOrderPhoto, updatePhotoAnnotations } from '../../../../api/repairOrderPhotosApi.js';
import { useToast } from '../../../../context/ToastContext';

export function PhotoBoard({ photos = [], onAddPhoto, onDeletePhoto, onUpdatePhoto, onUpdatePhotoAnnotations, canEdit = false }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editingNote, setEditingNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, photoId: null });
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const memoizedPhotos = useMemo(() => {
    const pinColors = ['bg-indigo-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500', 'bg-sky-500', 'bg-teal-500'];
    const positions = [
      { top: '15%', left: '5%', rotation: -4 },
      { top: '20%', left: '35%', rotation: 3 },
      { top: '12%', left: '60%', rotation: -2 },
      { top: '45%', left: '10%', rotation: 5 },
      { top: '50%', left: '45%', rotation: -3 },
      { top: '43%', left: '65%', rotation: 2 },
    ];

    const photoList = photos || [];
    if (pendingPhoto) {
      return [...photoList, pendingPhoto].map((photo, index) => ({
        ...photo,
        position: positions[index % positions.length],
        pinColor: pinColors[index % pinColors.length],
      }));
    }

    return photoList.map((photo, index) => ({
      ...photo,
      position: positions[index % positions.length],
      pinColor: pinColors[index % pinColors.length],
    }));
  }, [photos, pendingPhoto]);

  const handleCloseModal = () => {
    if (selectedPhoto?.isTemporary) {
      handleCancelPendingPhoto();
      return;
    }
    setSelectedPhoto(null);
    setIsEditingNote(false);
    setEditingNote('');
    
    // Resetear zoom al cerrar modal
    // Este evento se puede capturar en ZoomableImage si es necesario
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    setUploadError('');
    if (!file) return;

    const maxSize = 25 * 1024 * 1024; // 25MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
      event.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      setUploadError('El archivo es demasiado grande. Máximo 25MB permitido');
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const tempPhoto = {
          id: 'temp-' + Date.now(),
          photo: e.target.result,
          note: '',
          file: file,
          isTemporary: true,
        };

        setPendingPhoto(tempPhoto);
        setSelectedPhoto(tempPhoto);
        setIsEditingNote(true);
        setEditingNote('');
        setUploadError('');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError('Error al procesar la imagen');
      setIsUploading(false);
    }

    event.target.value = '';
  };

  const handleEditNote = () => {
    setEditingNote(selectedPhoto?.note || '');
    setIsEditingNote(true);
  };

  const handleSaveNote = async () => {
    if (!selectedPhoto) return;

    if (selectedPhoto.isTemporary && pendingPhoto) {
      await handleSavePendingPhoto();
      return;
    }

    if (onUpdatePhoto) {
      try {
        await onUpdatePhoto(selectedPhoto.id, editingNote);
        setSelectedPhoto(prev => ({ ...prev, note: editingNote }));
        setIsEditingNote(false);
      } catch (error) {
        console.error('Error al guardar nota:', error);
      }
    }
  };

  const handleSavePendingPhoto = async () => {
    if (!pendingPhoto || !onAddPhoto) return;
    setIsSaving(true);
    try {
      const newPhoto = await onAddPhoto(pendingPhoto.file, editingNote);
      setPendingPhoto(null);
      setSelectedPhoto(null);
      setIsEditingNote(false);
      setEditingNote('');
    } catch (error) {
      console.error('Error al guardar foto:', error);
      setUploadError(error.message || 'Error al guardar la foto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelPendingPhoto = () => {
    setPendingPhoto(null);
    setSelectedPhoto(null);
    setIsEditingNote(false);
    setEditingNote('');
    setUploadError('');
  };

  const handleDeletePhoto = (photoId) => {
    setDeleteConfirmModal({ isOpen: true, photoId });
  };

  const handleConfirmDelete = async () => {
    const { photoId } = deleteConfirmModal;
    if (!photoId || !onDeletePhoto) return;

    try {
      await onDeletePhoto(photoId);
      setDeleteConfirmModal({ isOpen: false, photoId: null });
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
        setIsEditingNote(false);
        setEditingNote('');
      }
    } catch (error) {
      console.error('Error al eliminar foto:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, photoId: null });
  };

  const handleSaveAnnotations = async (photoId, annotations) => {
    try {
      await updatePhotoAnnotations(photoId, annotations);
      
      // Actualizar el estado local inmediatamente después del guardado exitoso
      if (onUpdatePhotoAnnotations) {
        onUpdatePhotoAnnotations(photoId, annotations);
      }
      
      // También actualizar selectedPhoto si es la foto que se está editando
      if (selectedPhoto && selectedPhoto.id === photoId) {
        setSelectedPhoto(prev => ({
          ...prev,
          markers: annotations.markers || [],
          drawings: annotations.drawings || []
        }));
      }
      
      // Mostrar toast de éxito
      showToast('Anotaciones guardadas con éxito', 'success');
    } catch (error) {
      console.error('Error al guardar anotaciones:', error);
      showToast('Error al guardar las anotaciones', 'error');
      throw error;
    }
  };

  const handleAddPhoto = useCallback(() => {
    if (isUploading || !canEdit) return;
    setTimeout(() => {
      if (fileInputRef.current) {
        try { fileInputRef.current.click(); } catch (error) {
          console.error('Error al abrir selector de archivos:', error);
          const fileInput = document.getElementById('photo-file-input');
          if (fileInput) fileInput.click();
        }
      } else {
        const fileInput = document.getElementById('photo-file-input');
        if (fileInput) fileInput.click();
        else console.error('No se pudo encontrar el selector de archivos');
      }
    }, 100);
  }, [isUploading, canEdit]);

  return (
    <div className="relative w-full h-[60vh] bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner rounded-lg border-2 border-slate-300 overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-4">
        <motion.h4 
          className="text-lg font-semibold text-slate-700 tracking-wide"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Fotos de Diagnóstico
        </motion.h4>
        <UploadControls
          canEdit={canEdit}
          isUploading={isUploading}
          uploadError={uploadError}
          onAddPhoto={handleAddPhoto}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
        />
      </div>
      <PhotoGrid 
        photos={memoizedPhotos}
        canEdit={canEdit}
        onSelect={setSelectedPhoto}
        onDelete={handleDeletePhoto}
      />

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <PhotoModal
              selectedPhoto={selectedPhoto}
              canEdit={canEdit}
              isEditingNote={isEditingNote}
              editingNote={editingNote}
              isSaving={isSaving}
              onClose={handleCloseModal}
              onEditNote={handleEditNote}
              onSaveNote={handleSaveNote}
              onSaveAnnotations={handleSaveAnnotations}
              onCancelEdit={() => setIsEditingNote(false)}
              onCancelPending={handleCancelPendingPhoto}
              onEditingNoteChange={setEditingNote}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar Foto"
        message="¿Estás seguro de que quieres eliminar esta foto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="delete"
      />
    </div>
  );
}

export default PhotoBoard;