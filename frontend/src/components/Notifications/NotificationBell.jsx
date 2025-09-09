import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
  const { notifications } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <motion.button
          onClick={() => setIsPanelOpen(true)}
          className="relative bg-indigo-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bell size={28} />
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              {unreadCount}
            </motion.div>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isPanelOpen && <NotificationPanel onClose={() => setIsPanelOpen(false)} />}
      </AnimatePresence>
    </>
  );
}