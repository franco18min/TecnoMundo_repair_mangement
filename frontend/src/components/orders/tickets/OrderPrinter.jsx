   // frontend/src/components/tickets/OrderPrinter.jsx

// --- INICIO DE LA MODIFICACIÓN ---
import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
// --- FIN DE LA MODIFICACIÓN ---
import { useReactToPrint } from 'react-to-print';
import { ClientTicket } from './ClientTicket';
import { WorkshopTicket } from './WorkshopTicket';

export const OrderPrinter = forwardRef((props, ref) => {
  const [orderToPrint, setOrderToPrint] = useState(null);
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
        setOrderToPrint(null);
    }
  });

  // --- INICIO DE LA MODIFICACIÓN ---
  // Este efecto se ejecutará CADA VEZ que 'orderToPrint' cambie de valor.
  useEffect(() => {
    // Si 'orderToPrint' tiene datos (no es null), entonces llamamos a la impresión.
    if (orderToPrint) {
      handlePrint();
    }
  }, [orderToPrint]); // El array de dependencias asegura que solo se ejecute cuando cambia orderToPrint

  // La función expuesta ahora solo se encarga de cambiar el estado.
  useImperativeHandle(ref, () => ({
    triggerPrint(order) {
      setOrderToPrint(order);
    }
  }));
  // --- FIN DE LA MODIFICACIÓN ---


  if (!orderToPrint) {
    return null;
  }

  return (
    <div style={{ display: 'none' }}>
      <div ref={componentRef}>
        <ClientTicket order={orderToPrint} />
        <div style={{ pageBreakBefore: 'always' }}></div>
        <WorkshopTicket order={orderToPrint} />
      </div>
    </div>
  );
});