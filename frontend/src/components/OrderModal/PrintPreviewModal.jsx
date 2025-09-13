// frontend/src/components/OrderModal/PrintPreviewModal.jsx

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { Printer, X } from 'lucide-react';
import { ClientTicket } from '../tickets/ClientTicket';
import { WorkshopTicket } from '../tickets/WorkshopTicket';

export function PrintPreviewModal({ isOpen, onClose, orderData }) {
  const printComponentRef = useRef();

  // El hook de impresión ahora apunta a un contenedor que tiene ambos tickets
  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    onAfterPrint: () => onClose(true), // Cierra todo después de imprimir
  });

  // Contenedor invisible que se enviará a la impresora
  const PrintContainer = () => (
    <div ref={printComponentRef}>
      <ClientTicket order={orderData} />
      {/* Page-break para asegurar que el segundo ticket empiece en una nueva "página" */}
      <div style={{ pageBreakBefore: 'always' }}></div>
      <WorkshopTicket order={orderData} />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Fondo oscuro */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
          />

          {/* El modal con la animación */}
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }} // Empieza desde el centro
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ clipPath: 'circle(0% at 50% 50%)' }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }} // Una curva de easing suave
          >
            {/* Componente invisible para la lógica de impresión */}
            <div className="hidden"><PrintContainer /></div>

            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800">Orden Creada con Éxito</h2>
              <button onClick={() => onClose(true)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-200 p-8 flex justify-center items-start gap-8">
              <div className="w-[80mm] shadow-lg"><ClientTicket order={orderData} /></div>
              <div className="w-[80mm] shadow-lg"><WorkshopTicket order={orderData} /></div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 mt-auto">
              <motion.button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <Printer size={20} />
                Imprimir Ambos Tickets
              </motion.button>
              <motion.button
                onClick={() => onClose(true)}
                className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                Finalizar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}