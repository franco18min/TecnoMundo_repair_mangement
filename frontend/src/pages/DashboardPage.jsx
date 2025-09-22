// frontend/src/pages/DashboardPage.jsx

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wrench, Users, History, Settings } from 'lucide-react';
import { Sidebar, SidebarItem } from '../components/layout/Sidebar';
import { DashboardHome } from '../components/DashboardHome';
import { OrdersPage } from '../components/OrdersPage';
import { OrderModal } from '../components/OrderModal/OrderModal';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/Notifications/NotificationBell';
import { NotificationToast } from '../components/Notifications/NotificationToast';
import { usePermissions } from '../hooks/usePermissions';
import { ClientsPage } from '../components/ClientsPage'; // <-- 1. Importar el componente real

export function DashboardPage({ onLogout }) {
    const [activePage, setActivePage] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const { currentUser } = useAuth();
    const permissions = usePermissions();

    const handleOpenModal = (orderId = null) => {
        setSelectedOrderId(orderId);
        setIsModalOpen(true);
    };

    const handleCloseModal = (refresh = false) => {
        setIsModalOpen(false);
        setSelectedOrderId(null);
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
            case 'clients':
                // 3. Renderizar el componente real
                return <ClientsPage />;
            default:
                return <DashboardHome onNewOrderClick={() => handleOpenModal()} onViewOrderClick={handleOpenModal} />;
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar onLogout={onLogout}>
                <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
                <SidebarItem icon={<Wrench size={20} />} text="Órdenes" active={activePage === 'orders'} onClick={() => setActivePage('orders')} />

                {permissions.canViewClients && (
                    <SidebarItem icon={<Users size={20} />} text="Clientes" active={activePage === 'clients'} onClick={() => setActivePage('clients')} />
                )}

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