import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

const icons = {
    success: <CheckCircle className="text-green-500" />,
    error: <AlertTriangle className="text-red-500" />,
    info: <Info className="text-blue-500" />,
};

const styleClasses = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
};

export function Toast({ message, type }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`flex items-start p-4 w-full max-w-sm bg-white border rounded-lg shadow-lg ${styleClasses[type]}`}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
            <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 leading-snug break-words">{message}</p>
            </div>
            {/* Se ha eliminado el botón X de aquí */}
        </motion.div>
    );
}