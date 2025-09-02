// frontend/src/pages/DashboardPage.jsx

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Wrench, Users, History, Settings } from 'lucide-react';

import { Sidebar, SidebarItem } from '../components/layout/Sidebar';
import { DashboardHome } from '../components/DashboardHome';
import { OrdersPage } from '../components/OrdersPage';
import { NewOrderModal } from '../components/NewOrderModal';

export function DashboardPage({ onLogout }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para renderizar la página activa
  const renderPage = () => {
    switch (activePage) {
      case 'orders':
        return <OrdersPage onNewOrderClick={() => setIsModalOpen(true)} />;
      case 'clients':
        // Aquí iría el componente de Clientes cuando lo creemos
        return <h1 className="text-3xl font-bold">Página de Clientes (en construcción)</h1>;
      case 'history':
         // Aquí iría el componente de Historial
        return <h1 className="text-3xl font-bold">Página de Historial (en construcción)</h1>;
      case 'settings':
         // Aquí iría el componente de Configuración
        return <h1 className="text-3xl font-bold">Página de Configuración (en construcción)</h1>;
      case 'dashboard':
      default:
        return <DashboardHome onNewOrderClick={() => setIsModalOpen(true)} />;
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isModalOpen && <NewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}