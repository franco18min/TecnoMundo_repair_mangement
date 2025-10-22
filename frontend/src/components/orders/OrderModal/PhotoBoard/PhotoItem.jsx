import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Pin } from './Pin.jsx';

export const PhotoItem = ({ photo, onSelect, onDelete, position, pinColor, canEdit }) => {
  const { photo: imageData, note, id } = photo;
  const [isMdUp, setIsMdUp] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => setIsMdUp(e.matches);
    mq.addEventListener('change', handler);
    setIsMdUp(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <motion.div
      className="relative md:absolute group cursor-pointer"
      style={isMdUp ? { top: position.top, left: position.left } : undefined}
      variants={{
        hidden: { opacity: 0, scale: 0.8, rotate: position.rotation + 10 },
        show: { opacity: 1, scale: 1, rotate: position.rotation }
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onClick={() => onSelect(photo)}
      whileHover={{ scale: 1.05, zIndex: 20, rotate: position.rotation - 2 }}
    >
      <div className="relative w-32 sm:w-36 md:w-44 lg:w-52 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200">
        <Pin color={pinColor} />

        {canEdit && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
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
            className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-md mb-2"
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

export default PhotoItem;