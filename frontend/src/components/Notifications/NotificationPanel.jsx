import React from 'react';
import { motion } from 'framer-motion';
import { Bell, X, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function NotificationPanel({ onClose }) {
  const { notifications, markAsRead } = useAuth();

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    // Aquí se podría añadir lógica de navegación con notification.link_to
    onClose();
  };

  const handleMarkAllAsRead = () => {
      notifications.forEach(n => {
          if (!n.is_read) {
              markAsRead(n.id);
          }
      });
  };

  return (
    <motion.div
      className="fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Notificaciones</h2>
        <div className="flex items-center gap-4">
            <button onClick={handleMarkAllAsRead} className="text-indigo-600 hover:text-indigo-800" title="Marcar todas como leídas">
                <CheckCheck size={20} />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 ${
                notification.is_read ? 'hover:bg-gray-50' : 'bg-indigo-50 hover:bg-indigo-100'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${notification.is_read ? 'bg-gray-300' : 'bg-indigo-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-semibold">No tienes notificaciones</p>
            <p className="text-sm">Las nuevas alertas aparecerán aquí.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}