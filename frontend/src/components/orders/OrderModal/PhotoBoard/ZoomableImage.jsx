import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, MapPin, Palette, Pencil, Save, Trash2 } from 'lucide-react';

export const ZoomableImage = ({ src, alt, className, markers = [], onAddMarker, onClearMarkers, canEdit = false }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  // Pan manual con click+arrastre
  const [isDragging, setIsDragging] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // porcentaje relativo al contenedor
  const dragStartRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  
  // Estados para marcadores
  const [isMarkerMode, setIsMarkerMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Estados para dibujo libre
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [drawings, setDrawings] = useState([]);
  
  // Colores predefinidos (más opciones)
  const availableColors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#000000', '#ffffff', '#808080', '#ff69b4',
    '#32cd32', '#87ceeb', '#dda0dd', '#f0e68c'
  ];

  const onMouseDown = useCallback((e) => {
    // Si estamos en modo marcador, colocar marcador
    if (isMarkerMode && canEdit) {
      const rect = containerRef.current?.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Convertir a coordenadas de la imagen original (sin zoom ni pan)
      const originalX = (clickX - (pan.x * rect.width / 100)) / zoomLevel;
      const originalY = (clickY - (pan.y * rect.height / 100)) / zoomLevel;
      
      // Convertir a porcentajes de la imagen original
      const x = (originalX / rect.width) * 100;
      const y = (originalY / rect.height) * 100;
      
      if (onAddMarker) {
        const newMarker = {
          x,
          y,
          color: selectedColor,
          id: `marker-${Date.now()}-${Math.random()}`,
          originalX: x,
          originalY: y,
          zoomLevel: zoomLevel,
        };
        onAddMarker(newMarker);
      }
      return;
    }

    if (isDrawMode && canEdit) {
      // Iniciar dibujo libre
      const rect = containerRef.current?.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Convertir a coordenadas relativas de la imagen original
      const originalX = (clickX - (pan.x * rect.width / 100)) / zoomLevel;
      const originalY = (clickY - (pan.y * rect.height / 100)) / zoomLevel;
      
      setIsDrawing(true);
      setCurrentPath([{ x: originalX, y: originalY }]);
      return;
    }
    
    if (!isZoomed) return;
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panStart: { ...pan },
      rect,
    };
  }, [isZoomed, pan, isMarkerMode, canEdit, selectedColor, onAddMarker, zoomLevel, isDrawMode]);

  const onMouseMove = useCallback((e) => {
    if (isDrawing && isDrawMode && canEdit) {
      // Continuar dibujo libre
      const rect = containerRef.current?.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Convertir a coordenadas relativas de la imagen original
      const originalX = (clickX - (pan.x * rect.width / 100)) / zoomLevel;
      const originalY = (clickY - (pan.y * rect.height / 100)) / zoomLevel;
      
      setCurrentPath(prev => [...prev, { x: originalX, y: originalY }]);
      return;
    }

    if (!isDragging || !dragStartRef.current) return;
    const { startX, startY, panStart, rect } = dragStartRef.current;
    if (!rect) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Convertir deltas a porcentaje del contenedor
    const moveXPercent = (deltaX / rect.width) * 100;
    const moveYPercent = (deltaY / rect.height) * 100;

    // Límite de movimiento según nivel de zoom (aprox.)
    const maxMove = (zoomLevel - 1) * 30; // a 8x => 210%

    const nextX = Math.max(-maxMove, Math.min(maxMove, panStart.x + moveXPercent));
    const nextY = Math.max(-maxMove, Math.min(maxMove, panStart.y + moveYPercent));

    setPan({ x: nextX, y: nextY });
  }, [isDragging, zoomLevel, isDrawing, isDrawMode, canEdit, pan]);

  const onMouseUpOrLeave = useCallback(() => {
    if (isDrawing && isDrawMode && currentPath.length > 1) {
      // Finalizar dibujo y agregarlo a la lista
      const newDrawing = {
        id: `drawing-${Date.now()}-${Math.random()}`,
        path: currentPath,
        color: selectedColor,
        strokeWidth: 2,
      };
      setDrawings(prev => [...prev, newDrawing]);
      setCurrentPath([]);
    }
    
    setIsDrawing(false);
    if (isDragging) setIsDragging(false);
  }, [isDragging, isDrawing, isDrawMode, currentPath, selectedColor]);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Escucha manual del evento 'wheel' con passive: false para permitir preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheelHandler = (e) => {
      if (!isZoomed) return;
      // Evita el scroll por defecto mientras hacemos zoom manual
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.3 : 0.3;
      setZoomLevel(prev => Math.max(1, Math.min(8, prev + delta)));
    };

    el.addEventListener('wheel', onWheelHandler, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheelHandler);
    };
  }, [isZoomed]);

  // Controles explícitos de zoom
  const handleZoomIn = useCallback(() => {
    setIsZoomed(true);
    setZoomLevel(prev => Math.min(8, prev + 0.3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const next = Math.max(1, prev - 0.3);
      if (next === 1) {
        setIsZoomed(false);
        setPan({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

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
        className={`relative overflow-hidden ${isZoomed ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'} touch-none overscroll-contain select-none ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
      >
        <motion.img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-full h-full object-contain transition-transform duration-100 ease-out"
          style={{
            transformOrigin: 'center center',
            transform: `scale(${isZoomed ? zoomLevel : 1}) translate(${pan.x}%, ${pan.y}%)`,
          }}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* SVG para dibujos libres */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          style={{
            transform: `scale(${isZoomed ? zoomLevel : 1}) translate(${pan.x}%, ${pan.y}%)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Dibujos completados */}
          {drawings.map((drawing) => (
            <path
              key={drawing.id}
              d={`M ${drawing.path.map(point => `${point.x},${point.y}`).join(' L ')}`}
              stroke={drawing.color}
              strokeWidth={drawing.strokeWidth / zoomLevel}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          
          {/* Dibujo actual en progreso */}
          {isDrawing && currentPath.length > 1 && (
            <path
              d={`M ${currentPath.map(point => `${point.x},${point.y}`).join(' L ')}`}
              stroke={selectedColor}
              strokeWidth={2 / zoomLevel}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Marcadores */}
        {markers.map((marker) => {
          // Calcular la posición del marcador considerando zoom y pan
          const markerX = (marker.originalX || marker.x) * zoomLevel + pan.x;
          const markerY = (marker.originalY || marker.y) * zoomLevel + pan.y;
          
          return (
            <motion.div
              key={marker.id}
              className="absolute pointer-events-none z-30"
              style={{
                left: `${markerX}%`,
                top: `${markerY}%`,
                transform: `translate(-50%, -50%)`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <MapPin
                size={Math.max(16, 20 / zoomLevel)}
                style={{ color: marker.color }}
                className="drop-shadow-lg"
              />
            </motion.div>
          );
        })}

        <motion.div
          className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <ZoomIn size={16} />
              <span>Pasa el mouse para hacer zoom (hasta 800%)</span>
            </div>
            {isZoomed && (
              <div className="text-xs text-gray-500 mt-1 text-center">
                Rueda del mouse: +/- zoom • Clic y arrastra para mover
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Controles de Zoom y Marcadores */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Controles de Zoom */}
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={handleZoomIn}
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 w-8 h-8 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Acercar"
          >
            <ZoomIn size={16} />
          </motion.button>
          <motion.button
            type="button"
            onClick={handleZoomOut}
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 w-8 h-8 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Alejar"
          >
            <ZoomOut size={16} />
          </motion.button>
        </div>

        {/* Controles de Marcadores y Dibujo (solo para técnicos) */}
        {canEdit && (
          <div className="flex flex-col gap-2">
            {/* Primera fila: Marcador y Lápiz */}
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={() => {
                  setIsMarkerMode(!isMarkerMode);
                  if (!isMarkerMode) setIsDrawMode(false); // Desactivar dibujo
                }}
                className={`w-8 h-8 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
                  isMarkerMode 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Modo Marcador"
              >
                <MapPin size={16} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => {
                  setIsDrawMode(!isDrawMode);
                  if (!isDrawMode) setIsMarkerMode(false); // Desactivar marcador
                }}
                className={`w-8 h-8 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
                  isDrawMode 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Modo Lápiz"
              >
                <Pencil size={16} />
              </motion.button>
            </div>
            
            {/* Segunda fila: Paleta, Guardar y Limpiar */}
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 w-8 h-8 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Selector de Color"
              >
                <Palette size={16} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => {
                  // TODO: Implementar guardar
                  console.log('Guardar marcadores y dibujos');
                }}
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 w-8 h-8 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Guardar Cambios"
              >
                <Save size={16} />
              </motion.button>
              <motion.button
                 type="button"
                 onClick={() => {
                   setDrawings([]);
                   if (onClearMarkers) {
                     onClearMarkers();
                   }
                   console.log('Limpiar todas las ediciones');
                 }}
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-red-600 w-8 h-8 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Limpiar Ediciones"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Selector de Colores */}
      {showColorPicker && canEdit && (
        <motion.div
          className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="text-xs font-medium text-gray-700 mb-2">Seleccionar Color:</div>
          <div className="grid grid-cols-4 gap-2">
            {availableColors.map((color) => (
              <motion.button
                key={color}
                type="button"
                onClick={() => {
                  setSelectedColor(color);
                  setShowColorPicker(false);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Color actual: <span className="font-medium" style={{ color: selectedColor }}>{selectedColor}</span>
          </div>
        </motion.div>
      )}

      {/* Indicador de Modo Activo */}
      {isMarkerMode && canEdit && (
        <motion.div
          className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          Modo Marcador Activo - Haz clic para marcar
        </motion.div>
      )}
      
      {isDrawMode && canEdit && (
        <motion.div
          className="absolute bottom-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          Modo Lápiz Activo - Arrastra para dibujar
        </motion.div>
      )}

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