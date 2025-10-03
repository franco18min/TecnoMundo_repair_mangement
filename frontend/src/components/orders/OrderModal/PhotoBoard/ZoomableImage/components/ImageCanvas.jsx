import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componente ImageCanvas para renderizar la imagen principal
 * @param {Object} props - Props del componente
 * @param {string} props.src - URL de la imagen
 * @param {string} props.alt - Texto alternativo de la imagen
 * @param {boolean} props.isZoomed - Si está en modo zoom
 * @param {number} props.zoomLevel - Nivel de zoom actual
 * @param {Object} props.pan - Objeto de desplazamiento {x, y}
 * @param {string} props.cursor - Cursor CSS a mostrar
 * @param {Function} props.onLoad - Callback cuando la imagen se carga
 * @param {Function} props.onError - Callback cuando hay error al cargar
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente ImageCanvas
 */
const ImageCanvas = ({
  src,
  alt = 'Imagen de diagnóstico',
  isZoomed,
  zoomLevel,
  pan,
  cursor = 'default',
  onLoad,
  onError,
  className = ''
}) => {
  // Calcular las transformaciones CSS
  const getTransformStyle = () => {
    if (!isZoomed || zoomLevel <= 1) {
      return {};
    }

    return {
      transform: `scale(${zoomLevel}) translate(${pan.x}%, ${pan.y}%)`,
      transformOrigin: 'center center'
    };
  };

  return (
    <motion.img
      src={src}
      alt={alt}
      className={`
        w-full h-full object-contain transition-transform duration-200 ease-out
        ${className}
      `}
      style={{
        cursor,
        ...getTransformStyle()
      }}
      onLoad={onLoad}
      onError={onError}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      draggable={false}
      loading="lazy"
    />
  );
};

export default ImageCanvas;