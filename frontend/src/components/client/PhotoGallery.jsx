import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import PhotoBoardClient from './PhotoBoardClient';

export function PhotoGallery({ photos = [] }) {

  if (!photos || photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="text-center">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Sin Documentación Visual</h3>
          <p className="text-gray-500">
            El técnico aún no ha subido fotos del proceso de reparación
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="w-8 h-8 text-white mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-white">Detalles de Reparación</h3>
              <p className="text-indigo-100 text-sm">
                {photos.length} {photos.length === 1 ? 'foto' : 'fotos'} disponibles
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-100">Documentación</p>
            <p className="text-lg font-semibold text-white">Técnica</p>
          </div>
        </div>
      </div>

      {/* PhotoBoardClient - Reemplaza toda la lógica anterior */}
      <PhotoBoardClient photos={photos} />
    </motion.div>
  );
}

export default PhotoGallery;