// frontend/src/components/ConfirmationModal.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default" // "default" | "delete"
}) {
  // Configuración específica para cada variante
  const isDeleteVariant = variant === "delete";
  
  // Configuración visual según variante
  const iconConfig = isDeleteVariant 
    ? { 
        icon: Trash2, 
        bgColor: "bg-red-100", 
        iconColor: "text-red-600" 
      }
    : { 
        icon: AlertTriangle, 
        bgColor: "bg-yellow-100", 
        iconColor: "text-yellow-600" 
      };

  const buttonConfig = isDeleteVariant
    ? {
        confirmClass: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors",
        cancelClass: "px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
      }
    : {
        confirmClass: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm",
        cancelClass: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
      };

  // Layout específico para delete variant (centrado como DeleteConfirmModal)
  if (isDeleteVariant) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
          <motion.div 
            className="relative bg-white max-w-md w-full rounded-xl shadow-2xl p-6"
            initial={{ scale: 0.9, y: -20, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconConfig.bgColor} mb-4`}>
                <iconConfig.icon className={`h-6 w-6 ${iconConfig.iconColor}`} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {message}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className={buttonConfig.cancelClass}
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className={buttonConfig.confirmClass}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Layout original para variant="default"
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-sm"
          initial={{ scale: 0.9, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconConfig.bgColor} sm:mx-0`}>
                <iconConfig.icon className={`h-6 w-6 ${iconConfig.iconColor}`} aria-hidden="true" />
              </div>
              <div className="text-left">
                <h3 className="text-lg leading-6 font-bold text-gray-900">{title}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse rounded-b-xl">
            <motion.button
              type="button"
              onClick={onConfirm}
              className={buttonConfig.confirmClass}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {confirmText}
            </motion.button>
            <motion.button
              type="button"
              onClick={onClose}
              className={buttonConfig.cancelClass}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cancelText}
            </motion.button>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}