import { COORDINATE_CONFIG } from './constants.js';

/**
 * Convierte coordenadas de pantalla a coordenadas de imagen (porcentajes)
 * @param {number} clientX - Coordenada X del cliente
 * @param {number} clientY - Coordenada Y del cliente
 * @param {DOMRect} containerRect - Rectángulo del contenedor
 * @param {boolean} isZoomed - Si está en modo zoom
 * @param {number} zoomLevel - Nivel de zoom actual
 * @param {Object} pan - Objeto de desplazamiento {x, y}
 * @returns {Object|null} Coordenadas de imagen {x, y} en porcentajes o null si es inválido
 */
export const screenToImageCoordinates = (clientX, clientY, containerRect, isZoomed, zoomLevel, pan) => {
  if (!containerRect) return null;
  
  // Coordenadas relativas al contenedor
  const clickX = clientX - containerRect.left;
  const clickY = clientY - containerRect.top;
  
  // Si estamos en zoom, necesitamos ajustar por la transformación
  if (isZoomed && zoomLevel > 1) {
    // Calcular el centro del contenedor
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    // Ajustar por el pan (desplazamiento) - convertir porcentajes a píxeles
    const panOffsetX = (pan.x / 100) * containerRect.width;
    const panOffsetY = (pan.y / 100) * containerRect.height;
    
    // Convertir coordenadas considerando zoom y pan con mayor precisión
    // Primero, ajustamos por el pan
    const adjustedX = (clickX - centerX - panOffsetX) / zoomLevel + centerX;
    const adjustedY = (clickY - centerY - panOffsetY) / zoomLevel + centerY;
    
    // Convertir a porcentajes con máxima precisión (6 decimales)
    const imageX = Math.round((adjustedX / containerRect.width) * COORDINATE_CONFIG.PRECISION_MULTIPLIER) / COORDINATE_CONFIG.PRECISION_DIVISOR;
    const imageY = Math.round((adjustedY / containerRect.height) * COORDINATE_CONFIG.PRECISION_MULTIPLIER) / COORDINATE_CONFIG.PRECISION_DIVISOR;
    
    return {
      x: Math.max(0, Math.min(100, imageX)),
      y: Math.max(0, Math.min(100, imageY))
    };
  } else {
    // Sin zoom, cálculo directo con máxima precisión
    const imageX = Math.round((clickX / containerRect.width) * COORDINATE_CONFIG.PRECISION_MULTIPLIER) / COORDINATE_CONFIG.PRECISION_DIVISOR;
    const imageY = Math.round((clickY / containerRect.height) * COORDINATE_CONFIG.PRECISION_MULTIPLIER) / COORDINATE_CONFIG.PRECISION_DIVISOR;
    
    return {
      x: Math.max(0, Math.min(100, imageX)),
      y: Math.max(0, Math.min(100, imageY))
    };
  }
};

/**
 * Calcula el tamaño del marcador basado en el nivel de zoom
 * @param {number} zoomLevel - Nivel de zoom actual
 * @param {boolean} isZoomed - Si está en modo zoom
 * @param {number} baseSize - Tamaño base del marcador
 * @param {number} minSize - Tamaño mínimo
 * @param {number} maxSize - Tamaño máximo
 * @returns {number} Tamaño calculado del marcador
 */
export const calculateMarkerSize = (zoomLevel, isZoomed, baseSize = 20, minSize = 16, maxSize = 32) => {
  return Math.max(minSize, Math.min(maxSize, baseSize / (isZoomed ? Math.sqrt(zoomLevel) : 1)));
};

/**
 * Calcula el grosor del trazo para dibujos basado en el zoom
 * @param {number} strokeWidth - Grosor base del trazo
 * @param {number} zoomLevel - Nivel de zoom actual
 * @param {boolean} isZoomed - Si está en modo zoom
 * @returns {number} Grosor calculado del trazo
 */
export const calculateStrokeWidth = (strokeWidth, zoomLevel, isZoomed) => {
  return strokeWidth / (isZoomed ? zoomLevel : 1);
};

/**
 * Valida si las coordenadas están dentro de los límites válidos
 * @param {Object} coordinates - Coordenadas {x, y}
 * @returns {boolean} True si las coordenadas son válidas
 */
export const areValidCoordinates = (coordinates) => {
  return coordinates && 
         typeof coordinates.x === 'number' && 
         typeof coordinates.y === 'number' &&
         coordinates.x >= 0 && coordinates.x <= 100 &&
         coordinates.y >= 0 && coordinates.y <= 100;
};