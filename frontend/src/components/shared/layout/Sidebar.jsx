// frontend/src/components/shared/layout/Sidebar.jsx

import React, { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, LogOut, Building } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { BranchSwitcher } from './BranchSwitcher';

const SidebarContext = createContext();

export function Sidebar({ onLogout, children }) {
    const [expanded, setExpanded] = useState(true);
    const { currentUser } = useAuth();

    if (!currentUser) {
        return null;
    }

    return (
        <aside className="h-screen sticky top-0">
            <nav className={`h-full flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${expanded ? 'w-64' : 'w-20'}`}>
                {/* --- INICIO DE LA CORRECCIÓN (PUNTO 2) --- */}
                <div className={`p-4 pb-2 flex items-center ${expanded ? 'justify-between' : 'justify-center'}`}>
                {/* --- FIN DE LA CORRECCIÓN (PUNTO 2) --- */}
                    <motion.h1
                        className={`overflow-hidden font-bold text-2xl ${expanded ? "w-32" : "w-0"}`}
                        initial={false}
                        animate={{ opacity: expanded ? 1 : 0, x: expanded ? 0 : -20 }}
                    >
                        TecnoMundo
                    </motion.h1>
                    <button onClick={() => setExpanded(curr => !curr)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                        {expanded ? <ChevronsLeft /> : <ChevronsRight />}
                    </button>
                </div>

                <div className="overflow-hidden">
                    <BranchSwitcher />
                    <hr className="my-2 border-gray-100" />
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-3">{children}</ul>
                </SidebarContext.Provider>

                {/* --- INICIO DE LA CORRECCIÓN (PUNTO 3) --- */}
                <div className={`border-t border-gray-200 flex p-3 items-center ${!expanded && 'justify-center'}`}>
                {/* --- FIN DE LA CORRECCIÓN (PUNTO 3) --- */}
                    <img
                        src={`https://ui-avatars.com/api/?background=6366f1&color=fff&name=${currentUser.username}`}
                        alt="Avatar"
                        className="w-10 h-10 rounded-md"
                    />
                    <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
                        <div className="leading-4">
                            <h4 className="font-semibold text-gray-800">{currentUser.username}</h4>
                            <span className="text-xs text-gray-500">{currentUser.email}</span>
                            {currentUser.branch?.branch_name && (
                                <div className='flex items-center gap-1 mt-1'>
                                    <Building size={12} className='text-gray-400' />
                                    <span className="text-xs text-gray-500">{currentUser.branch.branch_name}</span>
                                </div>
                            )}
                        </div>
                        <LogOut size={20} className="text-gray-500 hover:text-red-500 cursor-pointer" onClick={onLogout} />
                    </div>
                </div>
            </nav>
        </aside>
    );
}

export function SidebarItem({ icon, text, active, alert, onClick }) {
    const { expanded } = useContext(SidebarContext);
    return (
        <li
            onClick={onClick}
            // --- INICIO DE LA CORRECCIÓN (PUNTO 1) ---
            className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${!expanded && "justify-center"} ${
            // --- FIN DE LA CORRECCIÓN (PUNTO 1) ---
            active
                ? "bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm"
                : "hover:bg-indigo-50 text-gray-600"
            }`}
        >
            {icon}
            <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
            {alert && !expanded && (
                <div className="absolute left-full rounded-md w-2 h-2 ml-2 bg-indigo-400" />
            )}

            {!expanded && (
            <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-gray-800 text-white text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50">
                {text}
            </div>
            )}
        </li>
    );
}