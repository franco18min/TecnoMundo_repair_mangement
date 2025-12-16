import React, { useState } from 'react';

import { LayoutDashboard, Wrench, Users, Settings, ListOrdered } from 'lucide-react';
import { Sidebar, SidebarItem } from '../components/shared/layout/Sidebar';
import { DashboardHome } from '../components/dashboard/DashboardHome';
import { OrdersPage } from '../components/orders/OrdersPage';
import { OrderModal } from '../components/orders/OrderModal/OrderModal';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/shared/Notifications/NotificationBell';
import { NotificationToast } from '../components/shared/Notifications/NotificationToast';
import { usePermissions } from '../hooks/usePermissions';
import { ClientsPage } from '../components/clients/ClientsPage';
import { ConfigurationPage } from '../components/config/ConfigurationPage';
import { RecordsPage } from '../components/records/RecordsPage';
import { MobileBottomBar } from '../components/shared/layout/MobileBottomBar';

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
                return <ClientsPage onViewOrderClick={handleOpenModal} />;
            case 'records':
                return <RecordsPage onViewOrderClick={handleOpenModal} />;
            case 'config':
                return <ConfigurationPage />;
            case 'dashboard':
            default:
                return <DashboardHome onNewOrderClick={() => handleOpenModal()} onViewOrderClick={handleOpenModal} />;
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <div className="hidden md:block">
                <Sidebar onLogout={onLogout}>
                    <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
                    <SidebarItem icon={<Wrench size={20} />} text="Órdenes" active={activePage === 'orders'} onClick={() => setActivePage('orders')} />
                    {permissions.canViewClients && (
                        <SidebarItem icon={<Users size={20} />} text="Clientes" active={activePage === 'clients'} onClick={() => setActivePage('clients')} />
                    )}
                    <hr className="my-3 border-gray-200" />
                    {permissions.canViewRecords && (
                        <SidebarItem icon={<ListOrdered size={20} />} text="Registros" active={activePage === 'records'} onClick={() => setActivePage('records')} />
                    )}
                    {permissions.canAccessConfig && (
                        <SidebarItem
                            icon={<Settings size={20} />}
                            text="Configuración"
                            active={activePage === 'config'}
                            onClick={() => setActivePage('config')}
                        />
                    )}
                </Sidebar>
            </div>

            <main className="flex-1 p-8 pb-20 md:pb-8 overflow-y-auto">
                {renderPage()}
            </main>

            <MobileBottomBar onLogout={onLogout} />

            <NotificationToast onNotificationClick={handleNotificationClick} />
            <NotificationBell onNotificationClick={handleNotificationClick} />

            {currentUser && (
                <OrderModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    orderId={selectedOrderId}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}
