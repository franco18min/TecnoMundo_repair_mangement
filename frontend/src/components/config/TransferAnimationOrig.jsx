import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ICONOS INTERNOS (para mantener todo en un solo archivo) ---

const OrderIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zM9 7h1m-1 6h6m-6 4h6" />
        </g>
    </svg>
);

const BranchIcon = ({ className, isOrigin }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
        {isOrigin ? (
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                <path d="m14.5 10.5l-3 3l3 3" />
                <path d="M11.5 13.5H3.75a.75.75 0 0 0-.75.75v6c0 .414.336.75.75.75H21.25a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-.75-.75H18.5" />
                <path d="M21 14V7l-5-5H6a2 2 0 0 0-2 2v5" />
            </g>
        ) : (
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                <path d="m9.5 10.5l3 3l-3 3" />
                <path d="M12.5 13.5h7.75a.75.75 0 0 1 .75.75v6c0 .414-.336.75-.75.75H2.75a.75.75 0 0 1-.75-.75v-6a.75.75 0 0 1 .75-.75H5.5" />
                <path d="M3 14V7l5-5h10a2 2 0 0 1 2 2v5" />
            </g>
        )}
    </svg>
);

const CheckmarkIcon = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);


// --- VARIANTS DE FRAMER-MOTION ---

const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 0.8, delay: 0.3, ease: "easeInOut" } }
};

const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (delay = 0) => ({
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 20, delay }
    }),
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
};

const messageVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { delay: 1.7, duration: 0.5, ease: "easeOut" } }
};

const branchColorVariants = {
    active: { color: '#4f46e5' }, // text-indigo-600
    inactive: { color: '#9ca3af' } // text-gray-400
}

// --- COMPONENTE PRINCIPAL ---

const TransferAnimation = ({ status, fromBranch = "Sucursal A", toBranch = "Sucursal B", onCompleted }) => {

    useEffect(() => {
        if (status === 'completed' && onCompleted) {
            const timer = setTimeout(onCompleted, 2500);
            return () => clearTimeout(timer);
        }
    }, [status, onCompleted]);

    const isTransferring = status === 'transferring' || status === 'completed';
    // Ruta SVG que no cruza los iconos
    const svgPath = "M45 55 C 100 -30, 200 -30, 255 55";

    return (
        <div className="relative w-full max-w-sm p-8 rounded-2xl shadow-lg border border-gray-200 bg-white/60 backdrop-blur-md">
            <div className="relative h-48">
                {/* RUTA */}
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a5b4fc" />
                            <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                    </defs>
                    <motion.path
                        d={svgPath}
                        stroke="url(#line-gradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="8 8"
                        strokeLinecap="round"
                        variants={pathVariants}
                        initial="hidden"
                        animate={isTransferring ? "visible" : "hidden"}
                    />
                </svg>

                {/* SUCURSALES */}
                <div className="absolute inset-0 flex justify-between items-end">
                    {/* Origen */}
                    <div className="flex flex-col items-center gap-2 relative">
                        <AnimatePresence>
                            {status === 'idle' && (
                                <motion.div className="absolute top-[-38px]" variants={itemVariants} initial="hidden" animate="visible" exit="exit">
                                    <OrderIcon className="h-8 w-8 text-indigo-700" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                         <motion.div
                            animate={status === 'idle' ? 'active' : 'inactive'}
                            variants={branchColorVariants}
                            transition={{ duration: 0.4 }}
                         >
                            <BranchIcon className="h-16 w-16" isOrigin />
                         </motion.div>
                        <motion.span 
                            className="font-semibold"
                            animate={status === 'idle' ? 'active' : 'inactive'}
                            variants={branchColorVariants}
                            transition={{ duration: 0.4 }}
                        >
                            {fromBranch}
                        </motion.span>
                    </div>

                    {/* Destino */}
                    <div className="flex flex-col items-center gap-2 relative">
                         <AnimatePresence>
                            {status === 'completed' && (
                                <motion.div className="absolute top-[-38px]" variants={itemVariants} custom={1.2} initial="hidden" animate="visible" exit="exit">
                                    <OrderIcon className="h-8 w-8 text-indigo-700" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="relative">
                            <motion.div
                                animate={status === 'completed' ? 'active' : 'inactive'}
                                variants={branchColorVariants}
                                transition={{ duration: 0.4, delay: 1.2 }}
                            >
                                <BranchIcon className="h-16 w-16" />
                            </motion.div>
                            <AnimatePresence>
                                {status === 'completed' && (
                                     <motion.div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white rounded-full p-1.5 border-2 border-white flex items-center justify-center"
                                        variants={itemVariants}
                                        custom={1.5}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <CheckmarkIcon className="h-5 w-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <motion.span 
                            className="font-semibold"
                            animate={status === 'completed' ? 'active' : 'inactive'}
                            variants={branchColorVariants}
                            transition={{ duration: 0.4, delay: 1.2 }}
                        >
                            {toBranch}
                        </motion.span>
                    </div>
                </div>
            </div>
            <div className="text-center mt-6 h-6">
                <AnimatePresence>
                    {status === 'completed' && (
                        <motion.p className="font-semibold text-green-600" variants={messageVariants} initial="hidden" animate="visible" exit="hidden">
                            ¡Transferencia Completada!
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


// --- APLICACIÓN DE DEMOSTRACIÓN ---
export default function App() {
    const [status, setStatus] = useState('idle'); // 'idle', 'transferring', 'completed'

    const handleTransfer = () => {
        setStatus('transferring');
        setTimeout(() => setStatus('completed'), 2000); // Simula el tiempo que toma la transferencia
    };

    const handleReset = () => {
        setStatus('idle');
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
             <div className="max-w-md w-full text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Componente de Animación React</h1>
                <p className="text-gray-600">Este componente se controla mediante el estado (`status`) y notifica cuando la animación ha finalizado.</p>
            </div>
            
            <TransferAnimation 
                status={status}
                fromBranch="Jujuy Centro"
                toBranch="Palpalá"
                onCompleted={() => console.log("La animación ha finalizado. Puedes cerrar el modal o realizar otra acción.")}
            />

            <div className="flex gap-4 mt-8">
                <button
                    onClick={handleTransfer}
                    disabled={status !== 'idle'}
                    className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Iniciar Transferencia
                </button>
                 <button
                    onClick={handleReset}
                    className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                    Reiniciar
                </button>
            </div>
        </div>
    );
}

