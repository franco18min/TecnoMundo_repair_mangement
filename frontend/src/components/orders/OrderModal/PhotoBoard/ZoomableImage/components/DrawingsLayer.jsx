import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { coordinatesToSVGPath, isValidDrawingForRender } from '../utils/drawingUtils.js';
import { calculateStrokeWidth } from '../utils/coordinateUtils.js';

/**
 * Componente individual de dibujo SVG
 */
const Drawing = ({ 
  drawing, 
  isZoomed, 
  zoomLevel, 
  pan, 
  onRemove 
}) => {
  // Validar si el dibujo es válido para renderizar
  if (!isValidDrawingForRender(drawing)) {
    return null;
  }

  // Calcular grosor de trazo ajustado por zoom
  const adjustedStrokeWidth = calculateStrokeWidth(
    drawing.strokeWidth, 
    zoomLevel, 
    isZoomed
  );

  // Convertir coordenadas a path SVG
  const pathData = coordinatesToSVGPath(drawing.path);

  // Calcular transformación para zoom y pan
  const getTransform = () => {
    if (!isZoomed || zoomLevel <= 1) {
      return '';
    }
    return `scale(${zoomLevel}) translate(${pan.x}%, ${pan.y}%)`;
  };

  return (
    <motion.g
      initial={{ opacity: 0, pathLength: 0 }}
      animate={{ opacity: 1, pathLength: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      transform={getTransform()}
      style={{ transformOrigin: 'center center' }}
    >
      {/* Path principal del dibujo */}
      <motion.path
        d={pathData}
        stroke={drawing.color}
        strokeWidth={adjustedStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      
      {/* Botón de eliminar (invisible, solo para interacción) */}
      {onRemove && (
        <circle
          cx={drawing.path[0]?.x || 0}
          cy={drawing.path[0]?.y || 0}
          r="8"
          fill="transparent"
          className="cursor-pointer hover:fill-red-200"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(drawing.id);
          }}
          title="Eliminar dibujo"
        />
      )}
    </motion.g>
  );
};

/**
 * Componente DrawingsLayer para renderizar todos los dibujos
 * @param {Object} props - Props del componente
 * @param {Array} props.drawings - Array de dibujos
 * @param {Object} props.currentDrawing - Dibujo actual en progreso
 * @param {boolean} props.isZoomed - Si está en modo zoom
 * @param {number} props.zoomLevel - Nivel de zoom actual
 * @param {Object} props.pan - Objeto de desplazamiento {x, y}
 * @param {Function} props.onRemoveDrawing - Callback para eliminar dibujo
 * @param {boolean} props.showRemoveButtons - Si mostrar botones de eliminar
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente DrawingsLayer
 */
const DrawingsLayer = ({
  drawings = [],
  currentDrawing = null,
  isZoomed,
  zoomLevel,
  pan,
  onRemoveDrawing,
  showRemoveButtons = true,
  className = ''
}) => {
  // Filtrar dibujos válidos
  const validDrawings = drawings.filter(isValidDrawingForRender);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg
        className="w-full h-full pointer-events-auto"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        <AnimatePresence>
          {/* Dibujos completados */}
          {validDrawings.map((drawing) => (
            <Drawing
              key={drawing.id}
              drawing={drawing}
              isZoomed={isZoomed}
              zoomLevel={zoomLevel}
              pan={pan}
              onRemove={showRemoveButtons ? onRemoveDrawing : null}
            />
          ))}

          {/* Dibujo actual en progreso */}
          {currentDrawing && isValidDrawingForRender(currentDrawing) && (
            <Drawing
              key="current-drawing"
              drawing={{
                ...currentDrawing,
                id: 'current'
              }}
              isZoomed={isZoomed}
              zoomLevel={zoomLevel}
              pan={pan}
              onRemove={null} // No permitir eliminar el dibujo actual
            />
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export default DrawingsLayer;