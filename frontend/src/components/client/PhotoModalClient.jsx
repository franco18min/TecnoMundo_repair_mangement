import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import ZoomableImage from '../orders/OrderModal/PhotoBoard/ZoomableImage/ZoomableImage';

export const PhotoModalClient = ({
  selectedPhoto,
  onClose,
}) => {
  const [markers, setMarkers] = useState([]);
  const [drawings, setDrawings] = useState([]);

  // Cargar marcadores y dibujos cuando cambia la foto seleccionada
  useEffect(() => {
    if (selectedPhoto) {
      setMarkers(selectedPhoto.markers || []);
      setDrawings(selectedPhoto.drawings || []);
    }
  }, [selectedPhoto]);

  if (!selectedPhoto) return null;

  return (
    <motion.div
      className="relative bg-white max-w-6xl w-full max-h-[90vh] rounded-xl shadow-2xl p-8 overflow-y-auto m-4"
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.9, y: -20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.9, y: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Botón de cerrar */}
      <motion.button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full text-xl font-bold shadow-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center z-50"
        aria-label="Cerrar"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <X size={16} />
      </motion.button>

      {/* Header del modal para cliente */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Eye className="w-5 h-5 text-indigo-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">
            Foto de Diagnóstico
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Visualización de la documentación técnica de su reparación
        </p>
      </div>

      {/* ZoomableImage del OrderModal - MODO SOLO LECTURA */}
      <ZoomableImage
        src={selectedPhoto.photo}
        alt={selectedPhoto.note || 'Foto de diagnóstico'}
        className="w-full h-96 rounded-lg mb-6 bg-gray-50"
        markers={markers}
        drawings={drawings}
        onAddMarker={() => {}} // Función vacía - no permite agregar
        onClearMarkers={() => {}} // Función vacía - no permite limpiar
        onAddDrawing={() => {}} // Función vacía - no permite dibujar
        onClearDrawings={() => {}} // Función vacía - no permite limpiar
        onSaveAnnotations={() => {}} // Función vacía - no permite guardar
        isSavingAnnotations={false}
        canEdit={false} // CLAVE: Deshabilitar edición
      />

      {/* Información de la foto */}
      {selectedPhoto.note && (
        <motion.div
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Notas del Técnico:
          </h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            {selectedPhoto.note}
          </p>
        </motion.div>
      )}

      {/* Información adicional para el cliente */}
      <motion.div
        className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-indigo-800 font-medium">
              Documentación Técnica
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              Esta imagen muestra el estado de su dispositivo durante el proceso de reparación. 
              Los marcadores y anotaciones fueron realizados por nuestro técnico especializado.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PhotoModalClient;