// frontend/src/components/shared/layout/Sidebar.jsx

import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, LogOut, Building } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { BranchSwitcher } from './BranchSwitcher';
import BrandLogo from '../../shared/BrandLogo';

const SidebarContext = createContext();
export { SidebarContext };

export function Sidebar({ onLogout, children }) {
    const [expanded, setExpanded] = useState(true);
    const { currentUser } = useAuth();

    if (!currentUser) {
        return null;
    }

    return (
        <aside className="h-screen sticky top-0">
            <motion.nav
                className={`h-full flex flex-col bg-white border-r border-gray-200 shadow-sm ${expanded ? 'w-64' : 'w-20'}`}
                initial={false}
                animate={{ width: expanded ? 256 : 80 }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    type: "tween"
                }}
            >
                <div className={`p-4 pb-2 flex items-center ${expanded ? 'justify-between' : 'justify-center'}`}>
                    {/* Logo dinámico desde Supabase (system.photos: name='logo'), fallback al texto */}
                    <motion.div
                        className="overflow-hidden flex-1"
                        initial={false}
                        animate={{
                            opacity: expanded ? 1 : 0,
                            x: expanded ? 0 : -20,
                            width: expanded ? "auto" : 0
                        }}
                        transition={{
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                    >
                        <BrandLogo className="w-full h-auto sm:h-auto object-contain" alt="TecnoMundo" />
                    </motion.div>
                    <motion.button
                        onClick={() => setExpanded(curr => !curr)}
                        className={`${expanded ? 'p-1 sm:p-1.5 ml-2' : 'p-1.5'} rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200`}
                        whileHover={{ scale: 1.1, backgroundColor: "#e5e7eb" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        aria-label={expanded ? 'Contraer sidebar' : 'Expandir sidebar'}
                        title={expanded ? 'Contraer sidebar' : 'Expandir sidebar'}
                    >
                        {/* Importante: no rotamos el ícono para que siempre apunte correctamente */}
                        <motion.div initial={false} animate={{ rotate: 0 }}>
                            {expanded ? <ChevronsLeft size={18} /> : <ChevronsRight />}
                        </motion.div>
                    </motion.button>
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <motion.div
                        className="overflow-hidden"
                        initial={false}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <BranchSwitcher />
                        <motion.hr
                            className="my-2 border-gray-100"
                            initial={false}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        />
                    </motion.div>

                    <motion.ul
                        className="flex-1 px-3"
                        initial={false}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {children}
                    </motion.ul>
                </SidebarContext.Provider>

                <motion.div
                    className={`border-t border-gray-200 flex p-3 items-center ${!expanded && 'justify-center'}`}
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <motion.img
                        src={`https://ui-avatars.com/api/?background=6366f1&color=fff&name=${currentUser.username}`}
                        alt="Avatar"
                        className="w-10 h-10 rounded-md"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                    <motion.div
                        className="flex justify-between items-center overflow-hidden gap-2"
                        initial={false}
                        animate={{
                            width: expanded ? 208 : 0,
                            marginLeft: expanded ? 12 : 0,
                            opacity: expanded ? 1 : 0
                        }}
                        transition={{
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                    >
                        <div className="leading-4 min-w-0 flex-1 pr-1">
                            <h4 className="font-semibold text-gray-800 truncate max-w-[140px]">{currentUser.username}</h4>
                            <span className="text-xs text-gray-500 truncate max-w-[120px] inline-block" title={currentUser.email}>{currentUser.email}</span>
                            {currentUser.branch?.branch_name && (
                                <motion.div
                                    className='flex items-center gap-1 mt-1 truncate'
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Building size={12} className='text-gray-400' />
                                    <span className="text-xs text-gray-500 truncate">{currentUser.branch.branch_name}</span>
                                </motion.div>
                            )}
                        </div>
                        <motion.div
                            className="shrink-0 relative z-10"
                            whileHover={{ scale: 1.1, color: "#ef4444" }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <LogOut size={20} className="text-gray-500 hover:text-red-500 cursor-pointer" onClick={() => onLogout()} />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.nav>
        </aside>
    );
}

export function SidebarItem({ icon, text, active, alert, onClick }) {
    const { expanded } = useContext(SidebarContext);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.li
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer group transition-colors duration-200 ${!expanded && "justify-center"} ${active
                    ? "bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm"
                    : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                }`}
            whileHover={{
                scale: active ? 1 : 1.01,
                x: active ? 0 : 1
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
            }}
            layout
        >
            <motion.div
                whileHover={{ scale: active ? 1 : 1.05 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
                {icon}
            </motion.div>
            <motion.span
                className="overflow-hidden whitespace-nowrap"
                initial={false}
                animate={{
                    width: expanded ? "auto" : 0,
                    marginLeft: expanded ? 12 : 0,
                    opacity: expanded ? 1 : 0
                }}
                transition={{
                    duration: 0.25,
                    ease: [0.4, 0, 0.2, 1]
                }}
            >
                {text}
            </motion.span>

            <AnimatePresence>
                {alert && !expanded && (
                    <motion.div
                        className="absolute left-full rounded-full w-2 h-2 ml-2 bg-red-400 shadow-sm"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!expanded && isHovered && (
                    <motion.div
                        className="absolute left-full rounded-lg px-3 py-2 ml-6 bg-gray-900 text-white text-xs z-50 whitespace-nowrap shadow-lg border border-gray-700"
                        initial={{ opacity: 0, x: -8, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -8, scale: 0.9 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            delay: 0.15
                        }}
                    >
                        {text}
                        <motion.div
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.li>
    );
}

// Se usa BrandLogo compartido
