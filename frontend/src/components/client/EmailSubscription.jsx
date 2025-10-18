import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Bell, 
  Check, 
  X, 
  AlertCircle, 
  Settings,
  Smartphone,
  MessageSquare,
  Camera,
  CheckCircle
} from 'lucide-react';

const EmailSubscription = ({ orderId, customerEmail, onSubscriptionChange }) => {
  const [email, setEmail] = useState(customerEmail || '');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  
  const [preferences, setPreferences] = useState({
    statusUpdates: true,
    technicianMessages: true,
    photoUpdates: true,
    completionNotice: true
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    if (!validateEmail(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Aquí se integraría con Brevo API
      // Por ahora simulamos la suscripción
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubscribed(true);
      setShowSuccess(true);
      
      if (onSubscriptionChange) {
        onSubscriptionChange({
          email,
          subscribed: true,
          preferences,
          orderId
        });
      }

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError('Error al suscribirse. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    
    try {
      // Aquí se integraría con Brevo API para desuscribir
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubscribed(false);
      
      if (onSubscriptionChange) {
        onSubscriptionChange({
          email,
          subscribed: false,
          orderId
        });
      }
    } catch (err) {
      setError('Error al desuscribirse. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    if (isSubscribed && onSubscriptionChange) {
      onSubscriptionChange({
        email,
        subscribed: true,
        preferences: newPreferences,
        orderId
      });
    }
  };

  const notificationTypes = [
    {
      key: 'statusUpdates',
      icon: Bell,
      title: 'Cambios de Estado',
      description: 'Cuando tu orden cambie de estado'
    },
    {
      key: 'technicianMessages',
      icon: MessageSquare,
      title: 'Mensajes del Técnico',
      description: 'Actualizaciones y comentarios'
    },
    {
      key: 'photoUpdates',
      icon: Camera,
      title: 'Nuevas Fotos',
      description: 'Cuando se suban fotos del proceso'
    },
    {
      key: 'completionNotice',
      icon: CheckCircle,
      title: 'Reparación Completada',
      description: 'Cuando tu dispositivo esté listo'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-3 bg-white/20 rounded-full backdrop-blur-sm mr-4"
            >
              <Mail className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">Notificaciones por Email</h3>
              <p className="text-emerald-100 text-sm">Mantente informado del progreso</p>
            </div>
          </div>
          
          {isSubscribed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPreferences(!showPreferences)}
              className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="p-6">
        {!isSubscribed ? (
          /* Formulario de suscripción */
          <div>
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">¿Quieres recibir actualizaciones?</h4>
              <p className="text-gray-600 text-sm">
                Te notificaremos por email sobre cambios de estado, mensajes del técnico y cuando tu dispositivo esté listo.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email para notificaciones
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubscribe}
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Suscribiendo...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Suscribirse a Notificaciones
                  </div>
                )}
              </motion.button>
            </div>

            {/* Preview de notificaciones */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
              <h5 className="font-medium text-emerald-800 mb-3">Recibirás notificaciones sobre:</h5>
              <div className="grid grid-cols-2 gap-3">
                {notificationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.key} className="flex items-center text-emerald-700">
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="text-sm">{type.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Estado suscrito */
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-6"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">¡Suscripción Activa!</h4>
              <p className="text-gray-600 text-sm">
                Recibirás notificaciones en: <span className="font-medium">{email}</span>
              </p>
            </motion.div>

            {/* Preferencias de notificación */}
            <AnimatePresence>
              {showPreferences && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <h5 className="font-medium text-gray-800 mb-4">Preferencias de Notificación</h5>
                  <div className="space-y-3">
                    {notificationTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div key={type.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 text-gray-600 mr-3" />
                            <div>
                              <p className="font-medium text-gray-800">{type.title}</p>
                              <p className="text-sm text-gray-600">{type.description}</p>
                            </div>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updatePreferences(type.key, !preferences[type.key])}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              preferences[type.key] ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                          >
                            <motion.div
                              animate={{ x: preferences[type.key] ? 24 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="w-6 h-6 bg-white rounded-full shadow-md"
                            />
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <X className="w-5 h-5 mr-2" />
                  Desuscribirse
                </div>
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Mensaje de éxito */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-4 right-4 bg-emerald-600 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center">
              <Check className="w-5 h-5 mr-2" />
              <span className="font-medium">¡Suscripción exitosa!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmailSubscription;