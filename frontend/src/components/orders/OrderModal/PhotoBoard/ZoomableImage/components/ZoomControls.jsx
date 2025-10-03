import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Search } from 'lucide-react';

/**
 * Componente ZoomControls para controles de zoom
 * @param {Object} props - Props del componente
 * @param {boolean} props.isZoomed - Si está en modo zoom
 * @param {number} props.zoomLevel - Nivel de zoom actual
 * @param {Function} props.onToggleZoom - Callback para activar/desactivar zoom
 * @param {Function} props.onZoomIn - Callback para aumentar zoom
 * @param {Function} props.onZoomOut - Callback para disminuir zoom
 * @param {Function} props.onResetZoom - Callback para resetear zoom
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente ZoomControls
 */
const ZoomControls = ({
  isZoomed,
  zoomLevel,
  onToggleZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botón de activar/desactivar zoom */}
      <button
        onClick={onToggleZoom}
        className={`
          p-2 rounded-lg transition-all duration-200 flex items-center gap-2
          ${isZoomed 
            ? 'bg-blue-500 text-white shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
        title={isZoomed ? 'Desactivar zoom' : 'Activar zoom'}
        aria-label={isZoomed ? 'Desactivar zoom' : 'Activar zoom'}
      >
        <Search size={16} />
        <span className="text-sm font-medium">
          {isZoomed ? 'Zoom ON' : 'Zoom'}
        </span>
      </button>

      {/* Controles de zoom (solo visibles cuando está activo) */}
      {isZoomed && (
        <>
          {/* Botón zoom out */}
          <button
            onClick={onZoomOut}
            disabled={zoomLevel <= 1}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${zoomLevel <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title="Disminuir zoom"
            aria-label="Disminuir zoom"
          >
            <ZoomOut size={16} />
          </button>

          {/* Indicador de nivel de zoom */}
          <div className="px-3 py-1 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          {/* Botón zoom in */}
          <button
            onClick={onZoomIn}
            disabled={zoomLevel >= 5}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${zoomLevel >= 5
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title="Aumentar zoom"
            aria-label="Aumentar zoom"
          >
            <ZoomIn size={16} />
          </button>

          {/* Botón reset zoom */}
          <button
            onClick={onResetZoom}
            className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
            title="Resetear zoom"
            aria-label="Resetear zoom"
          >
            <RotateCcw size={16} />
          </button>
        </>
      )}
    </div>
  );
};

export default ZoomControls;