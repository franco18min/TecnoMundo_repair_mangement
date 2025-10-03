import { useState, useCallback } from 'react';
import { MARKER_CONFIG } from '../utils/constants.js';

/**
 * Hook personalizado para manejo de marcadores
 * @param {Array} initialMarkers - Marcadores iniciales
 * @param {Function} onMarkersChange - Callback cuando cambian los marcadores
 * @returns {Object} Estado y funciones para marcadores
 */
export const useMarkers = (initialMarkers = [], onMarkersChange) => {
  const [markers, setMarkers] = useState(initialMarkers);
  const [isMarkerMode, setIsMarkerMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(MARKER_CONFIG.DEFAULT_COLOR);

  /**
   * Activa o desactiva el modo marcador
   */
  const toggleMarkerMode = useCallback(() => {
    setIsMarkerMode(prev => !prev);
  }, []);

  /**
   * Añade un nuevo marcador
   * @param {Object} coordinates - Coordenadas {x, y} en porcentajes
   * @param {string} color - Color del marcador (opcional)
   * @returns {Object} El marcador creado
   */
  const addMarker = useCallback((coordinates, color = selectedColor) => {
    if (!coordinates || typeof coordinates.x !== 'number' || typeof coordinates.y !== 'number') {
      console.warn('Invalid coordinates for marker:', coordinates);
      return null;
    }

    const newMarker = {
      id: `marker-${Date.now()}-${Math.random()}`,
      x: coordinates.x,
      y: coordinates.y,
      color: color || MARKER_CONFIG.DEFAULT_COLOR,
      createdAt: new Date().toISOString()
    };

    setMarkers(prev => {
      const updated = [...prev, newMarker];
      onMarkersChange?.(updated);
      return updated;
    });

    return newMarker;
  }, [selectedColor, onMarkersChange]);

  /**
   * Elimina un marcador por ID
   * @param {string} markerId - ID del marcador a eliminar
   */
  const removeMarker = useCallback((markerId) => {
    setMarkers(prev => {
      const updated = prev.filter(marker => marker.id !== markerId);
      onMarkersChange?.(updated);
      return updated;
    });
  }, [onMarkersChange]);

  /**
   * Actualiza un marcador existente
   * @param {string} markerId - ID del marcador
   * @param {Object} updates - Actualizaciones a aplicar
   */
  const updateMarker = useCallback((markerId, updates) => {
    setMarkers(prev => {
      const updated = prev.map(marker => 
        marker.id === markerId 
          ? { ...marker, ...updates, updatedAt: new Date().toISOString() }
          : marker
      );
      onMarkersChange?.(updated);
      return updated;
    });
  }, [onMarkersChange]);

  /**
   * Mueve un marcador a nuevas coordenadas
   * @param {string} markerId - ID del marcador
   * @param {Object} coordinates - Nuevas coordenadas {x, y}
   */
  const moveMarker = useCallback((markerId, coordinates) => {
    updateMarker(markerId, { x: coordinates.x, y: coordinates.y });
  }, [updateMarker]);

  /**
   * Cambia el color de un marcador
   * @param {string} markerId - ID del marcador
   * @param {string} color - Nuevo color
   */
  const changeMarkerColor = useCallback((markerId, color) => {
    updateMarker(markerId, { color });
  }, [updateMarker]);

  /**
   * Limpia todos los marcadores
   */
  const clearMarkers = useCallback(() => {
    setMarkers([]);
    onMarkersChange?.([]);
  }, [onMarkersChange]);

  /**
   * Establece los marcadores desde una fuente externa
   * @param {Array} newMarkers - Nuevos marcadores
   */
  const setMarkersFromExternal = useCallback((newMarkers) => {
    const validMarkers = (newMarkers || []).filter(marker => 
      marker && 
      typeof marker.x === 'number' && 
      typeof marker.y === 'number' &&
      marker.x >= 0 && marker.x <= 100 &&
      marker.y >= 0 && marker.y <= 100
    );
    
    setMarkers(validMarkers);
  }, []);

  /**
   * Obtiene un marcador por ID
   * @param {string} markerId - ID del marcador
   * @returns {Object|null} El marcador encontrado o null
   */
  const getMarkerById = useCallback((markerId) => {
    return markers.find(marker => marker.id === markerId) || null;
  }, [markers]);

  /**
   * Obtiene marcadores en un área específica
   * @param {Object} area - Área {x, y, width, height} en porcentajes
   * @returns {Array} Marcadores en el área
   */
  const getMarkersInArea = useCallback((area) => {
    return markers.filter(marker => 
      marker.x >= area.x && 
      marker.x <= area.x + area.width &&
      marker.y >= area.y && 
      marker.y <= area.y + area.height
    );
  }, [markers]);

  /**
   * Cambia el color seleccionado para nuevos marcadores
   * @param {string} color - Nuevo color seleccionado
   */
  const changeSelectedColor = useCallback((color) => {
    setSelectedColor(color);
  }, []);

  return {
    // Estado
    markers,
    isMarkerMode,
    selectedColor,
    
    // Acciones de modo
    toggleMarkerMode,
    changeSelectedColor,
    
    // Acciones de marcadores
    addMarker,
    removeMarker,
    updateMarker,
    moveMarker,
    changeMarkerColor,
    clearMarkers,
    setMarkersFromExternal,
    
    // Consultas
    getMarkerById,
    getMarkersInArea
  };
};