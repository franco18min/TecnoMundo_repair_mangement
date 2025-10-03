import React from 'react';
import { MapPin, Pen, Save, Trash2 } from 'lucide-react';
import ColorPicker from './ColorPicker.jsx';

/**
 * Componente AnnotationControls para controles de anotaciones
 * @param {Object} props - Props del componente
 * @param {boolean} props.isMarkerMode - Si está en modo marcador
 * @param {boolean} props.isDrawMode - Si está en modo dibujo
 * @param {string} props.selectedColor - Color seleccionado
 * @param {Function} props.onToggleMarkerMode - Callback para activar/desactivar modo marcador
 * @param {Function} props.onToggleDrawMode - Callback para activar/desactivar modo dibujo
 * @param {Function} props.onColorChange - Callback cuando cambia el color
 * @param {Function} props.onSave - Callback para guardar anotaciones
 * @param {Function} props.onClear - Callback para limpiar anotaciones
 * @param {boolean} props.hasAnnotations - Si hay anotaciones para guardar/limpiar
 * @param {boolean} props.isSaving - Si está guardando
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente AnnotationControls
 */
const AnnotationControls = ({
  isMarkerMode,
  isDrawMode,
  selectedColor,
  onToggleMarkerMode,
  onToggleDrawMode,
  onColorChange,
  onSave,
  onClear,
  hasAnnotations = false,
  isSaving = false,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controles de modo */}
      <div className="flex items-center gap-2">
        {/* Botón modo marcador */}
        <button
          onClick={onToggleMarkerMode}
          className={`
            p-2 rounded-lg transition-all duration-200 flex items-center gap-2
            ${isMarkerMode 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
          title={isMarkerMode ? 'Desactivar modo marcador' : 'Activar modo marcador'}
          aria-label={isMarkerMode ? 'Desactivar modo marcador' : 'Activar modo marcador'}
        >
          <MapPin size={16} />
          <span className="text-sm font-medium">
            {isMarkerMode ? 'Marcador ON' : 'Marcador'}
          </span>
        </button>

        {/* Botón modo dibujo */}
        <button
          onClick={onToggleDrawMode}
          className={`
            p-2 rounded-lg transition-all duration-200 flex items-center gap-2
            ${isDrawMode 
              ? 'bg-green-500 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
          title={isDrawMode ? 'Desactivar modo dibujo' : 'Activar modo dibujo'}
          aria-label={isDrawMode ? 'Desactivar modo dibujo' : 'Activar modo dibujo'}
        >
          <Pen size={16} />
          <span className="text-sm font-medium">
            {isDrawMode ? 'Dibujo ON' : 'Dibujo'}
          </span>
        </button>
      </div>

      {/* Selector de color (solo visible cuando hay un modo activo) */}
      {(isMarkerMode || isDrawMode) && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Color:
          </label>
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={onColorChange}
          />
        </div>
      )}

      {/* Controles de acción */}
      {hasAnnotations && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          {/* Botón guardar */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`
              p-2 rounded-lg transition-all duration-200 flex items-center gap-2
              ${isSaving
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
            title="Guardar anotaciones"
            aria-label="Guardar anotaciones"
          >
            <Save size={16} />
            <span className="text-sm font-medium">
              {isSaving ? 'Guardando...' : 'Guardar'}
            </span>
          </button>

          {/* Botón limpiar */}
          <button
            onClick={onClear}
            disabled={isSaving}
            className={`
              p-2 rounded-lg transition-all duration-200 flex items-center gap-2
              ${isSaving
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
              }
            `}
            title="Limpiar anotaciones"
            aria-label="Limpiar anotaciones"
          >
            <Trash2 size={16} />
            <span className="text-sm font-medium">
              Limpiar
            </span>
          </button>
        </div>
      )}

      {/* Indicador de modo activo */}
      {(isMarkerMode || isDrawMode) && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
          {isMarkerMode && 'Haz clic en la imagen para añadir marcadores'}
          {isDrawMode && 'Mantén presionado y arrastra para dibujar'}
        </div>
      )}
    </div>
  );
};

export default AnnotationControls;