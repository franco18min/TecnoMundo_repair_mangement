// frontend/src/components/OrderCard.jsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle, AlertTriangle, Clock, Archive, Truck, XCircle } from 'lucide-react';

// --- INICIO DE LA MODIFICACIÓN ---
// Añadimos la prop 'onClick'
export function OrderCard({ order, onClick }) {
// --- FIN DE LA MODIFICACIÓN ---

  const statusStyles = useMemo(() => ({
      'Pending': { text: 'Pendiente', badge: 'bg-red-100 text-red-800 border-red-200', border: 'border-t-red-400', icon: <AlertTriangle size={16} className="text-red-600" />},
      'In Process': { text: 'En Proceso', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', border: 'border-t-yellow-400', icon: <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 4 }}><Wrench size={16} className="text-yellow-600" /></motion.div>},
      'Waiting for parts': { text: 'Esperando Repuesto', badge: 'bg-blue-100 text-blue-800 border-blue-200', border: 'border-t-blue-400', icon: <Clock size={16} className="text-blue-600" />},
      'Completed': { text: 'Completado', badge: 'bg-green-100 text-green-800 border-green-200', border: 'border-t-green-400', icon: <CheckCircle size={16} className="text-green-600" />},
      'Delivered': { text: 'Entregado', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', border: 'border-t-indigo-400', icon: <Truck size={16} className="text-indigo-600" />},
      'Cancelled': { text: 'Cancelado', badge: 'bg-gray-200 text-gray-800 border-gray-300', border: 'border-t-gray-400', icon: <XCircle size={16} className="text-gray-600" />},
      'Default': { text: order.status, badge: 'bg-gray-100 text-gray-800 border-gray-200', border: 'border-t-gray-400', icon: <Archive size={16} className="text-gray-600" />}
  }), [order.status]);

  const currentStatus = statusStyles[order.status] || statusStyles['Default'];
  const deviceName = `${order.device_type?.type_name || 'N/A'} ${order.device_model || ''}`.trim();

  return (
    // --- INICIO DE LA MODIFICACIÓN ---
    // Envolvemos el div en un 'button' para hacerlo completamente clicable
    <motion.button
      onClick={onClick}
      className={`w-full text-left bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 ${currentStatus.border}`}
      whileHover={{ y: -8, scale: 1.03 }}
      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
    {/* --- FIN DE LA MODIFICACIÓN --- */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-bold text-indigo-600">#{order.id}</p>
            <h3 className="text-lg font-semibold text-gray-800">{deviceName}</h3>
            <p className="text-sm text-gray-500">{order.customer.name}</p>
          </div>
          <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border ${currentStatus.badge}`}>
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm text-gray-500">
          <span>Técnico: <span className="font-medium text-gray-700">{order.assignedTechnician?.name || 'No asignado'}</span></span>
          <span>{new Date(order.dateReceived).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.button>
  );
}