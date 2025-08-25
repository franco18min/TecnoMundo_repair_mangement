import React, { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, LayoutDashboard, Wrench, Users, History, Settings, LogOut } from 'lucide-react';

const SidebarContext = createContext();

function SidebarItem({ icon, text, active, alert, onClick }) {
  const { expanded } = useContext(SidebarContext);
  return (
    <li
      onClick={onClick}
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
        active
          ? "bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm"
          : "hover:bg-indigo-50 text-gray-600"
      }`}
    >
      {icon}
      <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
      {alert && <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"}`} />}

      {!expanded && (
        <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-gray-800 text-white text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50">
          {text}
        </div>
      )}
    </li>
  );
}

export function Sidebar({ onLogout }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside className="h-screen">
      <nav className="h-full flex flex-col bg-white border-r border-gray-200 shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
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

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active />
            <SidebarItem icon={<Wrench size={20} />} text="Órdenes" alert />
            <SidebarItem icon={<Users size={20} />} text="Clientes" />
            <SidebarItem icon={<History size={20} />} text="Historial" />
            <hr className="my-3 border-gray-200" />
            <SidebarItem icon={<Settings size={20} />} text="Configuración" />
          </ul>
        </SidebarContext.Provider>

        <div className="border-t border-gray-200 flex p-3">
          <img src="https://ui-avatars.com/api/?background=6366f1&color=fff&name=Admin" alt="Avatar" className="w-10 h-10 rounded-md" />
          <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
            <div className="leading-4">
              <h4 className="font-semibold text-gray-800">Admin</h4>
              <span className="text-xs text-gray-500">admin@tecnomundo.com</span>
            </div>
            <LogOut size={20} className="text-gray-500 hover:text-red-500 cursor-pointer" onClick={onLogout} />
          </div>
        </div>
      </nav>
    </aside>
  );
}