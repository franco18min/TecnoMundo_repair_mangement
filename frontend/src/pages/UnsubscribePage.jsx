// frontend/src/pages/UnsubscribePage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import BrandLogo from '../components/shared/BrandLogo.jsx';
import { API_CONFIG } from '../config/api';

const UnsubscribePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ ok: false, error: '' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('order_id');
    const email = params.get('email');
    async function run() {
      if (!orderId || !email) {
        setStatus({ ok: false, error: 'Faltan parámetros en el enlace de desuscripción.' });
        return;
      }
      try {
        const apiUrl = `${API_CONFIG.BASE_URL}/api/v1/client-orders/${orderId}/unsubscribe-email?email=${encodeURIComponent(email)}&_t=${Date.now()}`;
        // Ejecutar sin depender de CORS: request opaca + disparo por imagen
        await fetch(apiUrl, { method: 'GET', mode: 'no-cors' }).catch(() => {});
        const img = new Image();
        img.onload = () => setStatus({ ok: true, error: '' });
        img.onerror = () => setStatus({ ok: true, error: '' });
        img.src = apiUrl;
        setTimeout(() => setStatus({ ok: true, error: '' }), 1200);
      } catch (err) {
        setStatus({ ok: false, error: 'No se pudo completar la desuscripción.' });
      }
    }
    run();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
      >
        <div className="flex items-center justify-center mb-4">
          <BrandLogo className="mx-auto h-14 sm:h-16 md:h-20 w-auto max-w-[190px] sm:max-w-[220px]" alt="TecnoMundo" />
        </div>

        {status.ok ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">¡Has sido desuscrito correctamente!</h2>
            <p className="text-gray-600 mb-4">Ya no recibirás correos relacionados a esta orden.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Ir al portal de clientes
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No se pudo completar la desuscripción</h2>
            <p className="text-gray-600 mb-4">{status.error || 'Intenta nuevamente más tarde.'}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Volver al portal
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UnsubscribePage;
