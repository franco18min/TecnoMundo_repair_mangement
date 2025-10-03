import React from 'react';
import { COLORS } from '../utils/constants.js';

/**
 * Componente ColorPicker para selección de colores
 * @param {Object} props - Props del componente
 * @param {string} props.selectedColor - Color actualmente seleccionado
 * @param {Function} props.onColorChange - Callback cuando cambia el color
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente ColorPicker
 */
const ColorPicker = ({ 
  selectedColor, 
  onColorChange, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          className={`
            w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110
            ${selectedColor === color 
              ? 'border-gray-800 shadow-lg scale-110' 
              : 'border-gray-300 hover:border-gray-500'
            }
          `}
          style={{ backgroundColor: color }}
          title={`Seleccionar color ${color}`}
          aria-label={`Seleccionar color ${color}`}
        />
      ))}
    </div>
  );
};

export default ColorPicker;