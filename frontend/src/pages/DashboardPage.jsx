import React, { useState, useEffect } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { RepairOrderCard } from '../components/RepairOrderCard';
import { fetchRepairOrders } from '../api/repairOrdersApi';

export const DashboardPage = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [repairOrders, setRepairOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            setIsLoading(true);
            const orders = await fetchRepairOrders();
            setRepairOrders(orders);
            setIsLoading(false);
        };

        loadOrders();
    }, []);

    return (
        <div className="flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
            <main className="flex-1 h-screen overflow-y-auto">
                <div className="p-6">
                    <header className="mb-8">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                                <p className="text-gray-500 dark:text-gray-400">Hola Admin, bienvenido de nuevo.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input type="text" placeholder="Buscar orden..." className="w-full max-w-xs pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                                    <PlusCircle size={20} />
                                    <span>Nueva Orden</span>
                                </button>
                            </div>
                        </div>
                    </header>

                    {isLoading ? (
                        <p className="text-center text-gray-500">Cargando órdenes...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {repairOrders.map((order, index) => (
                                <RepairOrderCard key={order.id} order={order} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};