import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Wrench,
  DollarSign,
  Calendar
} from 'lucide-react';

const DiagnosisSection = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Verificar que order existe antes de acceder a sus propiedades
  if (!order) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <p className="text-gray-500">Cargando información del diagnóstico...</p>
      </div>
    );
  }

  const hasDiagnosis = order.technician_diagnosis || order.repair_notes || order.total_cost;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'No especificada';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiagnosisIcon = () => {
    if (!hasDiagnosis) return Clock;
    if (order.status?.name === 'Reparado') return CheckCircle;
    if (order.status?.name === 'En Reparación') return Wrench;
    return AlertTriangle;
  };

  const getDiagnosisColor = () => {
    if (!hasDiagnosis) return 'text-gray-500 bg-gray-100';
    if (order.status?.name === 'Reparado') return 'text-green-600 bg-green-100';
    if (order.status?.name === 'En Reparación') return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const DiagnosisIcon = getDiagnosisIcon();

  if (!hasDiagnosis) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
      >
        <div className="text-center py-8">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Diagnóstico Pendiente</h3>
          <p className="text-gray-500">El técnico está evaluando tu dispositivo</p>
          <div className="mt-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-3 bg-white/20 rounded-full backdrop-blur-sm mr-4"
            >
              <DiagnosisIcon className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">Diagnóstico Técnico</h3>
              <p className="text-purple-100 text-sm">Evaluación profesional</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {/* Diagnóstico principal */}
              {order.technician_diagnosis && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <FileText className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">Diagnóstico</h4>
                  </div>
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed">{order.technician_diagnosis}</p>
                  </div>
                </div>
              )}

              {/* Descripción de la reparación */}
              {order.repair_notes && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <Wrench className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">Notas de Reparación</h4>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed">{order.repair_notes}</p>
                  </div>
                </div>
              )}



              {/* Observaciones adicionales */}
              {order.observations && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">Observaciones</h4>
                  </div>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed">{order.observations}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiagnosisSection;