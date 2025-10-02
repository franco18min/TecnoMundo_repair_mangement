import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export const DeleteConfirmModal = ({ onCancel, onConfirm }) => {
  return (
    <motion.div 
      className="relative bg-white max-w-md w-full rounded-xl shadow-2xl p-6"
      initial={{ scale: 0.9, y: -20, opacity: 0 }} 
      animate={{ scale: 1, y: 0, opacity: 1 }} 
      exit={{ scale: 0.9, y: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Confirmar Eliminación
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          ¿Estás seguro de que quieres eliminar esta foto? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DeleteConfirmModal;