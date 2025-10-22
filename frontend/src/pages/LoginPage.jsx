// frontend/src/pages/LoginPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, KeyRound, Fingerprint, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // 1. IMPORTAMOS EL HOOK DE AUTENTICACIÓN
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login } = useAuth(); // 2. USAMOS LA FUNCIÓN 'login' DEL CONTEXTO
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientQuery, setClientQuery] = useState(''); // Para DNI o número de orden
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // FIX: referencia al contenedor para gestionar la posición al abrir/cerrar teclado
  const containerRef = useRef(null);

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;

    const resetPosition = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      } catch {}
    };

    const onViewportResize = () => {
      if (!vv) return;
      const keyboardClosed = vv.height >= window.innerHeight - 60;
      if (keyboardClosed) {
        resetPosition();
      }
    };

    vv?.addEventListener('resize', onViewportResize);

    return () => {
      vv?.removeEventListener('resize', onViewportResize);
    };
  }, []);

  const activeTabClasses = "bg-indigo-600 text-white";
  const inactiveTabClasses = "text-gray-600 hover:bg-gray-200 hover:text-gray-800";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (loginType === 'user') {
        // 3. LLAMAMOS A LA FUNCIÓN DE LOGIN DEL CONTEXTO
        // Ya no necesitamos onLogin() porque el contexto manejará el cambio de estado.
        await login(username, password);
      } else {
        // Manejo del login de cliente - redirigir a página de estado
        if (!clientQuery.trim()) {
          setError('Por favor ingresa tu DNI o número de orden.');
          return;
        }
        
        // Redirigir a la página de estado del cliente
        navigate(`/client/order/${encodeURIComponent(clientQuery.trim())}`);
      }
    } catch (err) {
      console.error("Error de inicio de sesión:", err);
      setError(err.message || 'No se pudo iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] md:min-h-screen bg-gray-100 grid place-items-start md:place-items-center p-4 pb-[env(safe-area-inset-bottom)] font-sans"
      style={{ overscrollBehavior: 'contain', touchAction: 'manipulation' }}
    >
      <motion.div
        className="w-full max-w-md max-h-[80dvh] overflow-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sm:p-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">Bienvenido</h2>
        <p className="text-center text-gray-500 mb-6">Inicia sesión para continuar</p>

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
                    required
                    autoComplete="username"
                    inputMode="text"
                    autoCapitalize="none"
                    enterKeyHint="go"
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
                    required
                    autoComplete="current-password"
                    inputMode="text"
                    autoCapitalize="none"
                    enterKeyHint="done"
                  />
                </div>
              </>
            ) : (
              <div className="relative mb-6">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="DNI o N° de Orden" 
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                  required
                  autoComplete="off"
                  inputMode="numeric"
                  enterKeyHint="go"
                />
              </div>
            )}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 disabled:bg-indigo-400 flex items-center justify-center"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? <Loader size={20} className="animate-spin" /> : 'Ingresar'}
            </motion.button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}