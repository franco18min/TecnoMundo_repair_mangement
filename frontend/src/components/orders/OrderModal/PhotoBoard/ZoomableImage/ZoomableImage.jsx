import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Hooks personalizados
import { useZoomPan } from './hooks/useZoomPan.js';
import { useCoordinates } from './hooks/useCoordinates.js';
import { useMarkers } from './hooks/useMarkers.js';
import { useDrawings } from './hooks/useDrawings.js';

// Componentes
import ImageCanvas from './components/ImageCanvas.jsx';
import MarkersLayer from './components/MarkersLayer.jsx';
import DrawingsLayer from './components/DrawingsLayer.jsx';
import ZoomControls from './components/ZoomControls.jsx';
import AnnotationControls from './components/AnnotationControls.jsx';

// Utilidades
import { CUSTOM_CURSORS } from './utils/constants.js';

/**
 * Componente ZoomableImage refactorizado con separación de responsabilidades
 * @param {Object} props - Props del componente
 * @param {string} props.src - URL de la imagen
 * @param {string} props.alt - Texto alternativo
 * @param {Array} props.initialMarkers - Marcadores iniciales
 * @param {Array} props.initialDrawings - Dibujos iniciales
 * @param {Function} props.onAnnotationsChange - Callback cuando cambian las anotaciones
 * @param {Function} props.onSave - Callback para guardar
 * @param {boolean} props.readOnly - Si es solo lectura
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente ZoomableImage
 */
const ZoomableImage = ({
  src,
  alt = 'Imagen de diagnóstico',
  initialMarkers = [],
  initialDrawings = [],
  onAnnotationsChange,
  onSave,
  readOnly = false,
  className = ''
}) => {
  // Estados locales
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Hooks personalizados
  const zoomPan = useZoomPan();
  const coordinates = useCoordinates();
  const markers = useMarkers(initialMarkers, onAnnotationsChange);
  const drawings = useDrawings(initialDrawings, onAnnotationsChange);

  // Determinar el cursor actual
  const getCurrentCursor = useCallback(() => {
    if (readOnly) return 'default';
    if (markers.isMarkerMode) return CUSTOM_CURSORS.CROSSHAIR;
    if (drawings.isDrawMode) return CUSTOM_CURSORS.PEN;
    if (zoomPan.isZoomed) return zoomPan.isDragging ? CUSTOM_CURSORS.GRABBING : CUSTOM_CURSORS.GRAB;
    return 'default';
  }, [readOnly, markers.isMarkerMode, drawings.isDrawMode, zoomPan.isZoomed, zoomPan.isDragging]);

  // Manejadores de eventos del mouse
  const handleMouseDown = useCallback((e) => {
    if (readOnly) return;

    const imageCoords = coordinates.getImageCoordinates(
      e, 
      zoomPan.isZoomed, 
      zoomPan.zoomLevel, 
      zoomPan.pan
    );

    if (!imageCoords) return;

    if (markers.isMarkerMode) {
      // Añadir marcador
      markers.addMarker(imageCoords);
    } else if (drawings.isDrawMode) {
      // Iniciar dibujo
      drawings.startDrawing(imageCoords);
    } else if (zoomPan.isZoomed) {
      // Iniciar pan
      zoomPan.handleMouseDown(e);
    }
  }, [
    readOnly, 
    coordinates, 
    zoomPan, 
    markers, 
    drawings
  ]);

  const handleMouseMove = useCallback((e) => {
    if (readOnly) return;

    const containerRect = coordinates.getContainerRect();
    
    if (zoomPan.isDragging && zoomPan.isZoomed) {
      // Manejar pan
      zoomPan.handleMouseMove(e, containerRect);
    } else if (drawings.isDrawing) {
      // Añadir punto al dibujo
      const imageCoords = coordinates.getImageCoordinates(
        e, 
        zoomPan.isZoomed, 
        zoomPan.zoomLevel, 
        zoomPan.pan
      );
      if (imageCoords) {
        drawings.addPointToCurrentDrawing(imageCoords);
      }
    }
  }, [
    readOnly,
    coordinates,
    zoomPan,
    drawings
  ]);

  const handleMouseUp = useCallback(() => {
    if (readOnly) return;

    if (zoomPan.isDragging) {
      zoomPan.handleMouseUp();
    } else if (drawings.isDrawing) {
      drawings.finishCurrentDrawing();
    }
  }, [readOnly, zoomPan, drawings]);

  const handleWheel = useCallback((e) => {
    if (readOnly) return;
    
    const containerRect = coordinates.getContainerRect();
    zoomPan.handleWheel(e, containerRect);
  }, [readOnly, coordinates, zoomPan]);

  // Manejadores de acciones
  const handleSave = useCallback(async () => {
    if (!onSave || isSaving) return;

    setIsSaving(true);
    try {
      await onSave({
        markers: markers.markers,
        drawings: drawings.drawings
      });
    } catch (error) {
      console.error('Error al guardar anotaciones:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving, markers.markers, drawings.drawings]);

  const handleClear = useCallback(() => {
    markers.clearMarkers();
    drawings.clearDrawings();
  }, [markers, drawings]);

  const handleColorChange = useCallback((color) => {
    if (markers.isMarkerMode) {
      markers.changeSelectedColor(color);
    }
    if (drawings.isDrawMode) {
      drawings.changeSelectedColor(color);
    }
  }, [markers, drawings]);

  // Obtener color seleccionado actual
  const getSelectedColor = useCallback(() => {
    if (markers.isMarkerMode) return markers.selectedColor;
    if (drawings.isDrawMode) return drawings.selectedColor;
    return '#ef4444'; // Color por defecto
  }, [markers.isMarkerMode, markers.selectedColor, drawings.isDrawMode, drawings.selectedColor]);

  // Verificar si hay anotaciones
  const hasAnnotations = markers.markers.length > 0 || drawings.drawings.length > 0;

  // Efectos
  useEffect(() => {
    // Actualizar marcadores desde props
    if (initialMarkers !== markers.markers) {
      markers.setMarkersFromExternal(initialMarkers);
    }
  }, [initialMarkers]);

  useEffect(() => {
    // Actualizar dibujos desde props
    if (initialDrawings !== drawings.drawings) {
      drawings.setDrawingsFromExternal(initialDrawings);
    }
  }, [initialDrawings]);

  // Manejadores de carga de imagen
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    console.error('Error al cargar la imagen:', src);
    setImageLoaded(false);
  }, [src]);

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Controles superiores */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <ZoomControls
          isZoomed={zoomPan.isZoomed}
          zoomLevel={zoomPan.zoomLevel}
          onToggleZoom={zoomPan.toggleZoom}
          onZoomIn={zoomPan.zoomIn}
          onZoomOut={zoomPan.zoomOut}
          onResetZoom={zoomPan.resetZoomPan}
        />

        {!readOnly && (
          <AnnotationControls
            isMarkerMode={markers.isMarkerMode}
            isDrawMode={drawings.isDrawMode}
            selectedColor={getSelectedColor()}
            onToggleMarkerMode={markers.toggleMarkerMode}
            onToggleDrawMode={drawings.toggleDrawMode}
            onColorChange={handleColorChange}
            onSave={handleSave}
            onClear={handleClear}
            hasAnnotations={hasAnnotations}
            isSaving={isSaving}
          />
        )}
      </div>

      {/* Contenedor principal de la imagen */}
      <motion.div
        ref={coordinates.containerRef}
        className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: getCurrentCursor() }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Imagen principal */}
        <ImageCanvas
          src={src}
          alt={alt}
          isZoomed={zoomPan.isZoomed}
          zoomLevel={zoomPan.zoomLevel}
          pan={zoomPan.pan}
          cursor={getCurrentCursor()}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Capas de anotaciones (solo si la imagen está cargada) */}
        {imageLoaded && (
          <>
            {/* Capa de dibujos */}
            <DrawingsLayer
              drawings={drawings.drawings}
              currentDrawing={drawings.getCurrentDrawing()}
              isZoomed={zoomPan.isZoomed}
              zoomLevel={zoomPan.zoomLevel}
              pan={zoomPan.pan}
              onRemoveDrawing={!readOnly ? drawings.removeDrawing : null}
              showRemoveButtons={!readOnly}
            />

            {/* Capa de marcadores */}
            <MarkersLayer
              markers={markers.markers}
              isZoomed={zoomPan.isZoomed}
              zoomLevel={zoomPan.zoomLevel}
              pan={zoomPan.pan}
              onRemoveMarker={!readOnly ? markers.removeMarker : null}
              showRemoveButtons={!readOnly}
            />
          </>
        )}

        {/* Indicador de carga */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-gray-500">Cargando imagen...</div>
          </div>
        )}
      </motion.div>

      {/* Información de estado */}
      {!readOnly && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div className="flex justify-between">
            <span>Marcadores: {markers.markers.length}</span>
            <span>Dibujos: {drawings.drawings.length}</span>
            <span>Zoom: {Math.round(zoomPan.zoomLevel * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoomableImage;