import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

export const UploadControls = ({
  canEdit = false,
  isUploading = false,
  uploadError = '',
  onAddPhoto,
  fileInputRef,
  onFileSelect,
}) => {
  if (!canEdit) return null;

  return (
    <div className="flex flex-col items-end gap-2 relative z-10">
      <motion.button
        type="button"
        onClick={onAddPhoto}
        disabled={isUploading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shadow-md cursor-pointer ${
          isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
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

      {/* Input de archivo oculto */}
      <input
        id="photo-file-input"
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={onFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default UploadControls;