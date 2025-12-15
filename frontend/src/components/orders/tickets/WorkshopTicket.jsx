// frontend/src/components/tickets/WorkshopTicket.jsx

import React from 'react';
import { TicketHeader } from './shared/TicketHeader';
import { getOrderUrl, getQrImageUrl } from '../../../utils/qr';
import { getBranchTicketConfig } from '../../../api/branchApi';
import { Building2, MapPin, Phone, Mail, Store, Home, Globe } from 'lucide-react';

// Componentes internos para un código más limpio
const Section = ({ title, children, className = '' }) => (
    <div className={`mt-2 ${className}`}>
        <p className="font-bold">{title}:</p>
        <div className="text-sm ml-2">{children}</div>
    </div>
);

const HeaderLine = ({ children }) => <p className="text-center text-sm">{children}</p>;

// Función para obtener el componente de icono
const getIconComponent = (iconName, size = 16) => {
  const iconMap = {
    'Building': Building2,
    'Building2': Building2,
    'Store': Store,
    'MapPin': MapPin,
    'Home': Home,
    'Globe': Globe
  };
  const IconComponent = iconMap[iconName] || Building2;
  return <IconComponent size={size} />;
};

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
    '[TIPO_DISPOSITIVO]': order.device_type?.name || 'N/A',
    '[MODELO_DISPOSITIVO]': order.device_model || 'N/A',
    '[NUMERO_SERIE]': order.serial_number || 'N/A',
    '[ACCESORIOS]': order.accesories || 'Ninguno',
    '[DESCRIPCION_PROBLEMA]': order.problem_description || 'N/A',
    '[OBSERVACIONES]': order.observations || 'Ninguna',
    '[CLAVE_PATRON]': order.password_or_pattern || 'N/A',
    '[ADELANTO]': order.deposit ? `$${order.deposit.toFixed(2)}` : '$0.00',
    '[COSTO_TOTAL]': order.total_cost ? `$${order.total_cost.toFixed(2)}` : '$0.00',
    '[SALDO]': `$${((order.total_cost || 0) - (order.deposit || 0)).toFixed(2)}`,
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

// Componente principal del ticket del taller
export const WorkshopTicket = React.forwardRef(({ order }, ref) => {
  // Cargar configuraciones de forma síncrona
  const getTicketStyle = () => {
    // Global workshop -> Global client -> Sucursal workshop -> Sucursal client
    const gW = localStorage.getItem('globalHeaderStyle_workshop');
    if (gW) { try { return JSON.parse(gW); } catch {} }
    const gC = localStorage.getItem('globalHeaderStyle_client');
    if (gC) { try { return JSON.parse(gC); } catch {} }
    const sW = localStorage.getItem('ticketStyle_workshop');
    if (sW) { try { return JSON.parse(sW); } catch { return {}; } }
    const sC = localStorage.getItem('ticketStyle_client');
    if (sC) { try { return JSON.parse(sC); } catch { return {}; } }
    return {};
  };

  const getBodyContent = () => {
    // Primero intentar cargar el contenido global estilizado
    const globalStyledContent = localStorage.getItem('globalTicketBodyStyledContent_workshop');
    if (globalStyledContent) {
      return globalStyledContent;
    }
    
    // Luego intentar cargar el contenido global original
    const globalContent = localStorage.getItem('globalTicketBodyContent_workshop');
    if (globalContent) {
      return globalContent;
    }
    
    // Si no hay contenido global, usar el contenido por sucursal estilizado
    const styledContent = localStorage.getItem('ticketBodyStyledContent_workshop');
    if (styledContent) {
      return styledContent;
    }
    
    // Finalmente, usar el contenido original por sucursal
    const originalContent = localStorage.getItem('ticketBodyContent_workshop') || '';
    return originalContent;
  };

  const getWorkshopBodyStyle = () => {
    // Primero intentar cargar estilos globales de cuerpo
    const globalBodyStyle = localStorage.getItem('globalTicketBodyStyle_workshop');
    if (globalBodyStyle) {
      try {
        const parsed = JSON.parse(globalBodyStyle);
        return parsed;
      } catch (error) {
      }
    }
    
    // Si no hay estilos globales, usar los estilos por sucursal como fallback
    const savedStyle = localStorage.getItem('ticketBodyStyle_workshop');
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
        if (cfg.workshop_header_style) {
          try { header = JSON.parse(cfg.workshop_header_style) || {}; } catch {}
        }
        let bodyCfg = {};
        let styled = '';
        if (cfg.workshop_body_style) {
          try {
            const parsed = JSON.parse(cfg.workshop_body_style);
            if (parsed && parsed.config) bodyCfg = parsed.config; else bodyCfg = parsed || {};
            if (parsed && parsed.styledContent) styled = parsed.styledContent;
          } catch {}
        }
        const content = styled && styled.trim() !== '' ? styled : (cfg.workshop_body_content || '');
        try { localStorage.setItem('ticketStyle_workshop', JSON.stringify(header)); } catch {}
        try { localStorage.setItem('ticketBodyStyle_workshop', JSON.stringify(bodyCfg)); } catch {}
        if (styled && styled.trim() !== '') {
          try { localStorage.setItem('ticketBodyStyledContent_workshop', styled); } catch {}
        } else {
          try { localStorage.setItem('ticketBodyContent_workshop', content || ''); } catch {}
          try { localStorage.removeItem('ticketBodyStyledContent_workshop'); } catch {}
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
  const [qrSrc, setQrSrc] = React.useState('');
  React.useEffect(() => {
    if (!order?.id) return;
    const link = getOrderUrl(order.id);
    const size = Number(ticketStyle.qrSizePx || 96);
    const url = getQrImageUrl(link, size);
    setQrSrc(url);
  }, [order?.id, ticketStyle.qrSizePx]);
  const bodyContent = getBodyContent();
  const workshopBodyStyle = getWorkshopBodyStyle();
  
  

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
    fontFamily: workshopBodyStyle.bodyFontFamily || 'monospace',
    fontSize: workshopBodyStyle.bodyFontSize || '12px',
    lineHeight: workshopBodyStyle.bodyLineHeight || '1.4',
    textAlign: workshopBodyStyle.bodyAlignment || 'left'
  };

  // Generar estilos CSS dinámicos para texto seleccionado
  const generateSelectedTextStyles = () => {
    if (!workshopBodyStyle.selectedTextFontSize && !workshopBodyStyle.selectedTextFontWeight && 
        !workshopBodyStyle.selectedTextFontStyle && !workshopBodyStyle.selectedTextDecoration && 
        !workshopBodyStyle.selectedTextAlignment) {
      return '';
    }

    return `
      .selected-text {
        ${workshopBodyStyle.selectedTextFontSize ? `font-size: ${workshopBodyStyle.selectedTextFontSize} !important;` : ''}
        ${workshopBodyStyle.selectedTextFontWeight ? `font-weight: ${workshopBodyStyle.selectedTextFontWeight} !important;` : ''}
        ${workshopBodyStyle.selectedTextFontStyle ? `font-style: ${workshopBodyStyle.selectedTextFontStyle} !important;` : ''}
        ${workshopBodyStyle.selectedTextDecoration ? `text-decoration: ${workshopBodyStyle.selectedTextDecoration} !important;` : ''}
        ${workshopBodyStyle.selectedTextAlignment ? `text-align: ${workshopBodyStyle.selectedTextAlignment} !important;` : ''}
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

      {/* Encabezado unificado */}
      {ticketStyle.showHeader !== false && (
        <TicketHeader ticketStyle={ticketStyle} branch={order.branch} order={order} />
      )}

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
            <h3 className="text-center font-bold text-base mb-2">Orden de Taller</h3>
            <p className="font-bold text-lg text-center mb-2">N° {String(order.id).padStart(8, '0')}</p>
            
            <Section title="Dispositivo" style={bodyStyle}>
              <p>{order.device_type?.type_name} - {order.device_model}</p>
            </Section>
            
            <Section title="Cliente" style={bodyStyle}>
              <p>{order.customer.first_name} {order.customer.last_name}</p>
            </Section>
          </>
        )}
      </div>

      {/* Sección de firma del cliente - Solo para registro interno */}
      <footer className="text-center mt-4" style={bodyStyle}>
        <div className="h-16 border-b border-black w-3/4 mx-auto"></div>
        <p className="text-xs mt-1 text-center w-3/4 mx-auto">Firma del Cliente</p>
        {qrSrc && (
          <div className="mt-3 flex flex-col items-center justify-center">
            <p className="text-xs mb-1" style={{ fontSize: (workshopBodyStyle.qrTextSizePx || 11) }}>{workshopBodyStyle.qrTopText || 'Escaneá para ver tu orden'}</p>
            <img src={qrSrc} alt="QR Orden" style={{ height: workshopBodyStyle.qrSizePx || 96 }} />
            <p className="text-xs mt-1" style={{ whiteSpace: 'nowrap', fontSize: (workshopBodyStyle.qrTextSizePx || 11) }}>
              {workshopBodyStyle.qrBottomText || 'O ingrese N° de orden en '}<span className="font-bold underline">tecnoapp.ar</span>{workshopBodyStyle.qrBottomText ? '' : ' (Clientes)'}
            </p>
          </div>
        )}
      </footer>
    </div>
  );
});

// Encabezado compartido
