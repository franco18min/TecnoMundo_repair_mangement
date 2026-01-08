// frontend/src/components/shared/layout/MobileBottomBar.jsx

import React from 'react';
import { LogOut, User, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

export function MobileBottomBar({ onLogout }) {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
    >
      <div className="max-w-screen-md mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            {currentUser.username?.[0]?.toUpperCase() || <User size={16} />}
          </div>
          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800 truncate max-w-[160px]">
                {currentUser.username}
              </span>
            </div>
            {currentUser.branch?.branch_name && (
              <div className="flex items-center gap-1 text-xs text-gray-500 truncate max-w-[200px]">
                <Building size={12} className="text-gray-400" />
                <span>{currentUser.branch.branch_name}</span>
              </div>
            )}
          </div>
        </div>

        <motion.button
          onClick={() => onLogout()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Cerrar sesión"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Salir</span>
        </motion.button>
      </div>
    </motion.div>
  );
}