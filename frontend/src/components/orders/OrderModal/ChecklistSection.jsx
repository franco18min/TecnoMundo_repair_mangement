//frontend/src/components/OrderModal/ChecklistSection.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';

const PREDEFINED_QUESTIONS = [
    "¿El equipo enciende?",
    "¿La pantalla está rota?",
    "¿El equipo tiene daños por líquido?",
    "¿Se entrega con cargador?",
    "¿Se conoce la contraseña de desbloqueo?",
];

// Variantes de animación
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    },
    exit: {
        opacity: 0,
        x: -100,
        transition: {
            duration: 0.2
        }
    }
};

const buttonVariants = {
    inactive: { 
        scale: 1,
        backgroundColor: "#e5e7eb"
    },
    active: { 
        scale: 1.1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
        }
    },
    hover: {
        scale: 1.05,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
        }
    }
};

export function ChecklistSection({ mode, permissions, checklistItems, handleAddQuestion, handleRemoveQuestion, handleChecklistChange }) {
    return (
        <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.h3 
                className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4"
                variants={itemVariants}
            >
                Checklist de Recepción
            </motion.h3>
            
            {permissions.canEditInitialDetails && (
                <motion.select 
                    onChange={handleAddQuestion} 
                    className="w-full bg-gray-50 border rounded-lg py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    variants={itemVariants}
                    whileFocus={{ scale: 1.02 }}
                >
                    <option value="">Añadir pregunta predeterminada...</option>
                    {PREDEFINED_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </motion.select>
            )}
            
            <motion.div 
                className="space-y-3"
                variants={containerVariants}
            >
                <AnimatePresence mode="popLayout">
                    {checklistItems.length > 0 ? checklistItems.map((item, index) => (
                        <motion.div 
                            key={`${item.check_description}-${index}`}
                            className="bg-gray-50 p-3 rounded-lg border"
                            variants={itemVariants}
                            layout
                            whileHover={{ scale: 1.01 }}
                            exit="exit"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <motion.p 
                                    className="text-sm font-medium text-gray-800"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {item.check_description}
                                </motion.p>
                                {permissions.canEditInitialDetails && (
                                    <motion.button 
                                        type="button" 
                                        onClick={() => handleRemoveQuestion(item.check_description)} 
                                        className="text-gray-400 hover:text-red-500 p-1 rounded-full"
                                        whileHover={{ scale: 1.2, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <X size={18} />
                                    </motion.button>
                                )}
                            </div>
                            
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm font-semibold text-gray-600 w-20'>Cliente:</span>
                                    {permissions.canEditInitialDetails ? (
                                        <>
                                            <motion.button 
                                                type="button" 
                                                onClick={() => handleChecklistChange(index, 'client_answer', true)} 
                                                className={`p-1.5 rounded-full ${item.client_answer === true ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-200'}`}
                                                variants={buttonVariants}
                                                animate={item.client_answer === true ? 'active' : 'inactive'}
                                                whileHover="hover"
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <ThumbsUp size={16} />
                                            </motion.button>
                                            <motion.button 
                                                type="button" 
                                                onClick={() => handleChecklistChange(index, 'client_answer', false)} 
                                                className={`p-1.5 rounded-full ${item.client_answer === false ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-red-200'}`}
                                                variants={buttonVariants}
                                                animate={item.client_answer === false ? 'active' : 'inactive'}
                                                whileHover="hover"
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <ThumbsDown size={16} />
                                            </motion.button>
                                        </>
                                    ) : (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        >
                                            {item.client_answer === true ? 
                                                <ThumbsUp size={18} className="text-green-500" /> : 
                                                <ThumbsDown size={18} className="text-red-500" />
                                            }
                                        </motion.div>
                                    )}
                                </div>

                                {permissions.canInteractWithTechnicianChecklist ? (
                                    <div className='flex items-center gap-2'>
                                        <span className='text-sm font-semibold text-indigo-600 w-20'>Técnico:</span>
                                        <motion.button 
                                            type="button" 
                                            onClick={() => handleChecklistChange(index, 'technician_finding', true)} 
                                            className={`p-1.5 rounded-full ${item.technician_finding === true ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-200'}`}
                                            variants={buttonVariants}
                                            animate={item.technician_finding === true ? 'active' : 'inactive'}
                                            whileHover="hover"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <ThumbsUp size={16} />
                                        </motion.button>
                                        <motion.button 
                                            type="button" 
                                            onClick={() => handleChecklistChange(index, 'technician_finding', false)} 
                                            className={`p-1.5 rounded-full ${item.technician_finding === false ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-red-200'}`}
                                            variants={buttonVariants}
                                            animate={item.technician_finding === false ? 'active' : 'inactive'}
                                            whileHover="hover"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <ThumbsDown size={16} />
                                        </motion.button>
                                        <motion.input 
                                            type="text" 
                                            placeholder="Notas..." 
                                            value={item.technician_notes || ''} 
                                            onChange={(e) => handleChecklistChange(index, 'technician_notes', e.target.value)} 
                                            className="text-sm border-b focus:outline-none focus:border-indigo-500 flex-1 ml-2 bg-transparent transition-all duration-200"
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                    </div>
                                ) : (
                                    item.technician_finding !== null &&
                                    <motion.div 
                                        className='flex items-center gap-2'
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <span className='text-sm font-semibold text-indigo-600 w-20'>Técnico:</span>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        >
                                            {item.technician_finding === true ? 
                                                <ThumbsUp size={18} className="text-green-500" /> : 
                                                item.technician_finding === false ? 
                                                <ThumbsDown size={18} className="text-red-500" /> : 
                                                <span className="text-xs text-gray-400">Sin revisar</span>
                                            }
                                        </motion.div>
                                        {item.technician_notes && (
                                            <motion.p 
                                                className="text-xs text-gray-500 ml-2 pl-2 border-l"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                | {item.technician_notes}
                                            </motion.p>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    )) : (
                        <motion.p 
                            className="text-sm text-gray-400 text-center py-4"
                            variants={itemVariants}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            No se registraron ítems en el checklist.
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.section>
    );
}