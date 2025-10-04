import React from 'react';
import { motion } from 'framer-motion';

// Variantes de animación para UserModal
const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
        opacity: 1, 
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

/**
 * FormField unificado que combina todas las variantes existentes
 * Mantiene compatibilidad total con:
 * - OrderModal/shared.jsx (básico + currency + select)
 * - ClientModal.jsx (con ícono)
 * - BranchModal.jsx (con ícono)
 * - UserModal.jsx (con animaciones + ícono + select)
 */
export const FormField = ({ 
    // Props de OrderModal/shared.jsx
    label, 
    id, 
    isCurrency = false, 
    as,
    
    // Props de otros modales
    icon,
    
    // Props de animación (UserModal)
    animated = false,
    
    // Props estándar
    children, 
    ...props 
}) => {
    const Component = as === 'select' ? 'select' : as || 'input';
    
    // Determinar si usar animaciones (solo si animated=true, como en UserModal)
    const WrapperComponent = animated ? motion.div : 'div';
    const wrapperProps = animated ? {
        className: "relative",
        variants: itemVariants,
        whileHover: { scale: 1.02 },
        whileFocus: { scale: 1.02 }
    } : {
        className: "relative"
    };

    // Si tiene label (estilo OrderModal)
    if (label) {
        return (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                <div className="relative">
                    {isCurrency && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    )}
                    {Component === 'select' ? (
                        <select 
                            id={id} 
                            {...props} 
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {children}
                        </select>
                    ) : (
                        <input 
                            id={id} 
                            {...props} 
                            className={`w-full bg-gray-50 border border-gray-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                isCurrency ? 'pl-7 pr-3' : 'px-3'
                            }`} 
                        />
                    )}
                </div>
            </div>
        );
    }

    // Si tiene ícono (estilo ClientModal, BranchModal, UserModal)
    return (
        <WrapperComponent {...wrapperProps}>
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
            <Component 
                {...props} 
                className={`w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    animated ? 'transition-all duration-200' : ''
                }`}
            >
                {children}
            </Component>
        </WrapperComponent>
    );
};

export default FormField;