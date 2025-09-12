// frontend/src/pages/DashboardPage.jsx

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Wrench, Users, History, Settings } from 'lucide-react';
import { Sidebar, SidebarItem } from '../components/layout/Sidebar';
import { DashboardHome } from '../components/DashboardHome';
import { OrdersPage } from '../components/OrdersPage';
// --- INICIO DE LA CORRECCIÓN ---
// La ruta correcta debe apuntar al archivo DENTRO de la carpeta OrderModal
import { OrderModal } from '../components/OrderModal/OrderModal';
// --- FIN DE LA CORRECCIÓN ---
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/Notifications/NotificationBell';
import { NotificationToast } from '../components/Notifications/NotificationToast';

export function DashboardPage({ onLogout }) {
  // ... el resto del archivo que te proporcioné no necesita cambios.
  // La lógica de handleNotificationClick y el resto del render es correcta.
  const [activePage, setActivePage] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { currentUser } = useAuth();

  const handleOpenModal = (orderId = null) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleCloseModal = (refresh = false) => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
    if (refresh) {
      const currentPage = activePage;
      setActivePage('');
      setTimeout(() => setActivePage(currentPage), 0);
    }
  };

  const handleNotificationClick = (link) => {
    if (!link || typeof link !== 'string') return;

    const [type, idStr] = link.split(':');
    const id = parseInt(idStr, 10);

    if (type === 'order' && !isNaN(id)) {
      if (activePage !== 'orders') {
        setActivePage('orders');
      }
      handleOpenModal(id);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'orders':
        return <OrdersPage onNewOrderClick={() => handleOpenModal()} onViewOrderClick={handleOpenModal} />;
      default:
        return <DashboardHome onNewOrderClick={() => handleOpenModal()} onViewOrderClick={handleOpenModal} />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar onLogout={onLogout}>
        <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
        <SidebarItem icon={<Wrench size={20} />} text="Órdenes" active={activePage === 'orders'} onClick={() => setActivePage('orders')} />
        <SidebarItem icon={<Users size={20} />} text="Clientes" active={activePage === 'clients'} onClick={() => setActivePage('clients')} />
        <SidebarItem icon={<History size={20} />} text="Historial" active={activePage === 'history'} onClick={() => setActivePage('history')} />
        <hr className="my-3 border-gray-200" />
        <SidebarItem icon={<Settings size={20} />} text="Configuración" active={activePage === 'settings'} onClick={() => setActivePage('settings')} />
      </Sidebar>

      <main className="flex-1 p-8 overflow-y-auto">
        {renderPage()}
      </main>

      <NotificationToast onNotificationClick={handleNotificationClick} />
      <NotificationBell onNotificationClick={handleNotificationClick} />

      <AnimatePresence>
        {isModalOpen && currentUser && (
          <OrderModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            orderId={selectedOrderId}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}