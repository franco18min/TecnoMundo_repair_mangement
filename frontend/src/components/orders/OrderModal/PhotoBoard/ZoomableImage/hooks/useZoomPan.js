import { useState, useCallback } from 'react';
import { ZOOM_CONFIG, PAN_CONFIG } from '../utils/constants.js';

/**
 * Hook personalizado para manejar la lógica de zoom y pan
 * @param {boolean} initialZoomMode - Modo de zoom inicial
 * @returns {Object} Estado y funciones para zoom y pan
 */
export const useZoomPan = (initialZoomMode = false) => {
  const [isZoomed, setIsZoomed] = useState(initialZoomMode);
  const [zoomLevel, setZoomLevel] = useState(ZOOM_CONFIG.DEFAULT_LEVEL);
  const [pan, setPan] = useState({ x: PAN_CONFIG.INITIAL_X, y: PAN_CONFIG.INITIAL_Y });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  /**
   * Activa o desactiva el modo zoom
   */
  const toggleZoom = useCallback(() => {
    setIsZoomed(prev => {
      if (prev) {
        // Al salir del zoom, resetear valores
        setZoomLevel(ZOOM_CONFIG.DEFAULT_LEVEL);
        setPan({ x: PAN_CONFIG.INITIAL_X, y: PAN_CONFIG.INITIAL_Y });
      }
      return !prev;
    });
  }, []);

  /**
   * Maneja el zoom con la rueda del mouse
   * @param {WheelEvent} e - Evento de rueda del mouse
   * @param {DOMRect} containerRect - Rectángulo del contenedor
   */
  const handleWheel = useCallback((e, containerRect) => {
    if (!isZoomed || !containerRect) return;

    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -ZOOM_CONFIG.STEP : ZOOM_CONFIG.STEP;
    const newZoomLevel = Math.max(
      ZOOM_CONFIG.MIN_LEVEL, 
      Math.min(ZOOM_CONFIG.MAX_LEVEL, zoomLevel + delta)
    );
    
    if (newZoomLevel !== zoomLevel) {
      // Calcular el punto de zoom basado en la posición del mouse
      const rect = containerRect;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Convertir a coordenadas relativas (0-1)
      const relativeX = mouseX / rect.width;
      const relativeY = mouseY / rect.height;
      
      // Ajustar el pan para mantener el punto bajo el mouse
      const zoomRatio = newZoomLevel / zoomLevel;
      const newPanX = pan.x + (relativeX - 0.5) * (1 - zoomRatio) * 100;
      const newPanY = pan.y + (relativeY - 0.5) * (1 - zoomRatio) * 100;
      
      setZoomLevel(newZoomLevel);
      setPan({
        x: Math.max(PAN_CONFIG.MIN_X, Math.min(PAN_CONFIG.MAX_X, newPanX)),
        y: Math.max(PAN_CONFIG.MIN_Y, Math.min(PAN_CONFIG.MAX_Y, newPanY))
      });
    }
  }, [isZoomed, zoomLevel, pan]);

  /**
   * Inicia el arrastre para pan
   * @param {MouseEvent} e - Evento de mouse
   */
  const handleMouseDown = useCallback((e) => {
    if (!isZoomed) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isZoomed]);

  /**
   * Maneja el movimiento durante el arrastre
   * @param {MouseEvent} e - Evento de mouse
   * @param {DOMRect} containerRect - Rectángulo del contenedor
   */
  const handleMouseMove = useCallback((e, containerRect) => {
    if (!isDragging || !isZoomed || !containerRect) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Convertir el delta de píxeles a porcentaje
    const panDeltaX = (deltaX / containerRect.width) * 100;
    const panDeltaY = (deltaY / containerRect.height) * 100;
    
    const newPanX = pan.x + panDeltaX;
    const newPanY = pan.y + panDeltaY;
    
    setPan({
      x: Math.max(PAN_CONFIG.MIN_X, Math.min(PAN_CONFIG.MAX_X, newPanX)),
      y: Math.max(PAN_CONFIG.MIN_Y, Math.min(PAN_CONFIG.MAX_Y, newPanY))
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, isZoomed, dragStart, pan]);

  /**
   * Termina el arrastre
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Resetea el zoom y pan a valores iniciales
   */
  const resetZoomPan = useCallback(() => {
    setZoomLevel(ZOOM_CONFIG.DEFAULT_LEVEL);
    setPan({ x: PAN_CONFIG.INITIAL_X, y: PAN_CONFIG.INITIAL_Y });
  }, []);

  /**
   * Ajusta el zoom a un nivel específico
   * @param {number} level - Nivel de zoom deseado
   */
  const setZoom = useCallback((level) => {
    const clampedLevel = Math.max(
      ZOOM_CONFIG.MIN_LEVEL, 
      Math.min(ZOOM_CONFIG.MAX_LEVEL, level)
    );
    setZoomLevel(clampedLevel);
  }, []);

  /**
   * Incrementa el zoom
   */
  const zoomIn = useCallback(() => {
    setZoom(zoomLevel + ZOOM_CONFIG.STEP);
  }, [zoomLevel, setZoom]);

  /**
   * Decrementa el zoom
   */
  const zoomOut = useCallback(() => {
    setZoom(zoomLevel - ZOOM_CONFIG.STEP);
  }, [zoomLevel, setZoom]);

  return {
    // Estado
    isZoomed,
    zoomLevel,
    pan,
    isDragging,
    
    // Acciones
    toggleZoom,
    resetZoomPan,
    setZoom,
    zoomIn,
    zoomOut,
    
    // Manejadores de eventos
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};