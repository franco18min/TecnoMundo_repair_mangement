import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Store, Home, Globe } from 'lucide-react';
import { fetchTicketConfigByType, defaultConfigurations } from '../../../api/ticketConfigApi';

// --- INICIO DE LA MODIFICACIÓN ---
const Section = ({ children, className = '', style = {} }) => (
    <div className={`mt-2 ${className}`} style={style}>
        <div className="text-sm ml-2">{children}</div>
    </div>
);
// --- FIN DE LA MODIFICACIÓN ---

const HeaderLine = ({ children, style = {} }) => (
    <p className="text-center text-sm" style={style}>{children}</p>
);

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
    processedContent = processedContent.replace(new RegExp(variable.replace(/[[\\]]/g, '\\$&'), 'g'), value);
  });

  return processedContent;
};

export const ClientTicket = React.forwardRef(({ order }, ref) => {
    // --- INICIO DE LA MODIFICACIÓN ---
    const [headerStyleConfig, setHeaderStyleConfig] = useState({});
    const [bodyStyleConfig, setBodyStyleConfig] = useState({});
    const [bodyContent, setBodyContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadConfigs = async () => {
            try {
                setLoading(true);

                const headerConf = await fetchTicketConfigByType('client_header_style');
                setHeaderStyleConfig(headerConf ? JSON.parse(headerConf.config_value) : defaultConfigurations.client_header_style);

                const bodyStyleConf = await fetchTicketConfigByType('client_body_style');
                const bodyStyleData = bodyStyleConf ? JSON.parse(bodyStyleConf.config_value) : {};
                setBodyStyleConfig(bodyStyleData.styleConfig || defaultConfigurations.client_body_style.styleConfig);

                if (bodyStyleData.styledContent) {
                    setBodyContent(bodyStyleData.styledContent);
                } else {
                    const bodyContentConf = await fetchTicketConfigByType('client_body');
                    setBodyContent(bodyContentConf ? JSON.parse(bodyContentConf.config_value).content : defaultConfigurations.client_body.content);
                }
            } catch (error) {
                console.error("Error loading ticket configurations:", error);
                // Fallback to defaults in case of error
                setHeaderStyleConfig(defaultConfigurations.client_header_style);
                setBodyStyleConfig(defaultConfigurations.client_body_style.styleConfig);
                setBodyContent(defaultConfigurations.client_body.content);
            } finally {
                setLoading(false);
            }
        };

        if (order) {
            loadConfigs();
        }
    }, [order]);
    // --- FIN DE LA MODIFICACIÓN ---

    if (!order || loading) return <div ref={ref}>Cargando ticket...</div>;

    const headerStyle = {
        fontFamily: headerStyleConfig.headerFontFamily || 'monospace',
        fontSize: headerStyleConfig.headerFontSize || '14px',
        textAlign: headerStyleConfig.headerAlignment || 'center'
    };

    const companyNameStyle = {
        ...headerStyle,
        fontSize: headerStyleConfig.companyNameFontSize || '24px',
        fontWeight: 'bold',
        letterSpacing: '0.1em',
        marginBottom: '4px'
    };

    const contactInfoStyle = {
        ...headerStyle,
        fontSize: headerStyleConfig.contactInfoFontSize || '12px'
    };

    const bodyStyle = {
        fontFamily: bodyStyleConfig.bodyFontFamily || 'monospace',
        fontSize: bodyStyleConfig.bodyFontSize || '12px',
        lineHeight: bodyStyleConfig.bodyLineHeight || '1.4',
        textAlign: bodyStyleConfig.bodyAlignment || 'left'
    };

    const generateSelectedTextStyles = () => {
        if (!bodyStyleConfig.selectedTextFontSize && !bodyStyleConfig.selectedTextFontWeight && 
            !bodyStyleConfig.selectedTextFontStyle && !bodyStyleConfig.selectedTextDecoration && 
            !bodyStyleConfig.selectedTextAlignment) {
          return '';
        }
    
        return `
          .selected-text {
            ${bodyStyleConfig.selectedTextFontSize ? `font-size: ${bodyStyleConfig.selectedTextFontSize} !important;` : ''}
            ${bodyStyleConfig.selectedTextFontWeight ? `font-weight: ${bodyStyleConfig.selectedTextFontWeight} !important;` : ''}
            ${bodyStyleConfig.selectedTextFontStyle ? `font-style: ${bodyStyleConfig.selectedTextFontStyle} !important;` : ''}
            ${bodyStyleConfig.selectedTextDecoration ? `text-decoration: ${bodyStyleConfig.selectedTextDecoration} !important;` : ''}
            ${bodyStyleConfig.selectedTextAlignment ? `text-align: ${bodyStyleConfig.selectedTextAlignment} !important;` : ''}
          }
        `;
      };

    return (
        <div ref={ref} className="bg-white p-2 text-black" style={{ fontFamily: bodyStyle.fontFamily }}>
            <style>{`
                @media print {
                    @page { size: 80mm auto; margin: 2mm; }
                    html, body { width: 80mm; background: #fff !important; color: #000 !important; }
                }
                ${generateSelectedTextStyles()}
            `}</style>

            {headerStyleConfig.showHeader !== false && (
                <header className="mb-2" style={headerStyle}>
                    {headerStyleConfig.showCompanyName !== false && (
                        <div style={companyNameStyle}>
                            {order.branch?.company_name || 'TECNO MUNDO'}
                        </div>
                    )}
                    
                    {headerStyleConfig.showContactInfo !== false && (
                        <div className="mt-2 space-y-1" style={contactInfoStyle}>
                            {headerStyleConfig.showAddress !== false && order.branch?.address && (
                                <HeaderLine style={contactInfoStyle}>{order.branch.address}</HeaderLine>
                            )}
                            {headerStyleConfig.showPhone !== false && order.branch?.phone && (
                                <HeaderLine style={contactInfoStyle}>{order.branch.phone}</HeaderLine>
                            )}
                            {headerStyleConfig.showEmail !== false && order.branch?.email && (
                                <HeaderLine style={contactInfoStyle}>{order.branch.email}</HeaderLine>
                            )}
                        </div>
                    )}
                    
                    {headerStyleConfig.showBranchName !== false && order.branch?.branch_name && (
                        <div className="mt-2 flex items-center justify-center gap-1 font-medium" style={contactInfoStyle}>
                            {headerStyleConfig.showIcon !== false && getIconComponent(order.branch.icon_name, 12)}
                            <span>{order.branch.branch_name}</span>
                        </div>
                    )}
                </header>
            )}

            {headerStyleConfig.showDivider !== false && (
                <hr className="border-t border-dashed border-black my-2" />
            )}

            <div style={bodyStyle}>
                <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                        __html: processVariables(bodyContent, order).replace(/\n/g, '<br/>') 
                    }}
                />
            </div>

            <footer className="text-center mt-4" style={bodyStyle}>
                <div className="h-16 border-b border-black w-3/4 mx-auto"></div>
                <p className="text-xs mt-1">Firma del Cliente</p>
            </footer>
        </div>
    );
});