import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, KeyRound, Fingerprint } from 'lucide-react';

export function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState('user'); // 'user' o 'client'

  const activeTabClasses = "bg-indigo-600 text-white";
  const inactiveTabClasses = "text-gray-600 hover:bg-gray-200 hover:text-gray-800";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <motion.div
        className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, scale: 0.9, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Bienvenido a TecnoMundo</h2>
        <p className="text-center text-gray-500 mb-8">Inicia sesión para continuar</p>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setLoginType('user')}
            className={`w-1/2 p-2 rounded-md font-semibold transition-colors duration-300 ${loginType === 'user' ? activeTabClasses : inactiveTabClasses}`}
          >
            Usuario
          </button>
          <button
            onClick={() => setLoginType('client')}
            className={`w-1/2 p-2 rounded-md font-semibold transition-colors duration-300 ${loginType === 'client' ? activeTabClasses : inactiveTabClasses}`}
          >
            Cliente
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={loginType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={(e) => { e.preventDefault(); onLogin(); }}
          >
            {loginType === 'user' ? (
              <>
                <div className="relative mb-4">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" placeholder="Nombre de usuario" className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
                <div className="relative mb-6">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="password" placeholder="Contraseña" className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
              </>
            ) : (
              <div className="relative mb-6">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="DNI o N° de Orden" className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
            )}
            <motion.button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Ingresar
            </motion.button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}