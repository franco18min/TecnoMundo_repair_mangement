import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wrench, Users, History, Settings } from 'lucide-react';
import { Sidebar, SidebarItem } from '../components/layout/Sidebar';
import { DashboardHome } from '../components/DashboardHome';
import { OrdersPage } from '../components/OrdersPage';
import { OrderModal } from '../components/OrderModal/OrderModal';
import { useAuth } from '../context/AuthContext';
// --- INICIO DE LA MODIFICACIÓN ---
import { NotificationBell } from '../components/Notifications/NotificationBell';
import { NotificationToast } from '../components/Notifications/NotificationToast';
// --- FIN DE LA MODIFICACIÓN ---

export function DashboardPage({ onLogout }) {
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
        <SidebarItem icon={<Wrench size={20} />} text="Órdenes" alert active={activePage === 'orders'} onClick={() => setActivePage('orders')} />
        <SidebarItem icon={<Users size={20} />} text="Clientes" active={activePage === 'clients'} onClick={() => setActivePage('clients')} />
        <SidebarItem icon={<History size={20} />} text="Historial" active={activePage === 'history'} onClick={() => setActivePage('history')} />
        <hr className="my-3 border-gray-200" />
        <SidebarItem icon={<Settings size={20} />} text="Configuración" active={activePage === 'settings'} onClick={() => setActivePage('settings')} />
      </Sidebar>

      <main className="flex-1 p-8 overflow-y-auto">
        {renderPage()}
      </main>

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

      {/* --- INICIO DE LA MODIFICACIÓN --- */}
      {/* Añadimos los componentes de notificación al layout principal */}
      <NotificationToast />
      <NotificationBell />
      {/* --- FIN DE LA MODIFICACIÓN --- */}
    </div>
  );
}