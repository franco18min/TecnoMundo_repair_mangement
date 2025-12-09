import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, ChevronRight } from 'lucide-react';

export function TechPanelDrawer({ isOpen, onClose, children }) {

    // Variants for the drawer sliding from the right
    const drawerVariants = {
        closed: {
            x: "100%",
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        open: {
            x: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    };

    const backdropVariants = {
        closed: { opacity: 0 },
        open: { opacity: 1 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop (light, partially covers pattern modal instructions if any, but mainly focused on this implementation) */}
                    <motion.div
                        className="absolute inset-0 bg-black/20 z-[60]"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={backdropVariants}
                        onClick={onClose}
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        className="absolute top-0 right-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-white shadow-2xl z-[70] border-l border-gray-200 flex flex-col"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={drawerVariants}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-indigo-50/50">
                            <div className="flex items-center gap-2 text-indigo-800">
                                <Wrench className="w-6 h-6" />
                                <h2 className="text-xl font-bold">Panel Técnico</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content Area - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="flex flex-col gap-6">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
