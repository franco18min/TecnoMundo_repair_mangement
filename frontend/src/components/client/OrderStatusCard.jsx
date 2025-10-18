import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, Wrench, Package, Truck } from 'lucide-react';
import { translateOrderStatus } from '../../utils/statusTranslations';

const OrderStatusCard = ({ order }) => {
  const getStatusIcon = (status) => {
    const icons = {
      'Recibido': Clock,
      'En Diagnóstico': AlertCircle,
      'En Reparación': Wrench,
      'Reparado': CheckCircle,
      'Listo para Entrega': Package,
      'Entregado': Truck
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Recibido': 'text-blue-600 bg-blue-100',
      'En Diagnóstico': 'text-yellow-600 bg-yellow-100',
      'En Reparación': 'text-orange-600 bg-orange-100',
      'Reparado': 'text-green-600 bg-green-100',
      'Listo para Entrega': 'text-purple-600 bg-purple-100',
      'Entregado': 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const StatusIcon = getStatusIcon(order.status?.status_name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Orden #{order.id}</h2>
            <p className="text-blue-100 mt-1">
              {new Date(order.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="p-3 bg-white/20 rounded-full backdrop-blur-sm"
          >
            <StatusIcon className="w-8 h-8" />
          </motion.div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Información del dispositivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-2">Dispositivo</h4>
            <p className="text-gray-600">{order.device_model || 'No especificado'}</p>
            {order.device_type?.name && (
              <p className="text-sm text-gray-500 mt-1">Tipo: {order.device_type.name}</p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-2">Problema Reportado</h4>
            <p className="text-gray-600">{order.problem_description || 'No especificado'}</p>
            {order.accesories && (
              <p className="text-sm text-gray-500 mt-1">Accesorios: {order.accesories}</p>
            )}
          </div>
        </div>



        {/* Sucursal */}
        {order.branch && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-2">Sucursal</h4>
            <p className="text-gray-600">{order.branch.name}</p>
            {order.branch.address && (
              <p className="text-sm text-gray-500 mt-1">{order.branch.address}</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderStatusCard;