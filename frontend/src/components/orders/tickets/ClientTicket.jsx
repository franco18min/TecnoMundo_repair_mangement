// frontend/src/components/tickets/ClientTicket.jsx

import React from 'react';
import { TicketHeader } from './shared/TicketHeader';
import { getOrderUrl, getQrImageUrl } from '../../../utils/qr';
import { getBranchTicketConfig } from '../../../api/branchApi';

// Componentes internos para un código más limpio
const Section = ({ title, children, className = '', style = {} }) => (
    <div className={`mt-2 ${className}`} style={style}>
        <p className="font-bold">{title}:</p>
        <div className="text-sm ml-2">{children}</div>
    </div>
);

 

// Función para procesar variables en el contenido
const processVariables = (content, order) => {
  if (!content || !order) return content;
  
  const variables = {
    '[NUMERO_ORDEN]': String(order.id).padStart(8, '0'),
    '[FECHA_ORDEN]': new Date(order.created_at).toLocaleDateString(),
    '[FECHA_INGRESO]': new Date(order.created_at).toLocaleDateString(),
    '[ESTADO_DISPOSITIVO]': order.status?.status_name || 'Pendiente',
    '[NOMBRE_CLIENTE]': order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 'N/A',
    '[TELEFONO_CLIENTE]': order.customer?.phone_number || 'N/A',
    '[DNI_CLIENTE]': order.customer?.dni || 'N/A',
    '[TIPO_DISPOSITIVO]': (order.device_type?.type_name || order.device_type?.name) || 'N/A',
    '[MODELO_DISPOSITIVO]': order.device_model || 'N/A',
    '[NUMERO_SERIE]': order.serial_number || 'N/A',
    '[ACCESORIOS]': order.accesories || 'Ninguno',
    '[DESCRIPCION_PROBLEMA]': order.problem_description || 'N/A',
    '[OBSERVACIONES]': order.observations || 'Ninguna',
    '[CLAVE_PATRON]': order.password_or_pattern || 'N/A',
    '[ADELANTO]': order.deposit ? `$${order.deposit.toFixed(2)}` : '$0.00',
    '[COSTO_TOTAL]': order.total_cost ? `$${order.total_cost.toFixed(2)}` : '$0.00',
    '[SALDO]': order.balance ? `$${order.balance.toFixed(2)}` : '$0.00',
    '[REPUESTO]': order.parts_used || 'N/A',
    '[TECNICO_ASIGNADO]': order.technician?.full_name || 'No asignado',
    '[DIAGNOSTICO_TECNICO]': order.technician_diagnosis || 'Pendiente',
    '[NOTAS_TECNICO]': order.repair_notes || 'N/A',
    '[NOMBRE_SUCURSAL]': order.branch?.name || 'N/A',
    '[NOMBRE_EMPRESA]': order.branch?.company_name || 'TECNO MUNDO',
    '[DIRECCION_SUCURSAL]': order.branch?.address || 'N/A',
    '[TELEFONO_SUCURSAL]': order.branch?.phone || 'N/A',
    '[EMAIL_SUCURSAL]': order.branch?.email || 'N/A'
  };

  let processedContent = content;
  Object.entries(variables).forEach(([variable, value]) => {
    processedContent = processedContent.replace(new RegExp(variable.replace(/[[\]]/g, '\\$&'), 'g'), value);
  });

  return processedContent;
};

// Componente principal del ticket del cliente
export const ClientTicket = React.forwardRef(({ order }, ref) => {
  // Cargar configuraciones de forma síncrona
  const getTicketStyle = () => {
    // Primero intentar cargar estilos globales de cabecera
    const globalHeaderStyle = localStorage.getItem('globalHeaderStyle_client');
    
    if (globalHeaderStyle) {
      try {
        const parsed = JSON.parse(globalHeaderStyle);
        return parsed;
      } catch (error) {
      }
    }
    
    // Si no hay estilos globales, usar los estilos por sucursal como fallback
    const savedStyle = localStorage.getItem('ticketStyle_client');
    
    if (savedStyle) {
      try {
        const parsed = JSON.parse(savedStyle);
        return parsed;
      } catch (error) {
        return {};
      }
    }
    
    return {};
  };

  const getBodyContent = () => {
    // Primero intentar cargar el contenido global estilizado
    const globalStyledContent = localStorage.getItem('globalTicketBodyStyledContent_client');
    if (globalStyledContent) {
      return globalStyledContent;
    }
    
    // Luego intentar cargar el contenido global original
    const globalContent = localStorage.getItem('globalTicketBodyContent_client');
    if (globalContent) {
      return globalContent;
    }
    
    // Si no hay contenido global, usar el contenido por sucursal estilizado
    const styledContent = localStorage.getItem('ticketBodyStyledContent_client');
    if (styledContent) {
      return styledContent;
    }
    
    // Finalmente, usar el contenido original por sucursal
    const originalContent = localStorage.getItem('ticketBodyContent_client') || '';
    return originalContent;
  };

  const getClientBodyStyle = () => {
    // Primero intentar cargar estilos globales de cuerpo
    const globalBodyStyle = localStorage.getItem('globalTicketBodyStyle_client');
    if (globalBodyStyle) {
      try {
        const parsed = JSON.parse(globalBodyStyle);
        return parsed;
      } catch (error) {
      }
    }
    
    // Si no hay estilos globales, usar los estilos por sucursal como fallback
    const savedStyle = localStorage.getItem('ticketBodyStyle_client');
    if (savedStyle) {
      try {
        const parsed = JSON.parse(savedStyle);
        return parsed;
      } catch (error) {
        return {};
      }
    }
    
    return {};
  };

  const [rev, setRev] = React.useState(0);
  React.useEffect(() => {
    const run = async () => {
      if (!order?.branch?.id) return;
      try {
        const cfg = await getBranchTicketConfig(order.branch.id);
        let header = {};
        if (cfg.client_header_style) {
          try { header = JSON.parse(cfg.client_header_style) || {}; } catch {}
        }
        let bodyCfg = {};
        let styled = '';
        if (cfg.client_body_style) {
          try {
            const parsed = JSON.parse(cfg.client_body_style);
            if (parsed && parsed.config) bodyCfg = parsed.config; else bodyCfg = parsed || {};
            if (parsed && parsed.styledContent) styled = parsed.styledContent;
          } catch {}
        }
        const content = styled && styled.trim() !== '' ? styled : (cfg.client_body_content || '');
        try { localStorage.setItem('ticketStyle_client', JSON.stringify(header)); } catch {}
        try { localStorage.setItem('ticketBodyStyle_client', JSON.stringify(bodyCfg)); } catch {}
        if (styled && styled.trim() !== '') {
          try { localStorage.setItem('ticketBodyStyledContent_client', styled); } catch {}
        } else {
          try { localStorage.setItem('ticketBodyContent_client', content || ''); } catch {}
          try { localStorage.removeItem('ticketBodyStyledContent_client'); } catch {}
        }
        setRev(x => x + 1);
      } catch {}
    };
    run();
  }, [order?.branch?.id]);

  let ticketStyle = getTicketStyle();
  if (typeof ticketStyle.showLogo === 'undefined') {
    ticketStyle = { ...ticketStyle, showLogo: true };
  }
  const bodyContent = getBodyContent();
  const clientBodyStyle = getClientBodyStyle();
  const [qrSrc, setQrSrc] = React.useState('');
  React.useEffect(() => {
    if (!order?.id) return;
    const link = getOrderUrl(order.id);
    const size = Number(ticketStyle.qrSizePx || 96);
    const url = getQrImageUrl(link, size);
    setQrSrc(url);
  }, [order?.id, ticketStyle.qrSizePx]);
  
  

  if (!order) return null;

  // Estilos dinámicos basados en configuración
  const headerStyle = {
    fontFamily: ticketStyle.headerFontFamily || 'monospace',
    fontSize: ticketStyle.headerFontSize || '14px',
    textAlign: ticketStyle.headerAlignment || 'center'
  };

  const companyNameStyle = {
    ...headerStyle,
    fontSize: ticketStyle.companyNameFontSize || '24px',
    fontWeight: 'bold',
    letterSpacing: '0.1em',
    marginBottom: '4px'
  };

  const contactInfoStyle = {
    ...headerStyle,
    fontSize: ticketStyle.contactInfoFontSize || '12px'
  };

  const bodyStyle = {
    fontFamily: clientBodyStyle.bodyFontFamily || 'monospace',
    fontSize: clientBodyStyle.bodyFontSize || '12px',
    lineHeight: clientBodyStyle.bodyLineHeight || '1.4',
    textAlign: clientBodyStyle.bodyAlignment || 'left'
  };

  // Generar estilos CSS dinámicos para texto seleccionado
  const generateSelectedTextStyles = () => {
    if (!clientBodyStyle.selectedTextFontSize && !clientBodyStyle.selectedTextFontWeight && 
        !clientBodyStyle.selectedTextFontStyle && !clientBodyStyle.selectedTextDecoration && 
        !clientBodyStyle.selectedTextAlignment) {
      return '';
    }

    return `
      .selected-text {
        ${clientBodyStyle.selectedTextFontSize ? `font-size: ${clientBodyStyle.selectedTextFontSize} !important;` : ''}
        ${clientBodyStyle.selectedTextFontWeight ? `font-weight: ${clientBodyStyle.selectedTextFontWeight} !important;` : ''}
        ${clientBodyStyle.selectedTextFontStyle ? `font-style: ${clientBodyStyle.selectedTextFontStyle} !important;` : ''}
        ${clientBodyStyle.selectedTextDecoration ? `text-decoration: ${clientBodyStyle.selectedTextDecoration} !important;` : ''}
        ${clientBodyStyle.selectedTextAlignment ? `text-align: ${clientBodyStyle.selectedTextAlignment} !important;` : ''}
      }
    `;
  };

  return (
    <div ref={ref} className="bg-white p-2 text-black" style={{ fontFamily: bodyStyle.fontFamily }}>
      {/* Estilos que se aplicarán solo al imprimir */}
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 2mm; }
          html, body { width: 80mm; background: #fff !important; color: #000 !important; }
        }
        ${generateSelectedTextStyles()}
      `}</style>

      <TicketHeader ticketStyle={ticketStyle} branch={order.branch} order={order} />

      {ticketStyle.showDivider !== false && (
        <hr className="border-t border-dashed border-black my-2" />
      )}

      {/* Cuerpo del Ticket */}
      <div style={bodyStyle}>
        {bodyContent ? (
          <div 
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: processVariables(bodyContent, order).replace(/\n/g, '<br/>') 
            }}
          />
        ) : (
          // Contenido por defecto si no hay configuración personalizada
          <>
            <h3 className="text-center font-bold text-base mb-2">Orden de ingreso</h3>
            <p className="font-bold text-lg text-center mb-2">N° {String(order.id).padStart(8, '0')}</p>

            <p><span className="font-bold">Fecha:</span> {new Date(order.created_at).toLocaleDateString()}</p>
            <p><span className="font-bold">Cliente:</span> {order.customer.first_name} {order.customer.last_name}</p>
            <p><span className="font-bold">Telefono:</span> {order.customer.phone_number}</p>

            <Section title="Modelo" style={bodyStyle}>
                <p>{order.device_type?.type_name} {order.device_model}</p>
            </Section>

            <Section title="Falla" style={bodyStyle}>
                <p className="whitespace-pre-wrap">{order.problem_description}</p>
            </Section>

            {order.deposit > 0 && (
                <Section title="Adelanto" style={bodyStyle}>
                    <p className="font-bold text-lg">${order.deposit.toFixed(2)}</p>
                </Section>
            )}

            <Section title="Observaciones" style={bodyStyle}>
                <p className="whitespace-pre-wrap">{order.observations || 'Ninguna.'}</p>
            </Section>
          </>
        )}
      </div>
      <footer className="text-center mt-4" style={bodyStyle}>
        <div className="h-16 border-b border-black w-3/4 mx-auto"></div>
        <p className="text-xs mt-1 text-center w-3/4 mx-auto">Firma del Cliente</p>
        {qrSrc && (
          <div className="mt-3 flex flex-col items-center justify-center">
            <p className="text-xs mb-1" style={{ fontSize: (clientBodyStyle.qrTextSizePx || 11) }}>{clientBodyStyle.qrTopText || 'Escaneá para ver tu orden'}</p>
            <img src={qrSrc} alt="QR Orden" style={{ height: clientBodyStyle.qrSizePx || 96 }} />
            <p className="text-xs mt-1" style={{ whiteSpace: 'nowrap', fontSize: (clientBodyStyle.qrTextSizePx || 11) }}>
              {clientBodyStyle.qrBottomText || 'O ingrese N° de orden en '}<span className="font-bold underline">tecnoapp.ar</span>{clientBodyStyle.qrBottomText ? '' : ' (Clientes)'}
            </p>
          </div>
        )}
      </footer>
    </div>
  );
});

// Encabezado compartido
