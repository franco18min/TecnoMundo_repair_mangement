import { DRAWING_CONFIG } from './constants.js';

/**
 * Procesa los dibujos para convertir paths string a arrays de coordenadas
 * @param {Array} drawings - Array de dibujos
 * @returns {Array} Array de dibujos procesados
 */
export const processDrawings = (drawings) => {
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
          color: drawing.color || DRAWING_CONFIG.DEFAULT_COLOR,
          strokeWidth: drawing.strokeWidth || DRAWING_CONFIG.DEFAULT_STROKE_WIDTH
        };
      } catch (error) {
        console.warn('Error parsing drawing path:', drawing.path, error);
        return {
          ...drawing,
          path: [],
          id: drawing.id || `drawing-${Date.now()}-${Math.random()}`,
          color: drawing.color || DRAWING_CONFIG.DEFAULT_COLOR,
          strokeWidth: drawing.strokeWidth || DRAWING_CONFIG.DEFAULT_STROKE_WIDTH
        };
      }
    }
    
    // Si path ya es array, validarlo y mantenerlo
    if (Array.isArray(drawing.path)) {
      return {
        ...drawing,
        path: drawing.path,
        id: drawing.id || `drawing-${Date.now()}-${Math.random()}`,
        color: drawing.color || DRAWING_CONFIG.DEFAULT_COLOR,
        strokeWidth: drawing.strokeWidth || DRAWING_CONFIG.DEFAULT_STROKE_WIDTH
      };
    }

    // Si path no es válido, crear un dibujo vacío
    console.warn('Invalid drawing path:', drawing.path);
    return {
      ...drawing,
      path: [],
      id: drawing.id || `drawing-${Date.now()}-${Math.random()}`,
      color: drawing.color || DRAWING_CONFIG.DEFAULT_COLOR,
      strokeWidth: drawing.strokeWidth || DRAWING_CONFIG.DEFAULT_STROKE_WIDTH
    };
  }).filter(Boolean); // Filtrar elementos null
};

/**
 * Convierte un array de coordenadas a un path SVG
 * @param {Array} coordinates - Array de coordenadas {x, y}
 * @returns {string} Path SVG
 */
export const coordinatesToSVGPath = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return '';
  }
  
  return `M ${coordinates.map(point => `${point.x},${point.y}`).join(' L ')}`;
};

/**
 * Valida si un dibujo tiene suficientes puntos para ser renderizado
 * @param {Object} drawing - Objeto de dibujo
 * @returns {boolean} True si es válido para renderizar
 */
export const isValidDrawingForRender = (drawing) => {
  return drawing && 
         Array.isArray(drawing.path) && 
         drawing.path.length >= DRAWING_CONFIG.MIN_POINTS_FOR_PATH;
};

/**
 * Crea un nuevo objeto de dibujo
 * @param {Array} path - Array de coordenadas
 * @param {string} color - Color del dibujo
 * @param {number} strokeWidth - Grosor del trazo
 * @returns {Object} Nuevo objeto de dibujo
 */
export const createDrawing = (path, color = DRAWING_CONFIG.DEFAULT_COLOR, strokeWidth = DRAWING_CONFIG.DEFAULT_STROKE_WIDTH) => {
  return {
    id: `drawing-${Date.now()}-${Math.random()}`,
    path: path || [],
    color,
    strokeWidth
  };
};