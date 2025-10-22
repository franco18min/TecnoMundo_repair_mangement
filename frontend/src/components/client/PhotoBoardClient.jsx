import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, ZoomIn } from 'lucide-react';
import { PhotoModalClient } from './PhotoModalClient.jsx';

// Componente Pin replicado del OrderModal
const Pin = ({ color }) => (
  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
    <div className={`w-4 h-4 rounded-full shadow-md ${color} border-2 border-white`} />
  </div>
);

// Componente PhotoItem para cliente (solo visualización)
const PhotoItemClient = ({ photo, onSelect, position, pinColor }) => {
  const { photo: imageData, note, id } = photo;

  return (
    <motion.div
      className="absolute group cursor-pointer"
      style={{ top: position.top, left: position.left, touchAction: 'manipulation' }}
      variants={{
        hidden: { opacity: 0, scale: 0.8, rotate: position.rotation + 10 },
        show: { opacity: 1, scale: 1, rotate: position.rotation }
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onClick={() => onSelect(photo)}
      whileHover={{ scale: 1.05, zIndex: 20, rotate: position.rotation - 2 }}
    >
      <div className="relative w-24 sm:w-28 md:w-40 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200">
        <Pin color={pinColor} />

        <div className="p-1 sm:p-2">
          <img
            src={imageData}
            alt={note || 'Foto de diagnóstico'}
            className="w-full h-20 sm:h-24 md:h-28 object-cover rounded-md mb-1 sm:mb-2"
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 160px"
            style={{ contentVisibility: 'auto' }}
          />
          <p className="text-[11px] sm:text-xs text-gray-700 font-sans leading-tight px-1 h-8 sm:h-10 overflow-hidden">
            {note || 'Sin nota'}
          </p>
        </div>

        {/* Indicador de zoom para cliente */}
        <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={12} />
        </div>
      </div>
    </motion.div>
  );
};

// Componente PhotoGrid para cliente
const PhotoGridClient = ({ photos = [], onSelect }) => {
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
            <div className="text-xs mt-2 space-y-1">
              <p>El técnico subirá fotos durante el proceso de reparación</p>
              <p className="text-slate-400">Las fotos aparecerán aquí automáticamente</p>
            </div>
          </div>
        </div>
      ) : (
        photos.map((photo) => (
          <PhotoItemClient
            key={photo.id}
            photo={photo}
            onSelect={onSelect}
            position={photo.position}
            pinColor={photo.pinColor}
          />
        ))
      )}
    </motion.div>
  );
};

export function PhotoBoardClient({ photos = [] }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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
    return photoList.map((photo, index) => ({
      ...photo,
      position: positions[index % positions.length],
      pinColor: pinColors[index % pinColors.length],
    }));
  }, [photos]);

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  return (
    <div className="relative w-full h-[60vh] md:h-[60vh] bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner rounded-lg border-2 border-slate-300 overflow-hidden p-1 sm:p-2 md:p-4">
      {/* Patrón de fondo igual al OrderModal */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-2 md:mb-4">
        <motion.h4 
          className="text-base md:text-lg font-semibold text-slate-700 tracking-wide"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Fotos de Diagnóstico
        </motion.h4>
        
        {/* Información para el cliente */}
        <div className="text-right">
          <p className="text-xs md:text-sm text-slate-600">
            {photos.length} {photos.length === 1 ? 'foto' : 'fotos'} disponibles
          </p>
          <p className="text-[11px] md:text-xs text-slate-500">Haz clic para ver en detalle</p>
        </div>
      </div>

      <PhotoGridClient 
        photos={memoizedPhotos}
        onSelect={setSelectedPhoto}
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
            <PhotoModalClient
              selectedPhoto={selectedPhoto}
              onClose={handleCloseModal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PhotoBoardClient;