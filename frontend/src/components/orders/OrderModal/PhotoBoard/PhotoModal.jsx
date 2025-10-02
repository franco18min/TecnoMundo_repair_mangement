import React from 'react';
import { motion } from 'framer-motion';
import { X, Edit3 } from 'lucide-react';
import { ZoomableImage } from './ZoomableImage.jsx';

export const PhotoModal = ({
  selectedPhoto,
  canEdit,
  isEditingNote,
  editingNote,
  isSaving,
  onClose,
  onEditNote,
  onSaveNote,
  onCancelEdit,
  onCancelPending,
  onEditingNoteChange,
}) => {
  if (!selectedPhoto) return null;

  return (
    <motion.div
      className="relative bg-white max-w-2xl w-full rounded-xl shadow-2xl p-6"
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.9, y: -20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.9, y: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.button
        type="button"
        onClick={onClose}
        className="absolute -top-3 -right-3 bg-red-500 text-white w-9 h-9 rounded-full text-xl font-bold shadow-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center"
        aria-label="Cerrar"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <X size={20} />
      </motion.button>

      <ZoomableImage
        src={selectedPhoto.photo}
        alt={selectedPhoto.note || 'Foto de diagnóstico'}
        className="w-full h-64 rounded-lg mb-4 bg-gray-50"
      />

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-800 font-sans">Nota de la Foto:</h3>
        {canEdit && !isEditingNote && (
          <button
            type="button"
            onClick={onEditNote}
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
            onChange={(e) => onEditingNoteChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Agregar nota sobre esta foto..."
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSaveNote}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                selectedPhoto?.isTemporary ? 'Guardar Foto' : 'Guardar'
              )}
            </button>
            <button
              type="button"
              onClick={selectedPhoto?.isTemporary ? onCancelPending : onCancelEdit}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default PhotoModal;