import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, MapPin, Palette, Pencil, Save, Trash2 } from 'lucide-react';

export const ZoomableImage = ({ 
  src, 
  alt, 
  className, 
  markers = [], 
  drawings = [],
  onAddMarker, 
  onClearMarkers, 
  onAddDrawing,
  onClearDrawings,
  onSaveAnnotations,
  isSavingAnnotations = false,
  canEdit = false 
}) => {
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

  // Procesar dibujos cuando cambien (convertir path string a array si es necesario)
  const processedDrawings = React.useMemo(() => {
    if (!drawings) {
      return [];
    }

    return drawings.map(drawing => {
      // Validación inicial del objeto drawing
      if (!drawing || typeof drawing !== 'object') {
        console.warn('Invalid drawing object:', drawing);
        return null;
      }

      // Si path es string, convertirlo a array de coordenadas
      if (typeof drawing.path === 'string' && drawing.path.trim()) {
        try {
          // Parsear path SVG: "M x1,y1 L x2,y2 L x3,y3" -> [{x: x1, y: y1}, {x: x2, y: y2}, ...]
          const pathString = drawing.path.trim();
          const coordinates = [];
          
          // Remover 'M ' del inicio y dividir por ' L '
          const pathParts = pathString.replace(/^M\s*/, '').split(/\s*L\s*/);
          
          pathParts.forEach(part => {
            if (part.trim()) {
              const [x, y] = part.split(',').map(coord => parseFloat(coord.trim()));
              if (!isNaN(x) && !isNaN(y)) {
                coordinates.push({ x, y });
              }
            }
          });
          
          return {
            ...drawing,
            path: coordinates,
            id: drawing.id || `drawing-${Date.now()}-${Math.random()}`,
            color: drawing.color || '#ff0000',
            strokeWidth: drawing.strokeWidth || 2
          };
        } catch (error) {
          console.warn('Error parsing drawing path:', drawing.path, error);
          return {
            ...drawing,
            path: [],
            id: drawing.id || `drawing-${Date.now()}-${Math.random()}`,
            color: drawing.color || '#ff0000',
            strokeWidth: drawing.strokeWidth || 2
          };
        }
      }
      
      // Si path ya es array, validarlo y mantenerlo
      if (Array.isArray(drawing.path)) {
        return {
          ...drawing,
          path: drawing.path,
          id: drawing.id || `drawing-${Date.now()}-${Math.random()}`,
          color: drawing.color || '#ff0000',
          strokeWidth: drawing.strokeWidth || 2
        };
      }

      // Si path no es válido, crear un dibujo vacío
      console.warn('Invalid drawing path:', drawing.path);
      return {
        ...drawing,
        path: [],
        id: drawing.id || `drawing-${Date.now()}-${Math.random()}`,
        color: drawing.color || '#ff0000',
        strokeWidth: drawing.strokeWidth || 2
      };
    }).filter(Boolean); // Filtrar elementos null
  }, [drawings]);
  
  // Colores predefinidos (más opciones)
  const availableColors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#000000', '#ffffff', '#808080', '#ff69b4',
    '#32cd32', '#87ceeb', '#dda0dd', '#f0e68c'
  ];

  // Función auxiliar para convertir coordenadas de pantalla a coordenadas de imagen
  // Optimizada para precisión perfecta en todos los modos de zoom y pan
  const screenToImageCoordinates = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    
    // Coordenadas relativas al contenedor con precisión de subpíxel
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    
    // Si estamos en zoom, necesitamos aplicar la transformación inversa exacta
    if (isZoomed && zoomLevel > 1) {
      // Calcular el centro exacto del contenedor
      const centerX = rect.width * 0.5;
      const centerY = rect.height * 0.5;
      
      // CORRECCIÓN CRÍTICA: La transformación CSS es translate() scale()
      // En CSS las transformaciones se aplican de derecha a izquierda:
      // 1. Primero scale(zoomLevel)
      // 2. Después translate(pan.x%, pan.y%)
      
      // Para la transformación inversa, debemos deshacer en orden inverso:
      // 1. Primero deshacer translate (restar pan)
      // 2. Después deshacer scale (dividir por zoomLevel)
      
      // Paso 1: Deshacer translate - el pan se aplica después del scale
      // El pan está en porcentajes de la imagen original, pero se aplica después del scale
      const panOffsetX = (pan.x * rect.width) / 100;
      const panOffsetY = (pan.y * rect.height) / 100;
      
      const untranslatedX = clickX - panOffsetX;
      const untranslatedY = clickY - panOffsetY;
      
      // Paso 2: Deshacer scale - mover al centro, escalar, y volver
      const centeredX = untranslatedX - centerX;
      const centeredY = untranslatedY - centerY;
      
      const unscaledX = centeredX / zoomLevel;
      const unscaledY = centeredY / zoomLevel;
      
      // Volver al sistema de coordenadas original
      const originalX = unscaledX + centerX;
      const originalY = unscaledY + centerY;
      
      // Convertir a porcentajes con máxima precisión
      const imageX = (originalX / rect.width) * 100;
      const imageY = (originalY / rect.height) * 100;
      
      // Aplicar límites con precisión completa
      return {
        x: Math.max(0, Math.min(100, imageX)),
        y: Math.max(0, Math.min(100, imageY))
      };
    } else {
      // Sin zoom, cálculo directo con máxima precisión
      const imageX = (clickX / rect.width) * 100;
      const imageY = (clickY / rect.height) * 100;
      
      return {
        x: Math.max(0, Math.min(100, imageX)),
        y: Math.max(0, Math.min(100, imageY))
      };
    }
  }, [isZoomed, zoomLevel, pan])

  const onMouseDown = useCallback((e) => {
    // Si estamos en modo marcador, colocar marcador
    if (isMarkerMode && canEdit) {
      const coordinates = screenToImageCoordinates(e.clientX, e.clientY);
      if (!coordinates) return;
      
      if (onAddMarker) {
        const newMarker = {
          x: coordinates.x,
          y: coordinates.y,
          color: selectedColor,
          id: `marker-${Date.now()}-${Math.random()}`,
        };
        onAddMarker(newMarker);
      }
      return;
    }

    if (isDrawMode && canEdit) {
      // Iniciar dibujo libre con mayor precisión
      const coordinates = screenToImageCoordinates(e.clientX, e.clientY);
      if (!coordinates) return;
      
      setIsDrawing(true);
      setCurrentPath([{ x: coordinates.x, y: coordinates.y }]);
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
    // Prevenir comportamiento por defecto para mejor control
    e.preventDefault();
    
    if (isDragging && isZoomed) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !dragStartRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const panDeltaX = (deltaX / rect.width) * 100;
      const panDeltaY = (deltaY / rect.height) * 100;

      setPan({
        x: Math.max(-50, Math.min(50, dragStartRef.current.panStart.x + panDeltaX)),
        y: Math.max(-50, Math.min(50, dragStartRef.current.panStart.y + panDeltaY)),
      });
    }

    if (isDrawing && isDrawMode && canEdit) {
      // Optimizar precisión del dibujo con coordenadas exactas
      const coordinates = screenToImageCoordinates(e.clientX, e.clientY);
      if (!coordinates) return;
      
      // Evitar puntos duplicados muy cercanos para suavizar el trazo
      setCurrentPath(prev => {
        if (prev.length === 0) return [{ x: coordinates.x, y: coordinates.y }];
        
        const lastPoint = prev[prev.length - 1];
        const distance = Math.sqrt(
          Math.pow(coordinates.x - lastPoint.x, 2) + 
          Math.pow(coordinates.y - lastPoint.y, 2)
        );
        
        // Solo agregar punto si está suficientemente lejos del anterior (0.1% de la imagen)
        if (distance > 0.1) {
          return [...prev, { x: coordinates.x, y: coordinates.y }];
        }
        
        return prev;
      });
    }
  }, [isDragging, isZoomed, isDrawing, isDrawMode, canEdit, screenToImageCoordinates]);

  const onMouseUpOrLeave = useCallback(() => {
    if (isDrawing && isDrawMode && currentPath.length > 1) {
      // Finalizar dibujo y agregarlo a la lista
      const newDrawing = {
        id: `drawing-${Date.now()}-${Math.random()}`,
        path: currentPath,
        color: selectedColor,
        strokeWidth: 2,
      };
      if (onAddDrawing) {
        onAddDrawing(newDrawing);
      }
      setCurrentPath([]);
    }
    
    setIsDrawing(false);
    if (isDragging) setIsDragging(false);
  }, [isDragging, isDrawing, isDrawMode, currentPath, selectedColor, onAddDrawing]);

  const handleMouseEnter = () => {
    // Removido el zoom automático para evitar interferencia con herramientas
  };

  const handleMouseLeave = () => {
    // Solo resetear el zoom si se sale completamente del contenedor
    // y no hay herramientas activas
    if (!isMarkerMode && !isDrawMode) {
      // Opcional: mantener el zoom incluso al salir del mouse
      // setIsZoomed(false);
      // setZoomLevel(1);
      // setPan({ x: 0, y: 0 });
    }
  };

  // Escucha manual del evento 'wheel' con passive: false para permitir preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheelHandler = (e) => {
      // Evita el scroll por defecto mientras hacemos zoom manual
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.3 : 0.3;
      
      setZoomLevel(prev => {
        const newZoom = Math.max(1, Math.min(6, prev + delta));
        
        // Si el zoom es mayor a 1, activar modo zoom
        if (newZoom > 1) {
          setIsZoomed(true);
        } else {
          // Si volvemos a zoom 1, desactivar modo zoom
          setIsZoomed(false);
          setPan({ x: 0, y: 0 });
        }
        
        return newZoom;
      });
    };

    el.addEventListener('wheel', onWheelHandler, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheelHandler);
    };
  }, []); // Removido isZoomed de las dependencias para que funcione en todos los modos

  // Controles explícitos de zoom
  const handleZoomIn = useCallback(() => {
    setIsZoomed(true);
    setZoomLevel(prev => Math.min(6, prev + 0.3));
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
      setPan({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
      setZoomLevel(1.5);
    }
  };

  // Función para determinar el cursor apropiado
  const getCursorStyle = () => {
    if (isMarkerMode && canEdit) return 'crosshair';
    if (isDrawMode && canEdit) return 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'2\' fill=\'%23000\'/%3E%3C/svg%3E") 10 10, crosshair';
    if (isZoomed) return isDragging ? 'grabbing' : 'grab';
    return 'default'; // Cambiado de 'zoom-in' a 'default'
  };

  return (
    <div className="relative group">
      <div
        ref={containerRef}
        className={`relative overflow-hidden touch-none overscroll-contain select-none ${className}`}
        style={{ 
          cursor: getCursorStyle(),
          // Optimizar para mejor captura de eventos del mouse
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          // Mejorar responsividad táctil
          touchAction: 'none',
          // Asegurar que el contenedor capture todos los eventos
          pointerEvents: 'auto'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        // Agregar eventos adicionales para mejor precisión
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
      >
        <motion.img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-full h-full object-contain transition-transform duration-100 ease-out"
          style={{
            transformOrigin: 'center center',
            transform: `translate(${pan.x}%, ${pan.y}%) scale(${isZoomed ? zoomLevel : 1})`,
          }}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* SVG para dibujos libres */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            transform: `translate(${pan.x}%, ${pan.y}%) scale(${isZoomed ? zoomLevel : 1})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Dibujos completados */}
          {processedDrawings.map((drawing) => {
            // Validación adicional para asegurar que path sea un array
            const pathArray = Array.isArray(drawing.path) ? drawing.path : [];
            
            // Solo renderizar si hay al menos 2 puntos para formar una línea
            if (pathArray.length < 2) return null;
            
            return (
              <path
                key={drawing.id}
                d={`M ${pathArray.map(point => `${point.x},${point.y}`).join(' L ')}`}
                stroke={drawing.color}
                strokeWidth={drawing.strokeWidth || 2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{
                  // Asegurar que el trazo mantenga su grosor visual independiente del zoom
                  strokeWidth: `${(drawing.strokeWidth || 2) / (isZoomed ? zoomLevel : 1)}px`
                }}
              />
            );
          })}
          
          {/* Dibujo actual en progreso */}
          {isDrawing && currentPath.length > 1 && (
            <path
              d={`M ${currentPath.map(point => `${point.x},${point.y}`).join(' L ')}`}
              stroke={selectedColor}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{
                // Mantener grosor visual consistente durante el dibujo
                strokeWidth: `${2 / (isZoomed ? zoomLevel : 1)}px`
              }}
            />
          )}
          
          {/* Marcadores en el mismo sistema de coordenadas que los dibujos */}
          {markers.map((marker) => {
            // Calcular el tamaño del marcador basado en el zoom para mantener visibilidad
            const markerSize = Math.max(1.8, Math.min(3.5, 2.5 / (isZoomed ? Math.sqrt(zoomLevel) : 1)));
            
            // El punto exacto donde se hizo clic (la punta del marcador)
            const pointX = marker.x;
            const pointY = marker.y;
            
            // El centro del círculo del marcador (arriba del punto)
            const centerX = pointX;
            const centerY = pointY - markerSize * 0.8;
            
            return (
              <g key={marker.id}>
                {/* Sombra del marcador con color TecnoMundo */}
                <g transform={`translate(0.2, 0.2)`}>
                  {/* Sombra del círculo */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={markerSize * 0.5}
                    fill="rgba(79, 70, 229, 0.15)"
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: 'blur(2px)' }}
                  />
                  {/* Sombra de la punta */}
                  <path
                    d={`M ${centerX} ${centerY + markerSize * 0.3} 
                        L ${pointX - markerSize * 0.15} ${pointY - markerSize * 0.1} 
                        L ${pointX + markerSize * 0.15} ${pointY - markerSize * 0.1} 
                        Z`}
                    fill="rgba(79, 70, 229, 0.15)"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
                
                {/* Cuerpo principal del marcador - TecnoMundo indigo */}
                {/* Círculo superior */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={markerSize * 0.5}
                  fill="#4f46e5"
                  stroke="#FFFFFF"
                  strokeWidth={markerSize * 0.08}
                  vectorEffect="non-scaling-stroke"
                  style={{
                    strokeWidth: `${(markerSize * 0.08) / (isZoomed ? zoomLevel : 1)}px`,
                    filter: 'drop-shadow(0 4px 8px rgba(79, 70, 229, 0.25))'
                  }}
                />
                
                {/* Punta que apunta al punto exacto */}
                <path
                  d={`M ${centerX} ${centerY + markerSize * 0.3} 
                      L ${pointX - markerSize * 0.15} ${pointY - markerSize * 0.1} 
                      L ${pointX} ${pointY} 
                      L ${pointX + markerSize * 0.15} ${pointY - markerSize * 0.1} 
                      Z`}
                  fill="#4f46e5"
                  stroke="#FFFFFF"
                  strokeWidth={markerSize * 0.06}
                  vectorEffect="non-scaling-stroke"
                  style={{
                    strokeWidth: `${(markerSize * 0.06) / (isZoomed ? zoomLevel : 1)}px`
                  }}
                />
                
                {/* Anillo exterior para profundidad */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={markerSize * 0.32}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth={markerSize * 0.04}
                  vectorEffect="non-scaling-stroke"
                  style={{
                    strokeWidth: `${(markerSize * 0.04) / (isZoomed ? zoomLevel : 1)}px`
                  }}
                />
                
                {/* Círculo interior blanco */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={markerSize * 0.28}
                  fill="#FFFFFF"
                  vectorEffect="non-scaling-stroke"
                />
                
                {/* Círculo de marca TecnoMundo */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={markerSize * 0.18}
                  fill="#4f46e5"
                  vectorEffect="non-scaling-stroke"
                />
                
                {/* Punto central para precisión */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={markerSize * 0.08}
                  fill="#FFFFFF"
                  vectorEffect="non-scaling-stroke"
                />
                
                {/* Efecto de brillo sutil */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={markerSize * 0.6}
                  fill="none"
                  stroke="rgba(79, 70, 229, 0.1)"
                  strokeWidth={markerSize * 0.16}
                  vectorEffect="non-scaling-stroke"
                  style={{
                    strokeWidth: `${(markerSize * 0.16) / (isZoomed ? zoomLevel : 1)}px`,
                    filter: 'blur(1px)'
                  }}
                />
              </g>
            );
          })}
        </svg>



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
                onClick={onSaveAnnotations}
                disabled={isSavingAnnotations}
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 w-8 h-8 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Guardar Anotaciones"
              >
                <Save size={16} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => {
                  if (onClearMarkers) onClearMarkers();
                  if (onClearDrawings) onClearDrawings();
                }}
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-red-600 w-8 h-8 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Limpiar Todo"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Selector de Color Flotante */}
      {showColorPicker && canEdit && (
        <motion.div
          className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="grid grid-cols-4 gap-2">
            {availableColors.map((color) => (
              <motion.button
                key={color}
                type="button"
                onClick={() => {
                  setSelectedColor(color);
                  setShowColorPicker(false);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                  selectedColor === color 
                    ? 'border-gray-800 scale-110' 
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Indicadores de Modo Activo */}
      {(isMarkerMode || isDrawMode) && canEdit && (
        <div className="absolute bottom-2 right-2 flex gap-2">
          {isMarkerMode && (
            <motion.div
              className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <MapPin size={14} className="inline mr-1" />
              Modo Marcador
            </motion.div>
          )}
          {isDrawMode && (
            <motion.div
              className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Pencil size={14} className="inline mr-1" />
              Modo Lápiz
            </motion.div>
          )}
        </div>
      )}

      {/* Indicadores Flotantes */}
      {isZoomed && (
        <div className="absolute bottom-2 left-2 flex flex-col gap-2">
          {/* Indicador de Zoom */}
          <motion.div
            className="bg-black/70 text-white px-2 py-1 rounded text-xs font-mono"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {Math.round(zoomLevel * 100)}%
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ZoomableImage;