// frontend/src/components/tickets/OrderPrinter.jsx

import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ClientTicket } from './ClientTicket';
import { WorkshopTicket } from './WorkshopTicket';

export const OrderPrinter = forwardRef((props, ref) => {
  const [orderToPrint, setOrderToPrint] = useState(null);
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => {
      return componentRef.current;
    },
    onAfterPrint: () => {
        setOrderToPrint(null);
    },
    // Asegurar que los estilos se incluyan en la impresión
    copyStyles: true,
    // Agregar un delay adicional antes de la impresión
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 200);
      });
    }
  });

  // Este efecto se ejecutará CADA VEZ que 'orderToPrint' cambie de valor.
  useEffect(() => {
    // Si 'orderToPrint' tiene datos (no es null), entonces llamamos a la impresión.
    if (orderToPrint) {
      // Pequeño delay para asegurar que el componente se renderice completamente
      setTimeout(() => {
        handlePrint();
      }, 50); // Reducido a 50ms ya que onBeforeGetContent maneja el delay principal
    }
  }, [orderToPrint]); // El array de dependencias asegura que solo se ejecute cuando cambia orderToPrint

  // La función expuesta ahora solo se encarga de cambiar el estado.
  useImperativeHandle(ref, () => ({
    triggerPrint(order) {
      setOrderToPrint(order);
    }
  }));

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