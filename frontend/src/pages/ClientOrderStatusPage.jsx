// frontend/src/pages/ClientOrderStatusPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  RefreshCw, 
  Search, 
  AlertCircle, 
  Loader,
  Home,
  Phone,
  Mail,
  MapPin,
  Building
} from 'lucide-react';

// Componentes específicos del cliente
import OrderStatusCard from '../components/client/OrderStatusCard';
import OrderTimeline from '../components/client/OrderTimeline';
import DiagnosisSection from '../components/client/DiagnosisSection';
import PhotoGallery from '../components/client/PhotoGallery';
import EmailSubscription from '../components/client/EmailSubscription';
import CostBreakdown from '../components/client/CostBreakdown';

// Componentes compartidos
import { Toast } from '../components/shared/Toast';
import ErrorBoundary from '../components/common/ErrorBoundary';

// API
import { getOrderByClientQuery, getOrderDetails, getOrderPhotos } from '../api/orderApi';

const ClientOrderStatusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  // Cargar datos de la orden
  const fetchOrderData = async (searchIdentifier) => {
    if (!searchIdentifier?.trim()) {
      setError('Por favor ingresa tu DNI o número de orden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getOrderByClientQuery(searchIdentifier.trim());
      setOrderData(data);
      
      // Obtener fotos si existen
      try {
        const photos = await getOrderPhotos(data.id);
        setOrderData(prev => ({ ...prev, photos: photos || [] }));
      } catch (photoError) {
        console.warn('No se pudieron cargar las fotos:', photoError);
        setOrderData(prev => ({ ...prev, photos: [] }));
      }
      
      // Verificar si ya está suscrito
      const subscriptionStatus = localStorage.getItem(`subscription_${data.id}`);
      setIsSubscribed(subscriptionStatus === 'true');
      
      setToast({
        type: 'success',
        message: '¡Orden encontrada exitosamente!'
      });
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'No se pudo encontrar la orden. Verifica tu DNI o número de orden.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos si hay identifier en URL
  useEffect(() => {
    if (orderId) {
      fetchOrderData(orderId);
    }
  }, [orderId]);

  // Estado para suscripción
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Función para refrescar datos
  const handleRefresh = async () => {
    if (!orderData?.id) return;
    
    setRefreshing(true);
    try {
      await fetchOrderData(orderData.id);
      setToast({
        show: true,
        type: 'success',
        message: 'Datos actualizados correctamente'
      });
    } catch (error) {
      setToast({
        show: true,
        type: 'error',
        message: 'Error al actualizar los datos'
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Función para manejar búsqueda
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/client/order/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Función para manejar cambios de suscripción
  const handleSubscriptionChange = (subscribed) => {
    setIsSubscribed(subscribed);
    setToast({
      show: true,
      type: subscribed ? 'success' : 'info',
      message: subscribed ? 'Suscrito a notificaciones' : 'Desuscrito de notificaciones'
    });
  };

  // Renderizado condicional para loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Cargando información de tu orden
          </h2>
          <p className="text-gray-600">
            Estamos obteniendo los datos más recientes...
          </p>
        </motion.div>
      </div>
    );
  }

  // Renderizado condicional para error
  if (error && !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Orden no encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          {/* Búsqueda alternativa */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ingresa tu DNI o número de orden"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Buscar Orden
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Volver al Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y navegación */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Volver</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center space-x-2">
                <Home className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-800">
                  TecnoMundo
                </h1>
              </div>
            </div>

            {/* Búsqueda y acciones */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar otra orden..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Panel de bienvenida unificado con información de la orden */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    ¡Hola, {orderData?.customer?.first_name} {orderData?.customer?.last_name}!
                  </h2>
                  <p className="text-blue-100 mt-1">
                    Bienvenido al seguimiento de tu orden #{orderData?.id}. Aquí podrás ver el estado actual de tu reparación en tiempo real.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Información de la orden integrada */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h4 className="font-semibold text-white mb-2">Dispositivo</h4>
                <p className="text-blue-100">{orderData?.device_model || 'No especificado'}</p>
                {orderData?.device_type?.name && (
                  <p className="text-sm text-blue-200 mt-1">Tipo: {orderData?.device_type.name}</p>
                )}
              </div>
              
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h4 className="font-semibold text-white mb-2">Problema Reportado</h4>
                <p className="text-blue-100">{orderData?.problem_description || 'No especificado'}</p>
                {orderData?.accesories && (
                  <p className="text-sm text-blue-200 mt-1">Accesorios: {orderData?.accesories}</p>
                )}
              </div>

              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <h4 className="font-semibold text-white mb-2">Sucursal</h4>
                <p className="text-blue-100">{orderData?.branch?.name}</p>
                {orderData?.branch?.address && (
                  <p className="text-sm text-blue-200 mt-1">{orderData?.branch.address}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Timeline de progreso */}
          <div className="grid grid-cols-1 gap-8">
            {/* Timeline horizontal */}
            <motion.div variants={itemVariants} className="space-y-6">
              <OrderTimeline 
                currentStatus={orderData?.status?.status_name}
                orderDate={orderData?.created_at}
              />
            </motion.div>
          </div>

          {/* Diagnóstico y detalles técnicos */}
          <motion.div variants={itemVariants}>
            <ErrorBoundary>
              <DiagnosisSection order={orderData} />
            </ErrorBoundary>
          </motion.div>

          {/* Galería de fotos y costos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={itemVariants}>
              <ErrorBoundary>
                <PhotoGallery photos={orderData?.photos || []} />
              </ErrorBoundary>
            </motion.div>

            <motion.div variants={itemVariants}>
              <ErrorBoundary>
                <CostBreakdown order={orderData} />
              </ErrorBoundary>
            </motion.div>
          </div>

          {/* Suscripción por email */}
          <motion.div variants={itemVariants}>
            <EmailSubscription 
              customerEmail={orderData?.customer?.email || orderData?.customer?.phone_number}
              orderId={orderData?.id}
              onSubscriptionChange={handleSubscriptionChange}
            />
          </motion.div>

          {/* Información de la sucursal */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building className="w-5 h-5 text-blue-600 mr-2" />
              Información de la Sucursal
            </h3>
            
            {/* Información horizontal de la sucursal */}
            <div className="flex flex-wrap items-center gap-6">
              {/* Nombre de sucursal */}
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800">{orderData?.branch?.branch_name}</span>
              </div>
              
              {/* Teléfono */}
              {orderData?.branch?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{orderData.branch.phone}</span>
                </div>
              )}
              
              {/* Dirección */}
              {orderData?.branch?.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span className="text-gray-700">{orderData.branch.address}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Toast de notificaciones */}
      <AnimatePresence>
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: 'info' })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientOrderStatusPage;