import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { calculateMarkerSize } from '../utils/coordinateUtils.js';

/**
 * Componente individual de marcador
 */
const Marker = ({ 
  marker, 
  size, 
  onRemove, 
  isZoomed, 
  zoomLevel, 
  pan 
}) => {
  // Calcular posición ajustada por zoom y pan
  const getAdjustedPosition = () => {
    if (!isZoomed || zoomLevel <= 1) {
      return {
        left: `${marker.x}%`,
        top: `${marker.y}%`
      };
    }

    // Ajustar posición considerando zoom y pan
    const adjustedX = marker.x * zoomLevel + pan.x;
    const adjustedY = marker.y * zoomLevel + pan.y;

    return {
      left: `${adjustedX}%`,
      top: `${adjustedY}%`
    };
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={getAdjustedPosition()}
    >
      {/* Marcador principal */}
      <div
        className="relative flex items-center justify-center rounded-full shadow-lg cursor-pointer group"
        style={{
          width: size,
          height: size,
          backgroundColor: marker.color,
          border: '2px solid white'
        }}
      >
        <MapPin 
          size={size * 0.6} 
          className="text-white drop-shadow-sm" 
        />
        
        {/* Botón de eliminar (visible en hover) */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(marker.id);
            }}
            className="
              absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full
              flex items-center justify-center opacity-0 group-hover:opacity-100
              transition-opacity duration-200 hover:bg-red-600
            "
            title="Eliminar marcador"
            aria-label="Eliminar marcador"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Efecto de pulso para marcadores recién creados */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: marker.color,
          opacity: 0.3
        }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ 
          duration: 1, 
          repeat: marker.isNew ? 2 : 0,
          ease: "easeOut"
        }}
      />
    </motion.div>
  );
};

/**
 * Componente MarkersLayer para renderizar todos los marcadores
 * @param {Object} props - Props del componente
 * @param {Array} props.markers - Array de marcadores
 * @param {boolean} props.isZoomed - Si está en modo zoom
 * @param {number} props.zoomLevel - Nivel de zoom actual
 * @param {Object} props.pan - Objeto de desplazamiento {x, y}
 * @param {Function} props.onRemoveMarker - Callback para eliminar marcador
 * @param {boolean} props.showRemoveButtons - Si mostrar botones de eliminar
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente MarkersLayer
 */
const MarkersLayer = ({
  markers = [],
  isZoomed,
  zoomLevel,
  pan,
  onRemoveMarker,
  showRemoveButtons = true,
  className = ''
}) => {
  // Calcular tamaño de marcadores basado en zoom
  const markerSize = calculateMarkerSize(zoomLevel, isZoomed);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <AnimatePresence>
        {markers.map((marker) => (
          <div key={marker.id} className="pointer-events-auto">
            <Marker
              marker={marker}
              size={markerSize}
              onRemove={showRemoveButtons ? onRemoveMarker : null}
              isZoomed={isZoomed}
              zoomLevel={zoomLevel}
              pan={pan}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MarkersLayer;