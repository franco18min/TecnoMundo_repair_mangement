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

  // Log para debugging
  console.log('🖨️ OrderPrinter - Componente renderizado');

  const handlePrint = useReactToPrint({
    content: () => {
      console.log('🖨️ OrderPrinter - Obteniendo contenido para impresión');
      console.log('🖨️ OrderPrinter - componentRef.current:', componentRef.current);
      return componentRef.current;
    },
    onAfterPrint: () => {
        console.log('🖨️ OrderPrinter - Impresión completada, limpiando estado');
        setOrderToPrint(null);
    },
    // Asegurar que los estilos se incluyan en la impresión
    copyStyles: true,
    // Agregar un delay adicional antes de la impresión
    onBeforeGetContent: () => {
      console.log('🖨️ OrderPrinter - onBeforeGetContent ejecutándose...');
      
      // Verificar estado de localStorage
      console.log('🖨️ OrderPrinter - Verificando localStorage...');
      console.log('🖨️ OrderPrinter - globalHeaderStyle_client:', localStorage.getItem('globalHeaderStyle_client'));
      console.log('🖨️ OrderPrinter - globalHeaderStyle_workshop:', localStorage.getItem('globalHeaderStyle_workshop'));
      console.log('🖨️ OrderPrinter - globalTicketBodyStyledContent_client:', localStorage.getItem('globalTicketBodyStyledContent_client'));
      console.log('🖨️ OrderPrinter - globalTicketBodyStyledContent_workshop:', localStorage.getItem('globalTicketBodyStyledContent_workshop'));
      console.log('🖨️ OrderPrinter - globalTicketBodyStyle_client:', localStorage.getItem('globalTicketBodyStyle_client'));
      console.log('🖨️ OrderPrinter - globalTicketBodyStyle_workshop:', localStorage.getItem('globalTicketBodyStyle_workshop'));
      
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('🖨️ OrderPrinter - Delay de 200ms completado antes de obtener contenido');
          resolve();
        }, 200);
      });
    }
  });

  // --- INICIO DE LA MODIFICACIÓN ---
  // Este efecto se ejecutará CADA VEZ que 'orderToPrint' cambie de valor.
  useEffect(() => {
    console.log('🖨️ OrderPrinter - useEffect ejecutado, orderToPrint:', orderToPrint);
    // Si 'orderToPrint' tiene datos (no es null), entonces llamamos a la impresión.
    if (orderToPrint) {
      console.log('🖨️ OrderPrinter - Orden recibida para impresión:', {
        id: orderToPrint.id,
        customer: orderToPrint.customer?.first_name + ' ' + orderToPrint.customer?.last_name,
        branch: orderToPrint.branch?.branch_name
      });
      // Pequeño delay para asegurar que el componente se renderice completamente
      setTimeout(() => {
        console.log('🖨️ OrderPrinter - Ejecutando handlePrint después de 50ms');
        handlePrint();
      }, 50); // Reducido a 50ms ya que onBeforeGetContent maneja el delay principal
    }
  }, [orderToPrint]); // El array de dependencias asegura que solo se ejecute cuando cambia orderToPrint

  // La función expuesta ahora solo se encarga de cambiar el estado.
  useImperativeHandle(ref, () => ({
    triggerPrint(order) {
      console.log('🖨️ OrderPrinter - triggerPrint llamado con orden:', order?.id);
      setOrderToPrint(order);
    }
  }));
  // --- FIN DE LA MODIFICACIÓN ---


  if (!orderToPrint) {
    console.log('🖨️ OrderPrinter - No hay orden para imprimir, retornando null');
    return null;
  }

  console.log('🖨️ OrderPrinter - Renderizando tickets para orden:', orderToPrint.id);

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