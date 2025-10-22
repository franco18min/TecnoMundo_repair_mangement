import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Image } from 'lucide-react';

export const UploadControls = ({
  canEdit = false,
  isUploading = false,
  uploadError = '',
  onOpenCamera,
  onOpenGallery,
  cameraInputRef,
  galleryInputRef,
  onFileSelect,
}) => {
  if (!canEdit) return null;

  return (
    <div className="flex flex-col items-end gap-2 relative z-10">
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={onOpenCamera}
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
              <span className="text-sm font-medium">Tomar Foto</span>
            </>
          )}
        </motion.button>

        <motion.button
          type="button"
          onClick={onOpenGallery}
          disabled={isUploading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shadow-md cursor-pointer ${
            isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-600 hover:bg-slate-700'
          } text-white`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image size={16} />
          <span className="text-sm font-medium">Galería</span>
        </motion.button>
      </div>

      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-xs max-w-xs text-right bg-red-50 px-2 py-1 rounded border border-red-200"
        >
          {uploadError}
        </motion.div>
      )}

      {/* Inputs de archivo ocultos */}
      <input
        id="camera-file-input"
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <input
        id="gallery-file-input"
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default UploadControls;