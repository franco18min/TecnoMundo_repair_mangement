import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, KeyRound, Fingerprint } from 'lucide-react';
import { loginUser } from '../api/authApi';

export function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeTabClasses = "bg-indigo-600 text-white";
  const inactiveTabClasses = "text-gray-600 hover:bg-gray-200 hover:text-gray-800";

  // Esta función ahora es más robusta para garantizar que el estado se actualice.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginType !== 'user') {
      setError('El inicio de sesión para clientes aún no está implementado.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await loginUser(username, password);
      onLogin(); // Llama a la función de App.jsx para cambiar de página
    } catch (err) {
      console.error("Error de inicio de sesión:", err);
      // Nos aseguramos de que el mensaje de error se muestre
      setError(err.message || 'No se pudo iniciar sesión. Verifica tus credenciales.');
    } finally {
      // Este bloque es CRUCIAL. Se ejecuta siempre, sin importar si hubo éxito o error.
      // Garantiza que la aplicación nunca se quede "colgada".
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <motion.div
        className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, scale: 0.9, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Bienvenido</h2>
        <p className="text-center text-gray-500 mb-6">Inicia sesión para continuar</p>

        {/* Mensaje de error */}
        {error && <p className="text-red-500 text-center text-sm mb-4 animate-pulse">{error}</p>}

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => { setLoginType('user'); setError(''); }}
            className={`w-1/2 p-2 rounded-md font-semibold transition-colors duration-300 ${loginType === 'user' ? activeTabClasses : inactiveTabClasses}`}
          >
            Usuario
          </button>
          <button
            onClick={() => { setLoginType('client'); setError(''); }}
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
            onSubmit={handleSubmit}
          >
            {loginType === 'user' ? (
              <>
                <div className="relative mb-4">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="relative mb-6">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
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
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 disabled:bg-indigo-400"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </motion.button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}