import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Loader, Eye, Save, AlertCircle, Plus, Check, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getBranchTicketConfig, updateBranchTicketConfig } from '../../api/branchApi';

export function TicketBodyModal({ isOpen, onClose, ticketType, onSave, branch = null }) {
    const [bodyContent, setBodyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
    const [filteredVariables, setFilteredVariables] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);
    const { showToast } = useToast();

    // Variables disponibles para autocompletado
    const availableVariables = [
        // Variables de cliente
        { name: 'NOMBRE_CLIENTE', description: 'Nombre completo del cliente', category: 'Cliente' },
        { name: 'TELEFONO_CLIENTE', description: 'Número de teléfono del cliente', category: 'Cliente' },
        { name: 'DNI_CLIENTE', description: 'DNI del cliente', category: 'Cliente' },
        
        // Variables de dispositivo
        { name: 'TIPO_DISPOSITIVO', description: 'Tipo de dispositivo (smartphone, tablet, etc.)', category: 'Dispositivo' },
        { name: 'MODELO_DISPOSITIVO', description: 'Modelo del dispositivo', category: 'Dispositivo' },
        { name: 'NUMERO_SERIE', description: 'Número de serie del dispositivo', category: 'Dispositivo' },
        { name: 'ACCESORIOS', description: 'Accesorios incluidos con el dispositivo', category: 'Dispositivo' },
        { name: 'CLAVE_PATRON', description: 'Clave o patrón de desbloqueo', category: 'Dispositivo' },
        { name: 'ESTADO_DISPOSITIVO', description: 'Estado actual de la orden (Pendiente, En Proceso, etc.)', category: 'Dispositivo' },
        
        // Variables de orden
        { name: 'NUMERO_ORDEN', description: 'Número único de la orden', category: 'Orden' },
        { name: 'FECHA_ORDEN', description: 'Fecha de creación de la orden', category: 'Orden' },
        { name: 'FECHA_INGRESO', description: 'Fecha de ingreso del dispositivo', category: 'Orden' },
        { name: 'ESTADO_ORDEN', description: 'Estado actual de la orden', category: 'Orden' },
        
        // Variables de técnico
        { name: 'TECNICO_ASIGNADO', description: 'Nombre del técnico asignado', category: 'Técnico' },
        { name: 'DIAGNOSTICO_TECNICO', description: 'Diagnóstico realizado por el técnico', category: 'Técnico' },
        { name: 'NOTAS_TECNICO', description: 'Notas internas del técnico', category: 'Técnico' },
        
        // Variables de problema
        { name: 'DESCRIPCION_PROBLEMA', description: 'Descripción del problema reportado', category: 'Problema' },
        { name: 'OBSERVACIONES', description: 'Observaciones del cliente sobre el problema', category: 'Problema' },
        
        // Variables de costos
        { name: 'ADELANTO', description: 'Monto del adelanto pagado', category: 'Costos' },
        { name: 'COSTO_TOTAL', description: 'Costo total de la reparación', category: 'Costos' },
        { name: 'SALDO', description: 'Saldo pendiente de pago', category: 'Costos' },
        
        // Variables de repuestos
        { name: 'REPUESTO', description: 'Repuestos utilizados en la reparación', category: 'Repuestos' },
        
        // Variables de sucursal
        { name: 'NOMBRE_SUCURSAL', description: 'Nombre de la sucursal', category: 'Sucursal' },
        { name: 'NOMBRE_EMPRESA', description: 'Nombre de la empresa', category: 'Sucursal' },
        { name: 'DIRECCION_SUCURSAL', description: 'Dirección de la sucursal', category: 'Sucursal' },
        { name: 'TELEFONO_SUCURSAL', description: 'Teléfono de la sucursal', category: 'Sucursal' },
        { name: 'EMAIL_SUCURSAL', description: 'Email de la sucursal', category: 'Sucursal' }
    ];

    // Contenido por defecto para cada tipo de ticket
    const defaultContent = {
        client: `ORDEN DE REPARACIÓN

DATOS DEL CLIENTE:
Nombre: [NOMBRE_CLIENTE]
Teléfono: [TELEFONO_CLIENTE]
DNI: [DNI_CLIENTE]

DATOS DEL DISPOSITIVO:
Tipo: [TIPO_DISPOSITIVO]
Modelo: [MODELO_DISPOSITIVO]
Número de Serie: [NUMERO_SERIE]
Accesorios: [ACCESORIOS]
Clave/Patrón: [CLAVE_PATRON]
Estado: [ESTADO_DISPOSITIVO]

PROBLEMA REPORTADO:
[DESCRIPCION_PROBLEMA]

OBSERVACIONES:
[OBSERVACIONES]

DIAGNÓSTICO:
[DIAGNOSTICO_TECNICO]

REPUESTOS UTILIZADOS:
[REPUESTO]

COSTOS:
Adelanto: $[ADELANTO]
Costo Total: $[COSTO_TOTAL]
Saldo: $[SALDO]

FECHA DE ORDEN: [FECHA_ORDEN]
TÉCNICO ASIGNADO: [TECNICO_ASIGNADO]

TÉRMINOS Y CONDICIONES:
- El cliente tiene 30 días para retirar el dispositivo
- No nos hacemos responsables por pérdida de datos
- El presupuesto tiene validez de 15 días`,
        
        workshop: `ORDEN DE TRABAJO - TALLER

ORDEN #: [NUMERO_ORDEN]
FECHA: [FECHA_ORDEN]
TÉCNICO: [TECNICO_ASIGNADO]

CLIENTE: [NOMBRE_CLIENTE]
TELÉFONO: [TELEFONO_CLIENTE]

DISPOSITIVO: [TIPO_DISPOSITIVO]
MODELO: [MODELO_DISPOSITIVO]
SERIE: [NUMERO_SERIE]
ACCESORIOS: [ACCESORIOS]
CLAVE: [CLAVE_PATRON]
ESTADO: [ESTADO_DISPOSITIVO]

PROBLEMA REPORTADO:
[DESCRIPCION_PROBLEMA]

OBSERVACIONES DEL CLIENTE:
[OBSERVACIONES]

DIAGNÓSTICO TÉCNICO:
[DIAGNOSTICO_TECNICO]

NOTAS TÉCNICO:
[NOTAS_TECNICO]

REPUESTOS UTILIZADOS:
[REPUESTO]

COSTOS:
Adelanto: $[ADELANTO]
Costo Total: $[COSTO_TOTAL]
Saldo: $[SALDO]

SUCURSAL:
[NOMBRE_SUCURSAL]
[DIRECCION_SUCURSAL]
Tel: [TELEFONO_SUCURSAL]`
    };

    useEffect(() => {
        if (isOpen) {
            loadBranchConfig();
            setError('');
            setShowPreview(false);
            setShowAutocomplete(false);
        }
    }, [isOpen, ticketType, branch]);

    const loadBranchConfig = async () => {
        try {
            // Si no hay branch, cargar configuración global desde localStorage
            if (!branch) {
                const globalKey = `globalTicketBodyContent_${ticketType}`;
                const globalConfig = localStorage.getItem(globalKey);
                if (globalConfig) {
                    setBodyContent(globalConfig);
                } else {
                    setBodyContent(defaultContent[ticketType] || '');
                }
                return;
            }

            const config = await getBranchTicketConfig(branch.id);
            
            // Determinar qué campo usar según el tipo de ticket
            const fieldName = ticketType === 'client' ? 'client_body_content' : 'workshop_body_content';
            
            if (config[fieldName]) {
                setBodyContent(config[fieldName]);
            } else {
                setBodyContent(defaultContent[ticketType] || '');
            }
        } catch (error) {
            console.error('Error loading branch config:', error);
            // Si hay error, usar configuración por defecto
            setBodyContent(defaultContent[ticketType] || '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Si no hay branch, guardar configuración global en localStorage
            if (!branch) {
                const globalKey = `globalTicketBodyContent_${ticketType}`;
                localStorage.setItem(globalKey, bodyContent);
                showToast('Configuración global guardada exitosamente', 'success');
                onClose();
                return;
            }

            // Guardar configuración de sucursal
            const fieldName = ticketType === 'client' ? 'client_body_content' : 'workshop_body_content';
            const updateData = {
                [fieldName]: bodyContent
            };

            await updateBranchTicketConfig(branch.id, updateData);
            showToast('Configuración de contenido guardada exitosamente', 'success');
            
            if (onSave) {
                onSave();
            }
            
            onClose();
        } catch (error) {
            console.error('Error saving config:', error);
            setError('Error al guardar la configuración. Por favor, inténtalo de nuevo.');
            showToast('Error al guardar la configuración', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetToDefault = () => {
        setBodyContent(defaultContent[ticketType] || '');
        showToast('Contenido restaurado a valores por defecto', 'info');
    };

    // Función para detectar variables utilizadas
    const getUsedVariables = () => {
        const regex = /\[([A-Z_]+)\]/g;
        const matches = bodyContent.match(regex) || [];
        return matches.map(match => match.slice(1, -1)); // Remover los corchetes
    };

    // Función para manejar cambios en el textarea
    const handleContentChange = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        setBodyContent(value);
        setCursorPosition(cursorPos);

        // Detectar si el usuario está escribiendo una variable
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastBracketIndex = textBeforeCursor.lastIndexOf('[');
        const lastCloseBracketIndex = textBeforeCursor.lastIndexOf(']');

        if (lastBracketIndex > lastCloseBracketIndex && lastBracketIndex !== -1) {
            // El usuario está escribiendo una variable
            const searchText = textBeforeCursor.substring(lastBracketIndex + 1);
            setSearchTerm(searchText);
            
            // Filtrar variables que coincidan con el texto de búsqueda
            const filtered = availableVariables.filter(variable =>
                variable.name.toLowerCase().includes(searchText.toLowerCase()) ||
                variable.description.toLowerCase().includes(searchText.toLowerCase())
            );
            
            setFilteredVariables(filtered);
            
            if (filtered.length > 0) {
                // Calcular posición del autocompletado
                const textarea = e.target;
                const textMetrics = getTextMetrics(textarea, textBeforeCursor);
                setAutocompletePosition({
                    top: textMetrics.top + 20,
                    left: textMetrics.left
                });
                setShowAutocomplete(true);
            } else {
                setShowAutocomplete(false);
            }
        } else {
            setShowAutocomplete(false);
        }
    };

    // Función para calcular la posición del cursor en el textarea
    const getTextMetrics = (textarea, text) => {
        const div = document.createElement('div');
        const style = window.getComputedStyle(textarea);
        
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        div.style.font = style.font;
        div.style.padding = style.padding;
        div.style.border = style.border;
        div.style.width = style.width;
        div.style.lineHeight = style.lineHeight;
        
        div.textContent = text;
        document.body.appendChild(div);
        
        const rect = div.getBoundingClientRect();
        const textareaRect = textarea.getBoundingClientRect();
        
        document.body.removeChild(div);
        
        // Calcular posición relativa al textarea
        const lines = text.split('\n');
        const currentLineLength = lines[lines.length - 1].length;
        const lineHeight = parseInt(style.lineHeight) || 20;
        
        return {
            top: (lines.length - 1) * lineHeight + lineHeight + 5, // Posición debajo de la línea actual
            left: Math.min(currentLineLength * 8, textareaRect.width - 200) // Aproximación del ancho de caracteres
        };
    };

    // Función para insertar una variable
    const insertVariable = (variableName) => {
        const textarea = textareaRef.current;
        const cursorPos = cursorPosition;
        const textBeforeCursor = bodyContent.substring(0, cursorPos);
        const textAfterCursor = bodyContent.substring(cursorPos);
        
        // Encontrar el inicio de la variable actual (después del último '[')
        const lastBracketIndex = textBeforeCursor.lastIndexOf('[');
        const beforeVariable = bodyContent.substring(0, lastBracketIndex);
        const variable = `[${variableName}]`;
        
        const newContent = beforeVariable + variable + textAfterCursor;
        const newCursorPos = beforeVariable.length + variable.length;
        
        setBodyContent(newContent);
        setShowAutocomplete(false);
        
        // Enfocar el textarea y posicionar el cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    // Función para manejar teclas especiales
    const handleKeyDown = (e) => {
        if (showAutocomplete) {
            if (e.key === 'Escape') {
                setShowAutocomplete(false);
                e.preventDefault();
            } else if (e.key === 'Enter' && filteredVariables.length > 0) {
                insertVariable(filteredVariables[0].name);
                e.preventDefault();
            }
        }
    };



    // Componente del panel de variables
    const VariablesPanel = () => {
        const usedVariables = getUsedVariables();
        const categories = [...new Set(availableVariables.map(v => v.category))];

        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                    <Search size={16} className="text-gray-500" />
                    <h4 className="font-medium text-gray-800">Variables Disponibles</h4>
                </div>
                
                {categories.map(category => {
                    const categoryVariables = availableVariables.filter(v => v.category === category);
                    return (
                        <div key={category} className="mb-4">
                            <h5 className="text-sm font-medium text-gray-600 mb-2 border-b border-gray-200 pb-1">
                                {category}
                            </h5>
                            <div className="space-y-1">
                                {categoryVariables.map(variable => {
                                    const isUsed = usedVariables.includes(variable.name);
                                    return (
                                        <motion.button
                                            key={variable.name}
                                            onClick={() => insertVariable(variable.name)}
                                            className={`w-full text-left p-2 rounded-md text-xs transition-colors ${
                                                isUsed 
                                                    ? 'bg-green-100 border border-green-300 text-green-800' 
                                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                                            }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {isUsed ? (
                                                        <Check size={12} className="text-green-600" />
                                                    ) : (
                                                        <Plus size={12} className="text-gray-400" />
                                                    )}
                                                    <span className="font-mono font-medium">
                                                        [{variable.name}]
                                                    </span>
                                                </div>
                                                {isUsed && (
                                                    <span className="text-xs text-green-600 font-medium">
                                                        En uso
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 ml-5">
                                                {variable.description}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Componente de autocompletado
    const AutocompleteDropdown = () => (
        <AnimatePresence>
            {showAutocomplete && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                    style={{
                        top: autocompletePosition.top,
                        left: autocompletePosition.left,
                        minWidth: '250px'
                    }}
                >
                    {filteredVariables.length > 0 ? (
                        <div className="p-2">
                            <div className="text-xs text-gray-500 mb-2 px-2">
                                Presiona Enter para insertar la primera opción
                            </div>
                            {filteredVariables.slice(0, 8).map((variable, index) => (
                                <motion.button
                                    key={variable.name}
                                    onClick={() => insertVariable(variable.name)}
                                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                                        index === 0 
                                            ? 'bg-blue-100 border border-blue-300 text-blue-800' 
                                            : 'hover:bg-gray-100'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="font-mono font-medium">
                                        [{variable.name}]
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {variable.description}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No se encontraron variables
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );

    const TicketPreview = () => {
        // Obtener configuración de estilos actual
        const getBodyStyleConfig = () => {
            const storageKey = `ticketBodyStyle_${ticketType}`;
            const savedConfig = localStorage.getItem(storageKey);
            if (savedConfig) {
                try {
                    return JSON.parse(savedConfig);
                } catch (error) {
                    console.error('Error parsing body style config:', error);
                    return {};
                }
            }
            return {};
        };

        // Obtener configuración de cabecera actual
        const getHeaderStyleConfig = () => {
            const storageKey = `ticketStyle_${ticketType}`;
            const savedConfig = localStorage.getItem(storageKey);
            if (savedConfig) {
                try {
                    return JSON.parse(savedConfig);
                } catch (error) {
                    console.error('Error parsing header style config:', error);
                    return {};
                }
            }
            return {};
        };

        const bodyStyleConfig = getBodyStyleConfig();
        const headerStyleConfig = getHeaderStyleConfig();

        // Estilos dinámicos basados en configuración
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
            textAlign: bodyStyleConfig.bodyAlignment || 'left',
            whiteSpace: 'pre-wrap'
        };

        // Datos de ejemplo para la cabecera
        const sampleBranch = {
            company_name: 'TECNO MUNDO',
            address: 'Av. Principal 123, Ciudad',
            phone: '+1 (555) 123-4567',
            email: 'info@tecnomundo.com',
            name: 'Sucursal Principal'
        };

        return (
            <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg">
                {/* Cabecera del ticket */}
                {headerStyleConfig.showHeader !== false && (
                    <header style={headerStyle} className="mb-4">
                        {headerStyleConfig.showCompanyName !== false && (
                            <div style={companyNameStyle}>
                                {sampleBranch.company_name}
                            </div>
                        )}
                        
                        {headerStyleConfig.showContactInfo !== false && (
                            <div className="space-y-1" style={contactInfoStyle}>
                                {headerStyleConfig.showAddress !== false && sampleBranch.address && (
                                    <div>{sampleBranch.address}</div>
                                )}
                                {headerStyleConfig.showPhone !== false && sampleBranch.phone && (
                                    <div>Tel: {sampleBranch.phone}</div>
                                )}
                                {headerStyleConfig.showEmail !== false && sampleBranch.email && (
                                    <div>Email: {sampleBranch.email}</div>
                                )}
                            </div>
                        )}

                        {headerStyleConfig.showBranchName !== false && (
                            <div style={contactInfoStyle} className="mt-2">
                                {sampleBranch.name}
                            </div>
                        )}

                        {headerStyleConfig.showDivider !== false && (
                            <div className="border-t border-gray-400 my-2"></div>
                        )}
                    </header>
                )}

                {/* Cuerpo del ticket */}
                <div style={bodyStyle}>
                    {bodyContent || 'El contenido del ticket aparecerá aquí...'}
                </div>
            </div>
        );
    };

    const getTicketTitle = () => {
        return ticketType === 'client' ? 'Ticket de Cliente' : 'Ticket de Taller';
    };

    const getTicketDescription = () => {
        return ticketType === 'client' 
            ? 'Personaliza el contenido del ticket que se entregará al cliente con los detalles de la reparación.'
            : 'Configura el formato del ticket interno utilizado por técnicos y personal del taller.';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                    >
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Editor de {getTicketTitle()}
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {getTicketDescription()}
                                </p>
                            </div>
                            <motion.button 
                                onClick={onClose} 
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <X size={24} />
                            </motion.button>
                        </div>

                        <div className="p-6">
                            {/* Editor y Vista Previa al mismo nivel */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Editor de contenido */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">
                                            Editor de Contenido
                                        </h3>
                                        <motion.button
                                            type="button"
                                            onClick={resetToDefault}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Restaurar por defecto
                                        </motion.button>
                                    </div>
                                    
                                    <form id="ticket-body-form" onSubmit={handleSubmit}>
                                        <div className="relative">
                                            <textarea
                                                ref={textareaRef}
                                                value={bodyContent}
                                                onChange={handleContentChange}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Escribe el contenido del ticket aquí... Usa [ para autocompletar variables"
                                                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-none"
                                                style={{ minHeight: '400px' }}
                                            />
                                            <AutocompleteDropdown />
                                        </div>
                                    </form>
                                </div>

                                {/* Vista Previa del Ticket */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">
                                            Vista Previa del Ticket
                                        </h3>
                                        <motion.button
                                            type="button"
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Eye size={16} />
                                            {showPreview ? 'Ocultar' : 'Mostrar'}
                                        </motion.button>
                                    </div>
                                    
                                    <div className="h-96" style={{ minHeight: '400px' }}>
                                        <AnimatePresence>
                                            {showPreview ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="h-full overflow-y-auto border border-gray-300 rounded-lg"
                                                >
                                                    <TicketPreview />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col items-center justify-center"
                                                >
                                                    <FileText size={32} className="text-gray-400 mb-2" />
                                                    <p className="text-gray-500 text-center px-4">
                                                        Haz clic en "Mostrar" para ver cómo se verá el ticket
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Consejos de uso y Variables disponibles al mismo nivel */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Consejos de uso */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Consejos de uso:</p>
                                            <ul className="text-xs space-y-1">
                                                <li>• Escribe <code className="bg-blue-100 px-1 rounded">[</code> para activar el autocompletado</li>
                                                <li>• Presiona <code className="bg-blue-100 px-1 rounded">Enter</code> para insertar la primera sugerencia</li>
                                                <li>• Presiona <code className="bg-blue-100 px-1 rounded">Escape</code> para cerrar el autocompletado</li>
                                                <li>• Las variables en verde ya están siendo utilizadas</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Panel de variables */}
                                <div>
                                    <VariablesPanel />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            {error && <p className="text-red-500 text-sm mr-auto self-center">{error}</p>}
                            <motion.button 
                                type="button" 
                                onClick={onClose} 
                                className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300" 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancelar
                            </motion.button>
                            <motion.button 
                                type="submit" 
                                form="ticket-body-form" 
                                disabled={isSubmitting} 
                                className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2" 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                            >
                                {isSubmitting ? (
                                    <Loader size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Guardar Cambios
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}