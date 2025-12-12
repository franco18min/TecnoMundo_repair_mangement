// frontend/src/components/tickets/OrderPrinter.jsx

import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ClientTicket } from './ClientTicket';
import { WorkshopTicket } from './WorkshopTicket';

export const OrderPrinter = forwardRef((props, ref) => {
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [printConfig, setPrintConfig] = useState({ client: true, workshop: true });
  // Cola de impresión para secuencial
  const [printQueue, setPrintQueue] = useState([]);
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => {
      return componentRef.current;
    },
    onAfterPrint: () => {
        // Si hay cola, remover el actual y seguir
        if (printQueue.length > 0) {
            const nextQueue = [...printQueue];
            nextQueue.shift(); // Sacar el que acabamos de imprimir
            setPrintQueue(nextQueue);
            
            // Si queda algo en la cola, configurarlo para imprimir
            if (nextQueue.length > 0) {
                const nextType = nextQueue[0];
                // Pequeño delay para dar tiempo al navegador a cerrar el diálogo anterior
                setTimeout(() => {
                    setPrintConfig({ 
                        client: nextType === 'client', 
                        workshop: nextType === 'workshop' 
                    });
                    // Forzar re-render y trigger de impresión
                    setOrderToPrint({...orderToPrint, _ts: Date.now()}); 
                }, 500);
            } else {
                setOrderToPrint(null);
            }
        } else {
            setOrderToPrint(null);
        }
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
    triggerPrint(order, config = { client: true, workshop: true }) {
      // Si se pide imprimir AMBOS, iniciamos el modo secuencial
      if (config.client && config.workshop) {
          setPrintQueue(['client', 'workshop']);
          setPrintConfig({ client: true, workshop: false }); // Empezar con cliente
          setOrderToPrint(order);
      } else {
          // Modo simple (solo uno)
          setPrintQueue([]);
          setPrintConfig(config);
          setOrderToPrint(order);
      }
    }
  }));

  if (!orderToPrint) {
    return null;
  }

  return (
    <div style={{ display: 'none' }}>
      <div ref={componentRef}>
        <style>{`
          @media print {
            @page {
              margin: 0;
              size: auto; 
            }
            body {
              margin: 0;
            }
            .ticket-wrapper {
              display: block;
              page-break-inside: avoid;
              break-inside: avoid;
              position: relative;
              padding-bottom: 5mm; /* Margen de seguridad inferior */
            }
          }
        `}</style>
        
        {printConfig.client && (
          <div className="ticket-wrapper">
            <ClientTicket order={orderToPrint} />
          </div>
        )}
        
        {/* En modo secuencial nunca imprimimos los dos a la vez, así que quitamos el separador */}
        
        {printConfig.workshop && (
          <div className="ticket-wrapper">
            <WorkshopTicket order={orderToPrint} />
          </div>
        )}
      </div>
    </div>
  );
});