import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, Wrench, Truck, XCircle } from 'lucide-react';
import { translateOrderStatus } from '../../utils/statusTranslations';

const OrderTimeline = ({ currentStatus, orderDate }) => {
  const timelineSteps = [
    { 
      id: 1, 
      name: 'Pendiente', 
      icon: AlertTriangle, 
      description: 'Orden recibida y en espera',
      color: 'red'
    },
    { 
      id: 2, 
      name: 'Esperando repuesto', 
      icon: Clock, 
      description: 'Esperando llegada de repuestos',
      color: 'blue'
    },
    { 
      id: 3, 
      name: 'En proceso', 
      icon: Wrench, 
      description: 'Técnico trabajando en la reparación',
      color: 'yellow'
    },
    { 
      id: 4, 
      name: 'Completado', 
      icon: CheckCircle, 
      description: 'Reparación completada',
      color: 'green'
    },
    { 
      id: 5, 
      name: 'Entregado', 
      icon: Truck, 
      description: 'Equipo entregado.',
      color: 'indigo'
    }
  ];

  // Función para obtener el índice del paso actual
  const getCurrentStepIndex = (currentStatus) => {
    if (!currentStatus) return 0;
    
    // Traducir el estado actual al español para comparar
    const translatedStatus = translateOrderStatus(currentStatus);
    
    const statusMap = {
      'Pendiente': 1,
      'Esperando repuesto': 2,
      'En proceso': 3,
      'Completado': 4,
      'Entregado': 5,
      'Cancelado': 0 // Los cancelados se quedan en el inicio
    };
    
    return statusMap[translatedStatus] ?? 0;
  };

  const currentStepIndex = getCurrentStepIndex(currentStatus);

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const getColorClasses = (color, stepStatus) => {
    const colorMap = {
      red: {
        bg: stepStatus === 'completed' ? 'bg-red-500' : stepStatus === 'current' ? 'bg-red-400' : 'bg-gray-300',
        text: stepStatus === 'completed' ? 'text-red-600' : stepStatus === 'current' ? 'text-red-500' : 'text-gray-400',
        border: stepStatus === 'completed' ? 'border-red-500' : stepStatus === 'current' ? 'border-red-400' : 'border-gray-300'
      },
      blue: {
        bg: stepStatus === 'completed' ? 'bg-blue-500' : stepStatus === 'current' ? 'bg-blue-400' : 'bg-gray-300',
        text: stepStatus === 'completed' ? 'text-blue-600' : stepStatus === 'current' ? 'text-blue-500' : 'text-gray-400',
        border: stepStatus === 'completed' ? 'border-blue-500' : stepStatus === 'current' ? 'border-blue-400' : 'border-gray-300'
      },
      yellow: {
        bg: stepStatus === 'completed' ? 'bg-yellow-500' : stepStatus === 'current' ? 'bg-yellow-400' : 'bg-gray-300',
        text: stepStatus === 'completed' ? 'text-yellow-600' : stepStatus === 'current' ? 'text-yellow-500' : 'text-gray-400',
        border: stepStatus === 'completed' ? 'border-yellow-500' : stepStatus === 'current' ? 'border-yellow-400' : 'border-gray-300'
      },
      green: {
        bg: stepStatus === 'completed' ? 'bg-green-500' : stepStatus === 'current' ? 'bg-green-400' : 'bg-gray-300',
        text: stepStatus === 'completed' ? 'text-green-600' : stepStatus === 'current' ? 'text-green-500' : 'text-gray-400',
        border: stepStatus === 'completed' ? 'border-green-500' : stepStatus === 'current' ? 'border-green-400' : 'border-gray-300'
      },
      indigo: {
        bg: stepStatus === 'completed' ? 'bg-indigo-500' : stepStatus === 'current' ? 'bg-indigo-400' : 'bg-gray-300',
        text: stepStatus === 'completed' ? 'text-indigo-600' : stepStatus === 'current' ? 'text-indigo-500' : 'text-gray-400',
        border: stepStatus === 'completed' ? 'border-indigo-500' : stepStatus === 'current' ? 'border-indigo-400' : 'border-gray-300'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const getLineColor = (stepIndex) => {
    if (stepIndex < currentStepIndex) return 'bg-green-500';
    return 'bg-gray-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Estado de la Reparación</h3>
      
      {/* Timeline horizontal */}
      <div className="relative">
        {/* Línea de progreso */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, (currentStepIndex - 1) / (timelineSteps.length - 1)) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
        
        {/* Pasos del timeline */}
        <div className="flex justify-between relative">
          {timelineSteps.map((step, index) => {
            const stepStatus = getStepStatus(index + 1);
            const IconComponent = step.icon;
            const colors = getColorClasses(step.color, stepStatus);
            
            return (
              <motion.div
                key={step.id}
                className="flex flex-col items-center text-center max-w-32"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {/* Icono */}
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 ${colors.bg} ${colors.border} ${stepStatus === 'current' ? 'ring-4 ring-opacity-30' : ''}`}>
                  {stepStatus === 'current' && step.name === 'En proceso' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, ease: 'linear', duration: 4 }}
                    >
                      <IconComponent size={20} className="text-white" />
                    </motion.div>
                  ) : (
                    <IconComponent size={20} className={stepStatus === 'pending' ? 'text-gray-400' : 'text-white'} />
                  )}
                </div>
                
                {/* Contenido */}
                <div className="space-y-1">
                  <h4 className={`font-semibold text-sm ${stepStatus === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                    {step.name}
                  </h4>
                  <p className={`text-xs ${stepStatus === 'pending' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                  
                  {stepStatus === 'current' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-blue-600 font-medium"
                    >
                      {step.name === 'Completado' ? 'Esperando retiro del cliente...' : 'En progreso...'}
                    </motion.div>
                  )}
                  
                  {stepStatus === 'current' && step.name === 'Entregado' && (
                    <></>
                  )}
                  
                  {stepStatus === 'completed' && step.name === 'Pendiente' && (
                    <div className="text-xs text-gray-500">
                      {new Date(orderDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Progreso general */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso General</span>
          <span className="text-sm font-bold text-blue-600">
            {Math.round((currentStepIndex / timelineSteps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStepIndex / timelineSteps.length) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default OrderTimeline;