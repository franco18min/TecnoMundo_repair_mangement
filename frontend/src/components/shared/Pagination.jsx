// frontend/src/components/shared/Pagination.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages || totalPages === 0;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-white border-t border-gray-200" data-testid="pagination">
            {/* Información de página */}
            <div className="text-sm text-gray-700" data-testid="page-info">
                Mostrando <span className="font-medium">{startItem}</span> a{' '}
                <span className="font-medium">{endItem}</span> de{' '}
                <span className="font-medium">{totalItems}</span> órdenes
            </div>

            {/* Controles de navegación */}
            <div className="flex items-center gap-2">
                <motion.button
                    onClick={() => onPageChange(1)}
                    disabled={isFirstPage}
                    className={`p-2 rounded-lg border transition-colors ${isFirstPage
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                    whileHover={!isFirstPage ? { scale: 1.05 } : {}}
                    whileTap={!isFirstPage ? { scale: 0.95 } : {}}
                    title="Primera página"
                    data-testid="first-page"
                >
                    <ChevronsLeft size={18} />
                </motion.button>

                <motion.button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirstPage}
                    className={`p-2 rounded-lg border transition-colors ${isFirstPage
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                    whileHover={!isFirstPage ? { scale: 1.05 } : {}}
                    whileTap={!isFirstPage ? { scale: 0.95 } : {}}
                    title="Página anterior"
                    data-testid="prev-page"
                >
                    <ChevronLeft size={18} />
                </motion.button>

                <div className="px-4 py-2 text-sm font-medium text-gray-700">
                    Página{' '}
                    <span className="font-bold text-indigo-600">{currentPage}</span> de{' '}
                    <span className="font-bold">{totalPages || 1}</span>
                </div>

                <motion.button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLastPage}
                    className={`p-2 rounded-lg border transition-colors ${isLastPage
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                    whileHover={!isLastPage ? { scale: 1.05 } : {}}
                    whileTap={!isLastPage ? { scale: 0.95 } : {}}
                    title="Página siguiente"
                    data-testid="next-page"
                >
                    <ChevronRight size={18} />
                </motion.button>

                <motion.button
                    onClick={() => onPageChange(totalPages)}
                    disabled={isLastPage}
                    className={`p-2 rounded-lg border transition-colors ${isLastPage
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                    whileHover={!isLastPage ? { scale: 1.05 } : {}}
                    whileTap={!isLastPage ? { scale: 0.95 } : {}}
                    title="Última página"
                    data-testid="last-page"
                >
                    <ChevronsRight size={18} />
                </motion.button>
            </div>
        </div>
    );
}
