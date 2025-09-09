import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function NotificationToast() {
  const { notifications } = useAuth();
  const [visibleNotification, setVisibleNotification] = useState(null);

  useEffect(() => {
    // Detectamos si la primera notificación de la lista es nueva y no leída
    if (notifications.length > 0 && !notifications[0].is_read) {
      const latestNotification = notifications[0];
      // Para evitar mostrar la misma notificación repetidamente si el estado se actualiza por otras razones
      if (latestNotification.id !== visibleNotification?.id) {
        setVisibleNotification(latestNotification);

        // Ocultar automáticamente después de 7 segundos
        const timer = setTimeout(() => {
          setVisibleNotification(null);
        }, 7000);

        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  if (!visibleNotification) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-24 right-5 bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-sm p-4 z-50 flex items-start space-x-4"
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
          <Bell size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">Nueva Notificación</h4>
          <p className="text-sm text-gray-600 mt-1">{visibleNotification.message}</p>
        </div>
        <button onClick={() => setVisibleNotification(null)} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}