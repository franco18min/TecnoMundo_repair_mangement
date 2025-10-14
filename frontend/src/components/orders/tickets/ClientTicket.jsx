// frontend/src/components/tickets/ClientTicket.jsx

import React from 'react';
import { Building2, MapPin, Phone, Mail, Store, Home, Globe } from 'lucide-react';

// Componentes internos para un código más limpio
const Section = ({ title, children, className = '', style = {} }) => (
    <div className={`mt-2 ${className}`} style={style}>
        <p className="font-bold">{title}:</p>
        <div className="text-sm ml-2">{children}</div>
    </div>
);

const HeaderLine = ({ children, style = {} }) => (
    <p className="text-center text-sm" style={style}>{children}</p>
);

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
    console.log('🎫 ClientTicket - Cargando estilos de cabecera...');
    
    // Primero intentar cargar estilos globales de cabecera
    const globalHeaderStyle = localStorage.getItem('globalHeaderStyle_client');
    console.log('🎫 ClientTicket - globalHeaderStyle_client desde localStorage:', globalHeaderStyle);
    
    if (globalHeaderStyle) {
      try {
        const parsed = JSON.parse(globalHeaderStyle);
        console.log('🎫 ClientTicket - Usando estilos globales de cabecera:', parsed);
        return parsed;
      } catch (error) {
        console.error('🎫 ClientTicket - Error parsing global header style:', error);
      }
    }
    
    // Si no hay estilos globales, usar los estilos por sucursal como fallback
    const savedStyle = localStorage.getItem('ticketStyle_client');
    console.log('🎫 ClientTicket - ticketStyle_client desde localStorage:', savedStyle);
    
    if (savedStyle) {
      try {
        const parsed = JSON.parse(savedStyle);
        console.log('🎫 ClientTicket - Usando estilos por sucursal:', parsed);
        return parsed;
      } catch (error) {
        console.error('🎫 ClientTicket - Error parsing saved style:', error);
        return {};
      }
    }
    
    console.log('🎫 ClientTicket - No se encontraron estilos, usando valores por defecto');
    return {};
  };

  const getBodyContent = () => {
    console.log('🎫 ClientTicket - Cargando contenido de cuerpo...');
    
    // Primero intentar cargar el contenido global estilizado
    const globalStyledContent = localStorage.getItem('globalTicketBodyStyledContent_client');
    console.log('🎫 ClientTicket - globalTicketBodyStyledContent_client:', globalStyledContent);
    if (globalStyledContent) {
      console.log('🎫 ClientTicket - Usando contenido global estilizado');
      return globalStyledContent;
    }
    
    // Luego intentar cargar el contenido global original
    const globalContent = localStorage.getItem('globalTicketBodyContent_client');
    console.log('🎫 ClientTicket - globalTicketBodyContent_client:', globalContent);
    if (globalContent) {
      console.log('🎫 ClientTicket - Usando contenido global original');
      return globalContent;
    }
    
    // Si no hay contenido global, usar el contenido por sucursal estilizado
    const styledContent = localStorage.getItem('ticketBodyStyledContent_client');
    console.log('🎫 ClientTicket - ticketBodyStyledContent_client:', styledContent);
    if (styledContent) {
      console.log('🎫 ClientTicket - Usando contenido por sucursal estilizado');
      return styledContent;
    }
    
    // Finalmente, usar el contenido original por sucursal
    const originalContent = localStorage.getItem('ticketBodyContent_client') || '';
    console.log('🎫 ClientTicket - ticketBodyContent_client:', originalContent);
    console.log('🎫 ClientTicket - Usando contenido original por sucursal');
    return originalContent;
  };

  const getClientBodyStyle = () => {
    console.log('🎫 ClientTicket - Cargando estilos de cuerpo...');
    
    // Primero intentar cargar estilos globales de cuerpo
    const globalBodyStyle = localStorage.getItem('globalTicketBodyStyle_client');
    console.log('🎫 ClientTicket - globalTicketBodyStyle_client:', globalBodyStyle);
    if (globalBodyStyle) {
      try {
        const parsed = JSON.parse(globalBodyStyle);
        console.log('🎫 ClientTicket - Usando estilos globales de cuerpo:', parsed);
        return parsed;
      } catch (error) {
        console.error('🎫 ClientTicket - Error parsing global client body style:', error);
      }
    }
    
    // Si no hay estilos globales, usar los estilos por sucursal como fallback
    const savedStyle = localStorage.getItem('ticketBodyStyle_client');
    console.log('🎫 ClientTicket - ticketBodyStyle_client:', savedStyle);
    if (savedStyle) {
      try {
        const parsed = JSON.parse(savedStyle);
        console.log('🎫 ClientTicket - Usando estilos por sucursal de cuerpo:', parsed);
        return parsed;
      } catch (error) {
        console.error('🎫 ClientTicket - Error parsing client body style:', error);
        return {};
      }
    }
    
    console.log('🎫 ClientTicket - No se encontraron estilos de cuerpo, usando valores por defecto');
    return {};
  };

  const ticketStyle = getTicketStyle();
  const bodyContent = getBodyContent();
  const clientBodyStyle = getClientBodyStyle();
  
  console.log('🎫 ClientTicket - Renderizando ticket para orden:', order?.id);
  console.log('🎫 ClientTicket - Estilo de ticket final:', ticketStyle);
  console.log('🎫 ClientTicket - Contenido de cuerpo final:', bodyContent);
  console.log('🎫 ClientTicket - Estilo de cuerpo final:', clientBodyStyle);

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

      {/* Encabezado personalizable por sucursal */}
      {ticketStyle.showHeader !== false && (
        <header className="mb-2" style={headerStyle}>
          {/* Nombre de la empresa */}
          {ticketStyle.showCompanyName !== false && (
            <div style={companyNameStyle}>
              {order.branch?.company_name || 'TECNO MUNDO'}
            </div>
          )}
          
          {/* Información de contacto */}
          {ticketStyle.showContactInfo !== false && (
            <div className="mt-2 space-y-1" style={contactInfoStyle}>
              {ticketStyle.showAddress !== false && order.branch?.address && (
                <HeaderLine style={contactInfoStyle}>{order.branch.address}</HeaderLine>
              )}
              {ticketStyle.showPhone !== false && order.branch?.phone && (
                <HeaderLine style={contactInfoStyle}>{order.branch.phone}</HeaderLine>
              )}
              {ticketStyle.showEmail !== false && order.branch?.email && (
                <HeaderLine style={contactInfoStyle}>{order.branch.email}</HeaderLine>
              )}
            </div>
          )}
          
          {/* Nombre de sucursal con icono */}
          {ticketStyle.showBranchName !== false && order.branch?.branch_name && (
            <div className="mt-2 flex items-center justify-center gap-1 font-medium" style={contactInfoStyle}>
              {ticketStyle.showIcon !== false && getIconComponent(order.branch.icon_name, 12)}
              <span>{order.branch.branch_name}</span>
            </div>
          )}
        </header>
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
    </div>
  );
});