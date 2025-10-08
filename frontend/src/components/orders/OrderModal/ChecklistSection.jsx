import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import { checklistService } from '../../../services/checklistService';
import { useAuth } from '../../../context/AuthContext';

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
        y: -20,
        scale: 0.95,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
            duration: 0.3
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

export function ChecklistSection({ mode, permissions, checklistItems, handleAddQuestion, handleRemoveQuestion, handleChecklistChange, onLoadDefaultQuestions }) {
    const { currentUser } = useAuth();
    const [predefinedQuestions, setPredefinedQuestions] = useState([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

    useEffect(() => {
        loadPredefinedQuestions();
    }, []);

    const loadPredefinedQuestions = async () => {
        try {
            setIsLoadingQuestions(true);
            const token = localStorage.getItem('accessToken');
            const questions = await checklistService.getAllQuestions(token);
            setPredefinedQuestions(questions);
        } catch (error) {
            console.error('Error al cargar preguntas predefinidas:', error);
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleLoadDefaultQuestions = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const defaultQuestions = await checklistService.getDefaultQuestions(token);
            if (onLoadDefaultQuestions) {
                onLoadDefaultQuestions(defaultQuestions);
            }
        } catch (error) {
            console.error('Error al cargar preguntas por defecto:', error);
        }
    };

    return (
        <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.h3 
                className="text-lg font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4"
                variants={itemVariants}
            >
                Checklist de Recepción
            </motion.h3>
            
            {/* 1. Botón para cargar preguntas por defecto - PRIMERA OPCIÓN */}
            {permissions.canEditInitialDetails && (
                <motion.div className="mb-4" variants={itemVariants}>
                    <motion.button
                        type="button"
                        onClick={handleLoadDefaultQuestions}
                        className="w-full bg-blue-50 border border-blue-200 text-blue-700 rounded-lg py-3 px-4 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus size={18} />
                        Cargar preguntas por defecto
                    </motion.button>
                </motion.div>
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
                                                className={`p-2 transition-all duration-200 ${item.client_answer === true ? 'text-green-600' : 'text-gray-400 hover:text-green-500'}`}
                                                variants={buttonVariants}
                                                animate={item.client_answer === true ? 'active' : 'inactive'}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <ThumbsUp size={20} strokeWidth={item.client_answer === true ? 2.5 : 1.5} />
                                            </motion.button>
                                            <motion.button 
                                                type="button" 
                                                onClick={() => handleChecklistChange(index, 'client_answer', false)} 
                                                className={`p-2 transition-all duration-200 ${item.client_answer === false ? 'text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                                                variants={buttonVariants}
                                                animate={item.client_answer === false ? 'active' : 'inactive'}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <ThumbsDown size={20} strokeWidth={item.client_answer === false ? 2.5 : 1.5} />
                                            </motion.button>
                                        </>
                                    ) : (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        >
                                            {item.client_answer === true ? 
                                                <ThumbsUp size={20} className="text-green-600" strokeWidth={2.5} /> : 
                                                <ThumbsDown size={20} className="text-red-600" strokeWidth={2.5} />
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
                                            className={`p-2 transition-all duration-200 ${item.technician_finding === true ? 'text-green-600' : 'text-gray-400 hover:text-green-500'}`}
                                            variants={buttonVariants}
                                            animate={item.technician_finding === true ? 'active' : 'inactive'}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ThumbsUp size={20} strokeWidth={item.technician_finding === true ? 2.5 : 1.5} />
                                        </motion.button>
                                        <motion.button 
                                            type="button" 
                                            onClick={() => handleChecklistChange(index, 'technician_finding', false)} 
                                            className={`p-2 transition-all duration-200 ${item.technician_finding === false ? 'text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                                            variants={buttonVariants}
                                            animate={item.technician_finding === false ? 'active' : 'inactive'}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ThumbsDown size={20} strokeWidth={item.technician_finding === false ? 2.5 : 1.5} />
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
                                    <div className='flex items-center gap-2'>
                                        <span className='text-sm font-semibold text-indigo-600 w-20'>Técnico:</span>
                                        <motion.div 
                                            className="p-2 cursor-not-allowed opacity-60"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <ThumbsUp size={20} className="text-gray-400" strokeWidth={1.5} />
                                        </motion.div>
                                        <motion.div 
                                            className="p-2 cursor-not-allowed opacity-60"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <ThumbsDown size={20} className="text-gray-400" strokeWidth={1.5} />
                                        </motion.div>
                                        <motion.input 
                                            type="text" 
                                            placeholder="Notas del técnico..." 
                                            disabled
                                            className="text-sm border-b border-gray-200 flex-1 ml-2 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            transition={{ delay: 0.4 }}
                                        />
                    </div>
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
                
                {/* 3. Selector para agregar preguntas predeterminadas - ÚLTIMA OPCIÓN */}
                {permissions.canEditInitialDetails && (
                    <motion.div className={`mt-4 ${checklistItems.length > 0 ? 'pt-4 border-t border-gray-200' : ''}`} variants={itemVariants}>
                        <motion.select 
                            onChange={handleAddQuestion} 
                            className="w-full bg-gray-50 border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm"
                            whileFocus={{ scale: 1.02 }}
                            disabled={isLoadingQuestions}
                        >
                            <option value="">
                                {isLoadingQuestions ? 'Cargando preguntas...' : '+ Añadir pregunta predeterminada...'}
                            </option>
                            {predefinedQuestions.map(q => (
                                <option key={q.id} value={q.question}>
                                    {q.question}
                                </option>
                            ))}
                        </motion.select>
                    </motion.div>
                )}
            </motion.div>
        </motion.section>
    );
}