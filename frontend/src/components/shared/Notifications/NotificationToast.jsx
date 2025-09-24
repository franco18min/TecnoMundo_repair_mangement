// frontend/src/components/Notifications/NotificationToast.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function NotificationToast({ onNotificationClick }) {
  const { notifications, markAsRead } = useAuth();
  const [visibleNotification, setVisibleNotification] = useState(null);
  const [timerId, setTimerId] = useState(null);

  // --- INICIO DE LA CORRECCIÓN DEFINITIVA ---
  // El useEffect ahora solo depende de `notifications`.
  useEffect(() => {
    // Buscamos la primera notificación en la lista que realmente no esté leída.
    const firstUnread = notifications.find(n => !n.is_read);

    // Lógica declarativa:
    // Si encontramos una notificación no leída, esa es la que debe estar visible.
    if (firstUnread) {
      setVisibleNotification(firstUnread);
    } else {
      // Si no hay ninguna notificación no leída, no debe haber ninguna visible.
      setVisibleNotification(null);
    }
  }, [notifications]); // La única dependencia es la fuente de verdad externa.
  // --- FIN DE LA CORRECCIÓN DEFINITIVA ---

  // Efecto para el temporizador de auto-cierre
  useEffect(() => {
    // Si no hay notificación visible, no hacemos nada.
    if (!visibleNotification) return;

    // Si hay una, iniciamos el temporizador para cerrarla.
    const newTimerId = setTimeout(() => {
      handleClose();
    }, 7000);
    setTimerId(newTimerId);

    // Función de limpieza para evitar fugas de memoria
    return () => clearTimeout(newTimerId);
  }, [visibleNotification]); // Este efecto SÍ depende de la notificación visible.

  // Función para cerrar el toast
  const handleClose = () => {
    if (timerId) clearTimeout(timerId);
    if (visibleNotification) {
      // Marcamos la notificación como leída en el estado global.
      // Esto actualizará `notifications` y el primer useEffect se encargará de ocultar el toast.
      markAsRead(visibleNotification.id);
    }
  };

  const handleToastClick = () => {
    if (visibleNotification && visibleNotification.link_to) {
      onNotificationClick(visibleNotification.link_to);
      handleClose();
    }
  };

  const isClickable = visibleNotification && !!visibleNotification.link_to;

  const handleMouseEnter = () => {
    if (timerId) clearTimeout(timerId);
  };

  const handleMouseLeave = () => {
    // Reiniciamos un temporizador más corto al quitar el mouse
    const newTimerId = setTimeout(handleClose, 2000);
    setTimerId(newTimerId);
  };

  return (
    <AnimatePresence>
      {visibleNotification && (
        <motion.div
          onClick={handleToastClick}
          className={`fixed bottom-24 right-5 bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-sm p-4 z-50 flex items-start space-x-4 ${
            isClickable ? 'cursor-pointer hover:bg-gray-50' : ''
          }`}
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}