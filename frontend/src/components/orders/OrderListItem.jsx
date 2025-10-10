// frontend/src/components/OrderListItem.jsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle, AlertTriangle, Clock, Truck, XCircle, Archive } from 'lucide-react';

const statusConfig = {
    'Pending': { text: 'Pendiente', icon: <AlertTriangle size={16} className="text-red-600" /> },
    'In Process': { text: 'En Proceso', icon: <Wrench size={16} className="text-yellow-600" /> },
    'Completed': { text: 'Completado', icon: <CheckCircle size={16} className="text-green-600" /> },
    'Waiting for parts': { text: 'Esperando Repuesto', icon: <Clock size={16} className="text-blue-600" /> },
    'Delivered': { text: 'Entregado', icon: <Truck size={16} className="text-indigo-600" /> },
    'Cancelled': { text: 'Cancelado', icon: <XCircle size={16} className="text-gray-600" /> },
    'Default': { text: 'Desconocido', icon: <Archive size={16} className="text-gray-500" /> }
};

export function OrderListItem({ order, onClick }) {
    const currentStatus = useMemo(() => statusConfig[order.status] || statusConfig['Default'], [order.status]);
    const deviceName = `${order.device?.type || 'N/A'} ${order.device?.model || ''}`.trim();
    const formattedDate = new Date(order.dateReceived).toLocaleDateString();

    return (
        <button
            onClick={onClick}
            className="w-full text-left flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                    {currentStatus.icon}
                </div>
                <div>
                    <p className="font-bold text-gray-800">{deviceName}</p>
                    <p className="text-sm text-gray-500">
                        Orden #{String(order.id).padStart(6, '0')}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-semibold text-sm text-gray-700">{currentStatus.text}</p>
                <p className="text-xs text-gray-400">{formattedDate}</p>
            </div>
        </button>
    );
}