// frontend/src/components/tickets/WorkshopTicket.jsx

import React from 'react';

export const WorkshopTicket = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  return (
    <div ref={ref} className="bg-white p-2 text-black font-mono">
      {/* Estilos de impresión idénticos */}
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 2mm; }
          html, body { width: 80mm; background: #fff !important; color: #000 !important; }
        }
      `}</style>

      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-widest" style={{ fontFamily: '"Courier New", monospace' }}>TECNO</h1>
        <h2 className="text-2xl font-bold tracking-widest" style={{ fontFamily: '"Courier New", monospace' }}>MUNDO</h2>
      </header>

      <div className="text-center my-4">
        <p className="font-bold text-5xl tracking-wider">{String(order.id).padStart(8, '0')}</p>
      </div>

      <footer className="text-center text-xs">
          <p>{order.device_type?.type_name} {order.device_model}</p>
          <p>{order.customer.first_name} {order.customer.last_name}</p>
      </footer>
    </div>
  );
});