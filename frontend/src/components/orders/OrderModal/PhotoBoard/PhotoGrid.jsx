import React from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { PhotoItem } from './PhotoItem.jsx';

export const PhotoGrid = ({ photos = [], canEdit = false, onSelect, onDelete }) => {
  return (
    <motion.div
      className="absolute inset-0 mt-12"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      initial="hidden"
      animate="show"
    >
      {photos.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-slate-500 max-w-sm">
            <Upload size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No hay fotos de diagnóstico</p>
            {canEdit && (
              <div className="text-xs mt-2 space-y-1">
                <p>Haz clic en "Agregar Foto" para subir una imagen</p>
                <p className="text-slate-400">• Formatos: JPEG, PNG, GIF, WebP<br/>• Máximo: 25MB<br/>• Las imágenes se optimizan automáticamente</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        photos.map((photo) => (
          <PhotoItem
            key={photo.id}
            photo={photo}
            onSelect={onSelect}
            onDelete={onDelete}
            position={photo.position}
            pinColor={photo.pinColor}
            canEdit={canEdit}
          />
        ))
      )}
    </motion.div>
  );
};

export default PhotoGrid;