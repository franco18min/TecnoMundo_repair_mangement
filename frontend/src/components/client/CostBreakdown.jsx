import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Wrench, 
  Package, 
  Clock,
  Calculator,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CostBreakdown = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Verificar que order existe antes de acceder a sus propiedades
  if (!order) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <p className="text-gray-500">Cargando información de costos...</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calcular datos de cotización desde repair_order
  const costBreakdown = {
    total: order.total_cost || 0,
    deposit: order.deposit || 0,
    balance: order.balance || 0,
    partsUsed: order.parts_used || 'No especificado'
  };

  const hasEstimate = order.total_cost && order.total_cost > 0;
  const isPaid = order.status?.name === 'Entregado';
  const isApproved = order.status?.name !== 'En Diagnóstico' && order.status?.name !== 'Recibido';

  if (!hasEstimate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
      >
        <div className="text-center py-8">
          <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Cotización Pendiente</h3>
          <p className="text-gray-500">El técnico está preparando la cotización</p>
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
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-3 bg-white/20 rounded-full backdrop-blur-sm mr-4"
            >
              <DollarSign className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">Cotización</h3>
              <p className="text-green-100 text-sm">
                {isPaid ? 'Pagado' : isApproved ? 'Aprobado' : 'Pendiente de aprobación'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-green-100">Por Pagar</p>
            <p className="text-2xl font-bold">{formatCurrency(costBreakdown.balance)}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Resumen principal */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${isPaid ? 'bg-green-600 text-white' : isApproved ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-white'}`}>
                {isPaid ? <CheckCircle className="w-5 h-5" /> : isApproved ? <CreditCard className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="ml-3">
                <p className="font-semibold text-gray-800">
                  {isPaid ? 'Pago Completado' : isApproved ? 'Cotización Aprobada' : 'Esperando Aprobación'}
                </p>
                <p className="text-sm text-gray-600">
                  {isPaid ? 'Reparación pagada en su totalidad' : isApproved ? 'Reparación en progreso' : 'Pendiente de confirmación del cliente'}
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-white rounded-full shadow-sm"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
            </motion.button>
          </div>
        </div>

        {/* Desglose detallado */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 mb-6">

                {/* Costo Total */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center">
                    <Calculator className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Costo Total</p>
                      <p className="text-sm text-gray-600">Precio total de la reparación</p>
                    </div>
                  </div>
                  <p className="font-semibold text-blue-800">{formatCurrency(costBreakdown.total)}</p>
                </motion.div>

                {/* Depósito */}
                {costBreakdown.deposit !== undefined && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">Depósito Pagado</p>
                        <p className="text-sm text-gray-600">Monto adelantado</p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-800">{formatCurrency(costBreakdown.deposit)}</p>
                  </motion.div>
                )}

                {/* Balance */}
                {costBreakdown.balance !== undefined && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-orange-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">Balance</p>
                        <p className="text-sm text-gray-600">Monto por pagar</p>
                      </div>
                    </div>
                    <p className="font-semibold text-orange-800">{formatCurrency(costBreakdown.balance)}</p>
                  </motion.div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="p-2 bg-blue-600 rounded-full mr-3 mt-1">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-1">Información de Pago</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Los precios incluyen garantía de 15 días</li>
                <li>• Aceptamos efectivo, tarjetas y transferencias</li>
                <li>• El pago se realiza al momento de la entrega</li>
                {!isApproved && <li>• Esta cotización es válida por 15 días</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Estado del pago */}
        {!isPaid && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                {isApproved 
                  ? 'El pago se realizará al momento de recoger tu dispositivo reparado.'
                  : 'Una vez apruebes esta cotización, procederemos con la reparación.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CostBreakdown;