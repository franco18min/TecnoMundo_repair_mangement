import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut } from 'lucide-react';

export const ZoomableImage = ({ src, alt, className }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!isZoomed || !imageRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePosition({ x, y });

    const maxMoveX = (zoomLevel - 1) * 50;
    const maxMoveY = (zoomLevel - 1) * 50;

    const moveX = -maxMoveX * (x - 0.5) * 2;
    const moveY = -maxMoveY * (y - 0.5) * 2;

    setImagePosition({ x: moveX, y: moveY });
  }, [isZoomed, zoomLevel]);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setImagePosition({ x: 0, y: 0 });
    setZoomLevel(1);
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (!isZoomed) return;

    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoomLevel(prev => Math.max(1, Math.min(3, prev + delta)));
  }, [isZoomed]);

  const toggleZoom = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
      setZoomLevel(1.5);
    }
  };

  return (
    <div className="relative group">
      <div
        ref={containerRef}
        className={`relative overflow-hidden cursor-zoom-in ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <motion.img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-full h-full object-contain transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${isZoomed ? zoomLevel : 1}) translate(${imagePosition.x}%, ${imagePosition.y}%)`,
            transformOrigin: 'center center'
          }}
          drag={isZoomed && zoomLevel > 1.5}
          dragConstraints={containerRef}
          dragElastic={0.1}
        />

        <motion.div
          className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <ZoomIn size={16} />
              <span>Pasa el mouse para hacer zoom</span>
            </div>
            {isZoomed && (
              <div className="text-xs text-gray-500 mt-1 text-center">
                Rueda del mouse: +/- zoom • Arrastra para mover
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={toggleZoom}
        className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 w-8 h-8 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
      </motion.button>

      {isZoomed && zoomLevel > 1 && (
        <motion.div
          className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {Math.round(zoomLevel * 100)}%
        </motion.div>
      )}
    </div>
  );
};

export default ZoomableImage;