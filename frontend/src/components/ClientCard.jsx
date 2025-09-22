// frontend/src/components/ClientCard.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Fingerprint, Edit, History } from 'lucide-react';

export function ClientCard({ client, onEdit }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
        >
            <div className="p-5 flex-1">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{client.first_name} {client.last_name}</h3>
                        <p className="text-sm text-gray-500">Cliente Registrado</p>
                    </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Fingerprint size={16} className="text-gray-400" />
                        <span>{client.dni || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span>{client.phone_number || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div className="border-t bg-gray-50/50 p-3 flex justify-end gap-2">
                <button className="text-sm flex items-center gap-2 text-gray-600 font-semibold py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
                    <History size={16} /> Ver Órdenes
                </button>
                <button
                    onClick={() => onEdit(client)}
                    className="text-sm flex items-center gap-2 bg-indigo-50 text-indigo-700 font-semibold py-2 px-3 rounded-md hover:bg-indigo-100 transition-colors"
                >
                    <Edit size={16} /> Editar
                </button>
            </div>
        </motion.div>
    );
}