import { useCallback, useRef } from 'react';
import { screenToImageCoordinates, areValidCoordinates } from '../utils/coordinateUtils.js';

/**
 * Hook personalizado para manejo de coordenadas
 * @returns {Object} Funciones para conversión y validación de coordenadas
 */
export const useCoordinates = () => {
  const containerRef = useRef(null);

  /**
   * Convierte coordenadas de evento a coordenadas de imagen
   * @param {MouseEvent} event - Evento de mouse
   * @param {boolean} isZoomed - Si está en modo zoom
   * @param {number} zoomLevel - Nivel de zoom actual
   * @param {Object} pan - Objeto de desplazamiento {x, y}
   * @returns {Object|null} Coordenadas de imagen {x, y} en porcentajes
   */
  const getImageCoordinates = useCallback((event, isZoomed, zoomLevel, pan) => {
    if (!containerRef.current) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    return screenToImageCoordinates(
      event.clientX,
      event.clientY,
      containerRect,
      isZoomed,
      zoomLevel,
      pan
    );
  }, []);

  /**
   * Obtiene el rectángulo del contenedor
   * @returns {DOMRect|null} Rectángulo del contenedor
   */
  const getContainerRect = useCallback(() => {
    return containerRef.current ? containerRef.current.getBoundingClientRect() : null;
  }, []);

  /**
   * Valida si las coordenadas están dentro de los límites
   * @param {Object} coordinates - Coordenadas {x, y}
   * @returns {boolean} True si las coordenadas son válidas
   */
  const validateCoordinates = useCallback((coordinates) => {
    return areValidCoordinates(coordinates);
  }, []);

  /**
   * Convierte coordenadas de porcentaje a píxeles
   * @param {Object} coordinates - Coordenadas en porcentaje {x, y}
   * @returns {Object|null} Coordenadas en píxeles {x, y}
   */
  const percentageToPixels = useCallback((coordinates) => {
    if (!containerRef.current || !validateCoordinates(coordinates)) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (coordinates.x / 100) * rect.width,
      y: (coordinates.y / 100) * rect.height
    };
  }, [validateCoordinates]);

  /**
   * Convierte coordenadas de píxeles a porcentaje
   * @param {Object} coordinates - Coordenadas en píxeles {x, y}
   * @returns {Object|null} Coordenadas en porcentaje {x, y}
   */
  const pixelsToPercentage = useCallback((coordinates) => {
    if (!containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    const percentageCoords = {
      x: (coordinates.x / rect.width) * 100,
      y: (coordinates.y / rect.height) * 100
    };
    
    return validateCoordinates(percentageCoords) ? percentageCoords : null;
  }, [validateCoordinates]);

  return {
    containerRef,
    getImageCoordinates,
    getContainerRect,
    validateCoordinates,
    percentageToPixels,
    pixelsToPercentage
  };
};