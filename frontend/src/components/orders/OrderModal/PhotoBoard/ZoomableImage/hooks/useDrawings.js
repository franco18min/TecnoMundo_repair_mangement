import { useState, useCallback, useRef } from 'react';
import { DRAWING_CONFIG } from '../utils/constants.js';
import { processDrawings, createDrawing, isValidDrawingForRender } from '../utils/drawingUtils.js';

/**
 * Hook personalizado para manejo de dibujos
 * @param {Array} initialDrawings - Dibujos iniciales
 * @param {Function} onDrawingsChange - Callback cuando cambian los dibujos
 * @returns {Object} Estado y funciones para dibujos
 */
export const useDrawings = (initialDrawings = [], onDrawingsChange) => {
  const [drawings, setDrawings] = useState(() => processDrawings(initialDrawings));
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(DRAWING_CONFIG.DEFAULT_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(DRAWING_CONFIG.DEFAULT_STROKE_WIDTH);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const drawingRef = useRef(null);

  /**
   * Activa o desactiva el modo dibujo
   */
  const toggleDrawMode = useCallback(() => {
    setIsDrawMode(prev => {
      if (prev && isDrawing) {
        // Si estamos saliendo del modo dibujo y hay un dibujo en progreso, finalizarlo
        finishCurrentDrawing();
      }
      return !prev;
    });
  }, [isDrawing]);

  /**
   * Inicia un nuevo dibujo
   * @param {Object} coordinates - Coordenadas iniciales {x, y}
   */
  const startDrawing = useCallback((coordinates) => {
    if (!isDrawMode || !coordinates) return;
    
    setIsDrawing(true);
    setCurrentPath([coordinates]);
  }, [isDrawMode]);

  /**
   * Añade un punto al dibujo actual
   * @param {Object} coordinates - Coordenadas del punto {x, y}
   */
  const addPointToCurrentDrawing = useCallback((coordinates) => {
    if (!isDrawing || !coordinates) return;
    
    setCurrentPath(prev => [...prev, coordinates]);
  }, [isDrawing]);

  /**
   * Finaliza el dibujo actual y lo añade a la lista
   */
  const finishCurrentDrawing = useCallback(() => {
    if (!isDrawing || currentPath.length < DRAWING_CONFIG.MIN_POINTS_FOR_PATH) {
      setIsDrawing(false);
      setCurrentPath([]);
      return;
    }

    const newDrawing = createDrawing(currentPath, selectedColor, strokeWidth);
    
    setDrawings(prev => {
      const updated = [...prev, newDrawing];
      onDrawingsChange?.(updated);
      return updated;
    });

    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, selectedColor, strokeWidth, onDrawingsChange]);

  /**
   * Cancela el dibujo actual
   */
  const cancelCurrentDrawing = useCallback(() => {
    setIsDrawing(false);
    setCurrentPath([]);
  }, []);

  /**
   * Elimina un dibujo por ID
   * @param {string} drawingId - ID del dibujo a eliminar
   */
  const removeDrawing = useCallback((drawingId) => {
    setDrawings(prev => {
      const updated = prev.filter(drawing => drawing.id !== drawingId);
      onDrawingsChange?.(updated);
      return updated;
    });
  }, [onDrawingsChange]);

  /**
   * Actualiza un dibujo existente
   * @param {string} drawingId - ID del dibujo
   * @param {Object} updates - Actualizaciones a aplicar
   */
  const updateDrawing = useCallback((drawingId, updates) => {
    setDrawings(prev => {
      const updated = prev.map(drawing => 
        drawing.id === drawingId 
          ? { ...drawing, ...updates, updatedAt: new Date().toISOString() }
          : drawing
      );
      onDrawingsChange?.(updated);
      return updated;
    });
  }, [onDrawingsChange]);

  /**
   * Cambia el color de un dibujo
   * @param {string} drawingId - ID del dibujo
   * @param {string} color - Nuevo color
   */
  const changeDrawingColor = useCallback((drawingId, color) => {
    updateDrawing(drawingId, { color });
  }, [updateDrawing]);

  /**
   * Cambia el grosor de trazo de un dibujo
   * @param {string} drawingId - ID del dibujo
   * @param {number} width - Nuevo grosor
   */
  const changeDrawingStrokeWidth = useCallback((drawingId, width) => {
    updateDrawing(drawingId, { strokeWidth: width });
  }, [updateDrawing]);

  /**
   * Limpia todos los dibujos
   */
  const clearDrawings = useCallback(() => {
    if (isDrawing) {
      cancelCurrentDrawing();
    }
    setDrawings([]);
    onDrawingsChange?.([]);
  }, [isDrawing, cancelCurrentDrawing, onDrawingsChange]);

  /**
   * Establece los dibujos desde una fuente externa
   * @param {Array} newDrawings - Nuevos dibujos
   */
  const setDrawingsFromExternal = useCallback((newDrawings) => {
    const processedDrawings = processDrawings(newDrawings);
    setDrawings(processedDrawings);
  }, []);

  /**
   * Obtiene un dibujo por ID
   * @param {string} drawingId - ID del dibujo
   * @returns {Object|null} El dibujo encontrado o null
   */
  const getDrawingById = useCallback((drawingId) => {
    return drawings.find(drawing => drawing.id === drawingId) || null;
  }, [drawings]);

  /**
   * Obtiene todos los dibujos válidos para renderizar
   * @returns {Array} Dibujos válidos
   */
  const getValidDrawings = useCallback(() => {
    return drawings.filter(isValidDrawingForRender);
  }, [drawings]);

  /**
   * Cambia el color seleccionado para nuevos dibujos
   * @param {string} color - Nuevo color seleccionado
   */
  const changeSelectedColor = useCallback((color) => {
    setSelectedColor(color);
  }, []);

  /**
   * Cambia el grosor de trazo seleccionado para nuevos dibujos
   * @param {number} width - Nuevo grosor seleccionado
   */
  const changeSelectedStrokeWidth = useCallback((width) => {
    setStrokeWidth(Math.max(DRAWING_CONFIG.MIN_STROKE_WIDTH, 
                           Math.min(DRAWING_CONFIG.MAX_STROKE_WIDTH, width)));
  }, []);

  /**
   * Obtiene el dibujo actual en progreso
   * @returns {Object|null} Dibujo actual o null
   */
  const getCurrentDrawing = useCallback(() => {
    if (!isDrawing || currentPath.length === 0) return null;
    
    return createDrawing(currentPath, selectedColor, strokeWidth);
  }, [isDrawing, currentPath, selectedColor, strokeWidth]);

  return {
    // Estado
    drawings,
    isDrawMode,
    selectedColor,
    strokeWidth,
    isDrawing,
    currentPath,
    
    // Referencias
    drawingRef,
    
    // Acciones de modo
    toggleDrawMode,
    changeSelectedColor,
    changeSelectedStrokeWidth,
    
    // Acciones de dibujo
    startDrawing,
    addPointToCurrentDrawing,
    finishCurrentDrawing,
    cancelCurrentDrawing,
    
    // Acciones de gestión
    removeDrawing,
    updateDrawing,
    changeDrawingColor,
    changeDrawingStrokeWidth,
    clearDrawings,
    setDrawingsFromExternal,
    
    // Consultas
    getDrawingById,
    getValidDrawings,
    getCurrentDrawing
  };
};