import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Trash2, Edit3 } from 'lucide-react';

// Componente para el pin
const Pin = ({ color }) => (
  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
    <div className={`w-4 h-4 rounded-full shadow-md ${color} border-2 border-white`} />
  </div>
);

// Componente para una sola Foto
const Photo = ({ photo, onSelect, onDelete, position, pinColor, canEdit }) => {
  const { photo: imageData, note, id } = photo;

  return (
    <motion.div
      className="absolute group cursor-pointer"
      style={{ top: position.top, left: position.left }}
      variants={{
        hidden: { opacity: 0, scale: 0.8, rotate: position.rotation + 10 },
        show: { opacity: 1, scale: 1, rotate: position.rotation }
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onClick={() => onSelect(photo)}
      whileHover={{ scale: 1.05, zIndex: 20, rotate: position.rotation - 2 }}
    >
      <div className="relative w-48 md:w-56 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200">
        <Pin color={pinColor} />
        
        {/* Botón de eliminar */}
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold shadow-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center z-20"
            aria-label="Eliminar foto"
          >
            <Trash2 size={12} />
          </button>
        )}
        
        <div className="p-2">
          <img
            src={imageData}
            alt={note || 'Foto de diagnóstico'}
            className="w-full h-32 object-cover rounded-md mb-2"
            loading="lazy"
          />
          <p className="text-xs text-gray-700 font-sans leading-tight px-1 h-10 overflow-hidden">
            {note || 'Sin nota'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Componente principal del PhotoBoard
export function PhotoBoard({ photos = [], onAddPhoto, onDeletePhoto, onUpdatePhoto, canEdit = false }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editingNote, setEditingNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const memoizedPhotos = useMemo(() => {
    const pinColors = ['bg-indigo-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500', 'bg-sky-500', 'bg-teal-500'];
    const positions = [
      { top: '25%', left: '5%', rotation: -4 },
      { top: '30%', left: '38%', rotation: 3 },
      { top: '22%', left: '65%', rotation: -2 },
      { top: '55%', left: '15%', rotation: 5 },
      { top: '60%', left: '55%', rotation: -3 },
      { top: '53%', left: '75%', rotation: 2 },
    ];

    return photos.map((photo, index) => ({
      ...photo,
      position: positions[index % positions.length],
      pinColor: pinColors[index % pinColors.length],
    }));
  }, [photos]);

  const handleCloseModal = () => {
    setSelectedPhoto(null);
    setIsEditingNote(false);
    setEditingNote('');
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    setUploadError('');
    
    if (!file) return;
    
    // Validaciones del archivo
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
    
    if (onAddPhoto) {
      setIsUploading(true);
      try {
        await onAddPhoto(file);
        setUploadError('');
      } catch (error) {
        setUploadError(error.message || 'Error al subir la foto');
      } finally {
        setIsUploading(false);
      }
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleEditNote = () => {
    setEditingNote(selectedPhoto?.note || '');
    setIsEditingNote(true);
  };

  const handleSaveNote = () => {
    if (selectedPhoto && onUpdatePhoto) {
      onUpdatePhoto(selectedPhoto.id, editingNote);
      setSelectedPhoto({ ...selectedPhoto, note: editingNote });
    }
    setIsEditingNote(false);
  };

  const handleAddPhoto = useCallback(() => {
    if (isUploading || !canEdit) return;
    
    setTimeout(() => {
      if (fileInputRef.current) {
        try {
          fileInputRef.current.click();
        } catch (error) {
          console.error('Error al abrir selector de archivos:', error);
          // Fallback usando getElementById
          const fileInput = document.getElementById('photo-file-input');
          if (fileInput) {
            fileInput.click();
          }
        }
      } else {
        // Fallback usando getElementById
        const fileInput = document.getElementById('photo-file-input');
        if (fileInput) {
          fileInput.click();
        } else {
          console.error('No se pudo encontrar el selector de archivos');
        }
      }
    }, 100);
  }, [isUploading, canEdit]);

  const handleDeletePhoto = (photoId) => {
    if (onDeletePhoto) {
      onDeletePhoto(photoId);
    }
  };

  return (
    <div className="relative w-full h-[40vh] bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner rounded-lg border-2 border-slate-300 overflow-hidden p-4">
      {/* Textura de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
      
      {/* Header con botón de agregar foto */}
      <div className="flex justify-between items-center mb-4">
        <motion.h4 
          className="text-lg font-semibold text-slate-700 tracking-wide"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Fotos de Diagnóstico
        </motion.h4>
        
        {canEdit && (
            <div className="flex flex-col items-end gap-2 relative z-10">
              <motion.button
               type="button"
               onClick={handleAddPhoto}
               disabled={isUploading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shadow-md cursor-pointer ${
                isUploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm font-medium">Subiendo...</span>
                </>
              ) : (
                <>
                  <Camera size={16} />
                  <span className="text-sm font-medium">Agregar Foto</span>
                </>
              )}
            </motion.button>
            
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-xs max-w-xs text-right bg-red-50 px-2 py-1 rounded border border-red-200"
              >
                {uploadError}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input de archivo oculto */}
      <input
        id="photo-file-input"
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Área de fotos */}
      <motion.div
        className="absolute inset-0 mt-16"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
      >
        {memoizedPhotos.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500 max-w-sm">
              <Upload size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No hay fotos de diagnóstico</p>
              {canEdit && (
                <div className="text-xs mt-2 space-y-1">
                  <p>Haz clic en "Agregar Foto" para subir una imagen</p>
                  <p className="text-slate-400">
                    • Formatos: JPEG, PNG, GIF, WebP<br/>
                    • Máximo: 25MB<br/>
                    • Las imágenes se optimizan automáticamente
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          memoizedPhotos.map((photo) => (
            <Photo
              key={photo.id}
              photo={photo}
              onSelect={setSelectedPhoto}
              onDelete={handleDeletePhoto}
              position={photo.position}
              pinColor={photo.pinColor}
              canEdit={canEdit}
            />
          ))
        )}
      </motion.div>

      {/* Modal para la vista expandida */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div 
              className="relative bg-white max-w-2xl w-full rounded-xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: -20, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.button 
                onClick={handleCloseModal}
                className="absolute -top-3 -right-3 bg-red-500 text-white w-9 h-9 rounded-full text-xl font-bold shadow-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center"
                aria-label="Cerrar"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
              
              <img 
                src={selectedPhoto.photo} 
                alt={selectedPhoto.note || 'Foto de diagnóstico'} 
                className="w-full h-64 object-contain rounded-lg mb-4 bg-gray-50" 
              />
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800 font-sans">Nota de la Foto:</h3>
                {canEdit && !isEditingNote && (
                  <button
                    onClick={handleEditNote}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Edit3 size={16} />
                    <span className="text-sm">Editar</span>
                  </button>
                )}
              </div>
              
              {isEditingNote ? (
                <div className="space-y-3">
                  <textarea
                    value={editingNote}
                    onChange={(e) => setEditingNote(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Agregar nota sobre esta foto..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNote}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setIsEditingNote(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 font-sans leading-relaxed bg-gray-50 p-3 rounded-lg">
                  {selectedPhoto.note || 'Sin nota'}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}