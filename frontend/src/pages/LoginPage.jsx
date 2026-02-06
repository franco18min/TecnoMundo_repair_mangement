// frontend/src/pages/LoginPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, KeyRound, Fingerprint, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // 1. IMPORTAMOS EL HOOK DE AUTENTICACIÓN
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/shared/BrandLogo';

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
      } catch { }
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

  // Verificar si hay mensaje de sesión caducada
  useEffect(() => {
    const expiredMessage = sessionStorage.getItem('sessionExpiredMessage');
    if (expiredMessage) {
      setError(expiredMessage);
      sessionStorage.removeItem('sessionExpiredMessage');
    }
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
        <BrandLogo className="mx-auto h-14 sm:h-16 md:h-20 w-auto max-w-[190px] sm:max-w-[220px] mb-3" alt="TecnoMundo" />

        {loginType === 'user' ? (
          <p className="text-center text-gray-500 mb-4">Inicia sesión para continuar</p>
        ) : (
          <p className="text-center text-gray-500 mb-4">Ingresa tu DNI o N° de orden para encontrar tu reparación</p>
        )}

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

      {/* Botón flotante de WhatsApp - Optimizado para móviles */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Anillo pulsante de fondo */}
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-30"></span>
        </span>

        {/* Botón principal */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => {
            const fallback = '+5493884087444';
            const formattedPhone = fallback;
            const message = `Hola, necesito información sobre el estado de mi reparación o quiero hacer una consulta.`;
            const whatsappUrl = `https://api.whatsapp.com/send/?phone=${encodeURIComponent(formattedPhone)}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
            window.open(whatsappUrl, '_blank');
          }}
          className="relative w-16 h-16 sm:w-16 sm:h-16 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 group cursor-pointer touch-manipulation"
          style={{
            minWidth: '44px',
            minHeight: '44px',
            WebkitTapHighlightColor: 'transparent'
          }}
          aria-label="Contactar por WhatsApp"
        >
          {/* Logo oficial de WhatsApp */}
          <svg
            className="w-9 h-9 sm:w-9 sm:h-9 pointer-events-none"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>

          {/* Tooltip opcional - solo desktop */}
          <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
            Consultar por WhatsApp
          </span>
        </motion.button>
      </div>
    </div>
  );
}
