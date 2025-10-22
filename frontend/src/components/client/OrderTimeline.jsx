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

  // NUEVO: clases de color para el anillo de pulso según el estado
  const getRingClass = (color) => {
    switch (color) {
      case 'red': return 'ring-red-300';
      case 'blue': return 'ring-blue-300';
      case 'yellow': return 'ring-yellow-300';
      case 'green': return 'ring-green-300';
      case 'indigo': return 'ring-indigo-300';
      default: return 'ring-blue-300';
    }
  };

  // NUEVO: iconos animados por estado actual
  const renderAnimatedIcon = (IconComponent, stepName, stepStatus) => {
    if (stepStatus !== 'current') {
      return <IconComponent size={20} className={stepStatus === 'pending' ? 'text-gray-400' : 'text-white'} />;
    }
    switch (stepName) {
      case 'Pendiente':
        return (
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <IconComponent size={20} className="text-white" />
          </motion.div>
        );
      case 'Esperando repuesto':
        return (
          <motion.div animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <IconComponent size={20} className="text-white" />
          </motion.div>
        );
      case 'En proceso':
        return (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 3 }}>
            <IconComponent size={20} className="text-white" />
          </motion.div>
        );
      case 'Completado':
        return (
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <IconComponent size={20} className="text-white" />
          </motion.div>
        );
      case 'Entregado':
        return (
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <IconComponent size={20} className="text-white" />
          </motion.div>
        );
      default:
        return <IconComponent size={20} className="text-white" />;
    }
  };

  // NUEVO: subtexto por estado actual (evitar "En progreso..." cuando Entregado)
  const getCurrentSubtext = (stepName) => {
    switch (stepName) {
      case 'Pendiente':
        return 'Orden en cola...';
      case 'Esperando repuesto':
        return 'Esperando repuestos...';
      case 'En proceso':
        return 'En progreso...';
      case 'Completado':
        return 'Esperando retiro del cliente...';
      case 'Entregado':
        return null; // No mostrar subtexto en entregado
      default:
        return null;
    }
  };

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
      
      {/* Timeline horizontal (desktop) */}
      <div className="relative hidden md:block">
        {/* Línea de progreso */}
        <motion.div
          key={currentStepIndex}
          className="absolute top-6 left-6 right-6 z-0 px-6 pointer-events-none"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center gap-0.5">
            {Array.from({ length: timelineSteps.length - 1 }).map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-gray-200 relative overflow-hidden rounded-full">
                <motion.div
                  variants={segmentVariants}
                  custom={i < (currentStepIndex - 1)}
                  transition={{ duration: segmentDuration, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                />
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Pasos del timeline */}
        <div className="flex justify-between relative z-10">
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
                {/* Icono con marco pulsante */}
                <div className="relative mb-3">
                  {stepStatus === 'current' && (
                    <motion.span
                      className={`absolute -inset-1 rounded-full ring-4 ${getRingClass(step.color)} ring-opacity-40 pointer-events-none`}
                      animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                  )}
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${colors.bg} ${colors.border}`}>
                    {renderAnimatedIcon(IconComponent, step.name, stepStatus)}
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="space-y-1">
                  <h4 className={`font-semibold text-sm ${stepStatus === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                    {step.name}
                  </h4>
                  <p className={`text-xs ${stepStatus === 'pending' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                  
                  {/* Subtexto por estado actual */}
                  {stepStatus === 'current' && (() => {
                    const subtext = getCurrentSubtext(step.name);
                    return subtext ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-blue-600 font-medium">
                        {subtext}
                      </motion.div>
                    ) : null;
                  })()}
                  
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

      {/* Timeline vertical (mobile) */}
      <div className="md:hidden space-y-3">
        {timelineSteps.map((step, index) => {
          const stepStatus = getStepStatus(index + 1);
          const IconComponent = step.icon;
          const colors = getColorClasses(step.color, stepStatus);
          const subtext = getCurrentSubtext(step.name);
          
          return (
            <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${colors.bg} ${colors.border}`}>
                {renderAnimatedIcon(IconComponent, step.name, stepStatus)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${stepStatus === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>{step.name}</div>
                <div className={`text-xs ${stepStatus === 'pending' ? 'text-gray-300' : 'text-gray-600'} break-words leading-snug`}>{step.description}</div>
                {stepStatus === 'current' && subtext && (
                  <div className="text-xs text-blue-600 font-medium mt-1">{subtext}</div>
                )}
                {stepStatus === 'completed' && step.name === 'Pendiente' && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(orderDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Eliminado: Progreso general */}
    </motion.div>
  );
};

export default OrderTimeline;

// NUEVO: animación secuencial de segmentos de la línea de progreso
const segmentDuration = 0.5; // segundos por segmento
const containerVariants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0.3,
      staggerChildren: segmentDuration,
      staggerDirection: 1
    }
  }
};
const segmentVariants = {
  initial: { width: 0 },
  animate: (fill) => ({ width: fill ? '100%' : '0%' })
};