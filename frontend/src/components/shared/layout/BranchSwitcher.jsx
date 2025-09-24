// frontend/src/components/layout/BranchSwitcher.jsx

import React from 'react';
import { useAuth } from '../../../context/AuthContext'; // RUTA CORREGIDA
import { Building, Globe } from 'lucide-react';

export function BranchSwitcher() {
    const { currentUser, branches, selectedBranchId, setSelectedBranchId } = useAuth();
    const isAdmin = currentUser?.role?.role_name === 'Administrator';

    // No mostrar el switcher si no es admin o si no hay sucursales cargadas.
    if (!isAdmin || branches.length === 0) {
        return null;
    }

    const handleBranchChange = (e) => {
        const value = e.target.value;
        // Pydantic/SQLAlchemy devuelve números, pero el valor del <select> es string.
        // Convertimos a número si no es 'all'.
        setSelectedBranchId(value === 'all' ? 'all' : Number(value));
    };

    return (
        <div className="px-3 py-2">
            <label htmlFor="branch-switcher" className="block text-xs font-semibold text-gray-500 mb-1">
                Sucursal
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    {selectedBranchId === 'all' ? <Globe size={16} className="text-gray-400" /> : <Building size={16} className="text-gray-400" />}
                </div>
                <select
                    id="branch-switcher"
                    value={selectedBranchId}
                    onChange={handleBranchChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">Todas las Sucursales</option>
                    {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                            {branch.branch_name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}