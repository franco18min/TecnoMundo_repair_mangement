// frontend/src/components/tickets/ClientTicket.jsx

import React from 'react';

// Componentes internos para un código más limpio
const Section = ({ title, children, className = '' }) => (
    <div className={`mt-2 ${className}`}>
        <p className="font-bold">{title}:</p>
        <div className="text-sm ml-2">{children}</div>
    </div>
);

const HeaderLine = ({ children }) => <p className="text-center text-sm">{children}</p>;

// Componente principal del ticket del cliente
export const ClientTicket = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  return (
    <div ref={ref} className="bg-white p-2 text-black font-mono">
      {/* Estilos que se aplicarán solo al imprimir */}
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 2mm; }
          html, body { width: 80mm; background: #fff !important; color: #000 !important; }
        }
      `}</style>

      {/* Encabezado basado en la imagen */}
      <header className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-widest" style={{ fontFamily: '"Courier New", monospace' }}>TECNO</h1>
        <h2 className="text-3xl font-bold tracking-widest" style={{ fontFamily: '"Courier New", monospace' }}>MUNDO</h2>
        <div className="mt-2 text-xs">
            <HeaderLine>OTERO 280</HeaderLine>
            <HeaderLine>3884087444</HeaderLine>
            <HeaderLine>INFO@TECNOVENTAS.COM.AR</HeaderLine>
        </div>
      </header>

      <hr className="border-t border-dashed border-black my-2" />

      {/* Cuerpo del Ticket */}
      <div className="text-xs">
        <h3 className="text-center font-bold text-base mb-2">Orden de ingreso</h3>
        <p className="font-bold text-lg text-center mb-2">N° {String(order.id).padStart(8, '0')}</p>

        <p><span className="font-bold">Fecha:</span> {new Date(order.created_at).toLocaleDateString()}</p>
        <p><span className="font-bold">Cliente:</span> {order.customer.first_name} {order.customer.last_name}</p>
        <p><span className="font-bold">Telefono:</span> {order.customer.phone_number}</p>

        <Section title="Modelo">
            <p>{order.device_type?.type_name} {order.device_model}</p>
        </Section>

        <Section title="Falla">
            <p className="whitespace-pre-wrap">{order.problem_description}</p>
        </Section>

        {order.deposit > 0 && (
            <Section title="Adelanto">
                <p className="font-bold text-lg">${order.deposit.toFixed(2)}</p>
            </Section>
        )}

        <Section title="Observaciones">
            <p className="whitespace-pre-wrap">{order.observations || 'Ninguna.'}</p>
        </Section>
      </div>

      <footer className="text-center mt-4">
        <div className="h-16 border-b border-black w-3/4 mx-auto"></div>
        <p className="text-xs mt-1">Firma del Cliente</p>
      </footer>
    </div>
  );
});