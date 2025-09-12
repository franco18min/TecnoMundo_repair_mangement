//frontend/src/components/Notifications/NotificationToast.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function NotificationToast() {
  const { notifications } = useAuth();
  const [visibleNotification, setVisibleNotification] = useState(null);
  const [timerId, setTimerId] = useState(null);

  // Efecto para MOSTRAR la notificación más reciente
  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].is_read) {
      const latestNotification = notifications[0];
      if (latestNotification.id !== visibleNotification?.id) {
        setVisibleNotification(latestNotification);
      }
    }
  }, [notifications]);

  // Efecto para GESTIONAR EL TEMPORIZADOR de auto-cierre
  useEffect(() => {
    if (visibleNotification) {
      const newTimerId = setTimeout(() => {
        handleClose();
      }, 7000);
      setTimerId(newTimerId);

      // Limpieza: se ejecuta si el componente se desmonta o la notificación cambia
      return () => clearTimeout(newTimerId);
    }
  }, [visibleNotification]);

  const handleClose = () => {
    if (timerId) clearTimeout(timerId);
    setVisibleNotification(null);
  };

  const handleMouseEnter = () => {
    if (timerId) clearTimeout(timerId);
  };

  const handleMouseLeave = () => {
    const newTimerId = setTimeout(handleClose, 2000); // Cierra 2s después de quitar el mouse
    setTimerId(newTimerId);
  };

  return (
    <AnimatePresence>
      {visibleNotification && (
        <motion.div
          className="fixed bottom-24 right-5 bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-sm p-4 z-50 flex items-start space-x-4"
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.5, transition: { duration: 0.3 } }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Nueva Notificación</h4>
            <p className="text-sm text-gray-600 mt-1">{visibleNotification.message}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}