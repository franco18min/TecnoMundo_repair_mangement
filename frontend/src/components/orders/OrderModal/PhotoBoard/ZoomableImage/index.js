// Exportación principal
export { default } from './ZoomableImage.jsx';

// Exportaciones de hooks personalizados
export { useZoomPan } from './hooks/useZoomPan.js';
export { useCoordinates } from './hooks/useCoordinates.js';
export { useMarkers } from './hooks/useMarkers.js';
export { useDrawings } from './hooks/useDrawings.js';

// Exportaciones de componentes UI
export { default as ZoomControls } from './components/ZoomControls.jsx';
export { default as AnnotationControls } from './components/AnnotationControls.jsx';
export { default as ColorPicker } from './components/ColorPicker.jsx';

// Exportaciones de componentes de renderizado
export { default as ImageCanvas } from './components/ImageCanvas.jsx';
export { default as MarkersLayer } from './components/MarkersLayer.jsx';
export { default as DrawingsLayer } from './components/DrawingsLayer.jsx';

// Exportaciones de utilidades
export * from './utils/constants.js';
export * from './utils/coordinateUtils.js';
export * from './utils/drawingUtils.js';