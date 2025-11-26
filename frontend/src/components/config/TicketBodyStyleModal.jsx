import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader, Eye, Palette, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, RotateCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getBranchTicketConfig, updateBranchTicketConfig } from '../../api/branchApi';

export const TicketBodyStyleModal = ({ isOpen, onClose, ticketType, onSave, branch = null }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [selectedText, setSelectedText] = useState('');
    const [selectionRange, setSelectionRange] = useState(null);
    const [styledContent, setStyledContent] = useState('');
    const previewRef = useRef(null);
    const { showToast } = useToast();

    // Configuración por defecto
    const defaultConfig = {
        bodyFontFamily: 'Arial, sans-serif',
        bodyFontSize: '12px',
        bodyLineHeight: '1.4',
        bodyAlignment: 'left',
        selectedTextFontSize: '12px',
        selectedTextFontWeight: 'normal',
        selectedTextFontStyle: 'normal',
        selectedTextDecoration: 'none',
        selectedTextAlignment: 'left',
        selectedTextColor: '#000000'
    };

    // Configuración de estilos
    const [config, setConfig] = useState(defaultConfig);
    const normalizeConfig = (c) => {
        const cfg = { ...c };
        if (cfg.bodyAlignment == null && cfg.bodyTextAlign) cfg.bodyAlignment = cfg.bodyTextAlign;
        if (cfg.selectedTextAlignment == null && cfg.selectedTextTextAlign) cfg.selectedTextAlignment = cfg.selectedTextTextAlign;
        if (cfg.selectedTextDecoration == null && cfg.selectedTextTextDecoration) cfg.selectedTextDecoration = cfg.selectedTextTextDecoration;
        return cfg;
    };

    // Opciones de configuración
    const fontFamilyOptions = [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Times New Roman, serif', label: 'Times New Roman' },
        { value: 'Courier New, monospace', label: 'Courier New' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
        { value: 'Tahoma, sans-serif', label: 'Tahoma' },
        { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' }
    ];

    const fontSizeOptions = [
        { value: '8px', label: '8px - Muy pequeño' },
        { value: '10px', label: '10px - Pequeño' },
        { value: '12px', label: '12px - Normal' },
        { value: '14px', label: '14px - Mediano' },
        { value: '16px', label: '16px - Grande' },
        { value: '18px', label: '18px - Muy grande' },
        { value: '20px', label: '20px - Extra grande' }
    ];

    const lineHeightOptions = [
        { value: '1.0', label: '1.0 - Muy compacto' },
        { value: '1.2', label: '1.2 - Compacto' },
        { value: '1.4', label: '1.4 - Normal' },
        { value: '1.6', label: '1.6 - Espaciado' },
        { value: '1.8', label: '1.8 - Muy espaciado' },
        { value: '2.0', label: '2.0 - Extra espaciado' }
    ];

    const alignmentOptions = [
        { value: 'left', label: 'Izquierda' },
        { value: 'center', label: 'Centro' },
        { value: 'right', label: 'Derecha' },
        { value: 'justify', label: 'Justificado' }
    ];

    // Cargar configuración y contenido al abrir el modal
    useEffect(() => {
        if (isOpen && ticketType) {
            loadConfiguration();
        }
    }, [isOpen, ticketType, branch]);

    // El contenido se carga únicamente a través de loadConfiguration

    // Forzar re-render de la vista previa cuando styledContent cambie
    useEffect(() => {
        if (styledContent && previewRef.current) {
            // Forzar actualización del DOM
            const previewElement = previewRef.current;
            previewElement.innerHTML = styledContent;
        }
    }, [styledContent]);

    // Guardar automáticamente el contenido estilizado cuando cambie (solo si contiene estilos aplicados)
    useEffect(() => {
        if (styledContent && isOpen && styledContent.includes('<span style=')) {
            // Solo guardar si el contenido tiene estilos aplicados
            if (!branch) {
                const styledContentKey = `globalTicketBodyStyledContent_${ticketType}`;
                console.log('Guardando contenido estilizado automáticamente:', styledContent);
                localStorage.setItem(styledContentKey, styledContent);
            }
        }
    }, [styledContent, isOpen, branch, ticketType]);

    const loadConfiguration = async () => {
        try {
            // Si no hay branch, usar localStorage como fallback
            if (!branch) {
                const storageKey = `globalTicketBodyStyle_${ticketType}`;
                const styledContentKey = `globalTicketBodyStyledContent_${ticketType}`;
                
                const savedConfig = localStorage.getItem(storageKey);
                if (savedConfig) {
                    const parsedConfig = JSON.parse(savedConfig);
                    setConfig(normalizeConfig(parsedConfig));
                }
                
                // Priorizar contenido estilizado guardado
                const savedStyledContent = localStorage.getItem(styledContentKey);
                if (savedStyledContent && savedStyledContent.trim() !== '') {
                    console.log('Cargando contenido estilizado desde localStorage:', savedStyledContent);
                    setStyledContent(savedStyledContent);
                } else {
                    console.log('No hay contenido estilizado guardado, usando contenido original');
                    const content = getCurrentBodyContent();
                    setStyledContent(content);
                }
                return;
            }

            const branchConfig = await getBranchTicketConfig(branch.id);
            
            // Determinar qué campo usar según el tipo de ticket
            const fieldName = ticketType === 'client' ? 'client_body_style' : 'workshop_body_style';
            const contentField = ticketType === 'client' ? 'client_body_content' : 'workshop_body_content';
            
            if (branchConfig[fieldName]) {
                const parsedData = JSON.parse(branchConfig[fieldName]);
                
                // Si el dato guardado tiene la estructura nueva (con config y styledContent)
                if (parsedData && typeof parsedData === 'object' && parsedData.config) {
                    setConfig(normalizeConfig(parsedData.config));
                    if (parsedData.styledContent && parsedData.styledContent.trim() !== '') {
                        console.log('Cargando contenido estilizado desde API:', parsedData.styledContent);
                        setStyledContent(parsedData.styledContent);
                    } else {
                        console.log('No hay contenido estilizado en API, usando contenido de API o contenido original');
                        const content = branchConfig[contentField] || getCurrentBodyContent();
                        setStyledContent(content);
                    }
                } else {
                    // Compatibilidad con formato anterior (solo configuración)
                    setConfig(normalizeConfig(parsedData));
                    console.log('Formato anterior detectado, usando contenido de API o contenido original');
                    const content = branchConfig[contentField] || getCurrentBodyContent();
                    setStyledContent(content);
                }
            } else {
                // Si no hay configuración guardada, cargar contenido original
                const content = branchConfig[contentField] || getCurrentBodyContent();
                setStyledContent(content);
            }
            
        } catch (error) {
            console.error('Error loading branch configuration:', error);
            // Fallback a configuración por defecto
            const content = getCurrentBodyContent();
            setStyledContent(content);
        }
    };

    const saveConfiguration = async () => {
        try {
            // Si no hay branch, usar localStorage como fallback
            if (!branch) {
                const storageKey = `globalTicketBodyStyle_${ticketType}`;
                const styledContentKey = `globalTicketBodyStyledContent_${ticketType}`;
                
                localStorage.setItem(storageKey, JSON.stringify(normalizeConfig(config)));
                localStorage.setItem(styledContentKey, styledContent || '');
                return;
            }

            // Preparar el nombre del campo según el tipo de ticket
            const fieldName = ticketType === 'client' ? 'client_body_style' : 'workshop_body_style';
            
            // Preparar datos para enviar a la API con la estructura correcta
            const dataToSave = {
                config: normalizeConfig(config),
                styledContent: styledContent || ''
            };
            
            const updateData = {
                [fieldName]: JSON.stringify(dataToSave)
            };

            // Guardar configuración en la API
            await updateBranchTicketConfig(branch.id, updateData);
            
        } catch (error) {
            console.error('Error saving configuration:', error);
            throw error;
        }
    };

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    // Manejo de selección de texto
    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && previewRef.current?.contains(selection.anchorNode)) {
            const selectedText = selection.toString();
            if (selectedText.trim()) {
                // Permitir selección de cualquier texto, incluso si está dentro de elementos estilizados
                const range = selection.getRangeAt(0);
                setSelectedText(selectedText);
                setSelectionRange(range.cloneRange());
                
                // Mostrar feedback visual de la selección
                console.log('Texto seleccionado:', selectedText);
            } else {
                // Limpiar selección si no hay texto válido
                setSelectedText('');
                setSelectionRange(null);
            }
        } else {
            // Limpiar selección si no está dentro del área de vista previa
            setSelectedText('');
            setSelectionRange(null);
        }
    };

    const applyStyleToSelection = () => {
        if (selectedText && styledContent && selectionRange) {
            try {
                // Crear el span con estilos aplicados usando estilos inline para garantizar que se mantengan al imprimir
                const styledSpan = `<span style="font-size: ${config.selectedTextFontSize}; font-weight: ${config.selectedTextFontWeight}; font-style: ${config.selectedTextFontStyle}; text-decoration: ${config.selectedTextDecoration}; text-align: ${config.selectedTextAlignment}; color: ${config.selectedTextColor || 'inherit'};">${selectedText}</span>`;
                
                // Escapar caracteres especiales para regex
                const escapedText = selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // Reemplazar solo la primera ocurrencia del texto seleccionado
                const newContent = styledContent.replace(new RegExp(escapedText), styledSpan);
                
                // Actualizar el contenido estilizado y forzar re-render
                setStyledContent(newContent);
                
                // Limpiar la selección
                setSelectedText('');
                setSelectionRange(null);
                
                // Usar setTimeout para asegurar que el DOM se actualice antes de limpiar la selección
                setTimeout(() => {
                    window.getSelection().removeAllRanges();
                }, 100);
                
            } catch (error) {
                console.error('Error applying styles:', error);
                // Limpiar la selección en caso de error
                setSelectedText('');
                setSelectionRange(null);
                window.getSelection().removeAllRanges();
            }
        }
    };

    // Generar estilos CSS dinámicos para texto seleccionado
    const generateSelectedTextStyles = () => {
        return `
            .selected-text-style {
                font-size: ${config.selectedTextFontSize} !important;
                font-weight: ${config.selectedTextFontWeight} !important;
                font-style: ${config.selectedTextFontStyle} !important;
                text-decoration: ${config.selectedTextDecoration} !important;
                text-align: ${config.selectedTextAlignment} !important;
            }
        `;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await saveConfiguration();
            onSave(config);
            showToast('Estilo de cuerpo de ticket actualizado con éxito', 'success');
            onClose();
        } catch (error) {
            console.error('Error saving configuration:', error);
            showToast('Error al guardar la configuración', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetToDefault = () => {
        setConfig({ ...defaultConfig });
        setSelectedText('');
        setSelectionRange(null);
        // Resetear contenido estilizado al contenido original
        const originalContent = getCurrentBodyContent();
        setStyledContent(originalContent);
        // Limpiar contenido estilizado guardado
        const styledContentKey = `globalTicketBodyStyledContent_${ticketType}`;
        localStorage.removeItem(styledContentKey);
        // Limpiar cualquier selección activa
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    };

    // Obtener configuración actual del cuerpo del ticket
    const getCurrentBodyContent = () => {
        // Primero buscar configuración global
        const globalKey = `globalTicketBodyContent_${ticketType}`;
        const globalContent = localStorage.getItem(globalKey);
        
        if (globalContent) {
            return globalContent;
        }

        // Luego buscar configuración específica de sucursal (si existe)
        if (branch) {
            const storageKey = `ticketBodyContent_${ticketType}`;
            const savedContent = localStorage.getItem(storageKey);
            
            if (savedContent) {
                return savedContent;
            }
        }

        // Contenido por defecto según el tipo
        if (ticketType === 'client') {
            return `ORDEN DE REPARACIÓN

DATOS DEL CLIENTE:
Nombre: Juan Pérez
Teléfono: +1234567890
DNI: 12345678

DATOS DEL DISPOSITIVO:
Tipo: Smartphone
Modelo: iPhone 12
Número de Serie: ABC123456
Estado: Pantalla rota

PROBLEMA REPORTADO:
Pantalla completamente rota, no responde al tacto

DIAGNÓSTICO:
Requiere cambio de pantalla completa

COSTOS:
Adelanto: $50
Costo Total: $150
Saldo: $100

FECHA DE ORDEN: 15/01/2024
TÉCNICO ASIGNADO: Carlos Rodríguez`;
        } else {
            return `ORDEN DE TRABAJO - TALLER

ORDEN #: 00001234
FECHA: 15/01/2024
TÉCNICO: Carlos Rodríguez

CLIENTE: Juan Pérez
TELÉFONO: +1234567890

DISPOSITIVO: iPhone 12
MODELO: A2172
SERIE: ABC123456
ESTADO: Pantalla rota

PROBLEMA REPORTADO:
Pantalla completamente rota, no responde al tacto

DIAGNÓSTICO TÉCNICO:
- Pantalla LCD dañada
- Digitalizador no funcional
- Marco interno en buen estado

PROCEDIMIENTO:
1. Desarmar dispositivo
2. Remover pantalla dañada
3. Instalar pantalla nueva
4. Probar funcionalidad
5. Ensamblar dispositivo

REPUESTOS UTILIZADOS:
- Pantalla LCD iPhone 12 Original

CONTROL DE CALIDAD:
✓ Pantalla funcional
✓ Touch responsivo
✓ Cámaras operativas
✓ Botones funcionales`;
        }
    };

    // Componente de vista previa - Memoizado para optimizar re-renders
    const TicketPreview = React.memo(() => {
        const bodyStyle = {
            fontFamily: config.bodyFontFamily,
            fontSize: config.bodyFontSize,
            lineHeight: config.bodyLineHeight,
            textAlign: config.bodyAlignment
        };

        // Forzar re-render cuando styledContent cambia
        React.useEffect(() => {
            if (previewRef.current) {
                // Limpiar cualquier selección activa después de aplicar estilos
                window.getSelection().removeAllRanges();
            }
        }, [styledContent]);

        return (
            <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg">
                <style>{generateSelectedTextStyles()}</style>
                <div 
                    ref={previewRef}
                    style={bodyStyle}
                    onMouseUp={handleTextSelection}
                    className="whitespace-pre-line select-text cursor-text"
                    dangerouslySetInnerHTML={{ __html: styledContent || '' }}
                />
            </div>
        );
    });

    const getModalTitle = () => {
        return ticketType === 'client' 
            ? 'Configurar Estilos - Ticket de Cliente' 
            : 'Configurar Estilos - Ticket de Taller';
    };

    const getModalDescription = () => {
        return ticketType === 'client'
            ? 'Personaliza los estilos de fuente y formato para los tickets que verán los clientes.'
            : 'Configura los estilos de fuente y formato para los tickets internos del taller.';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Type size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {getModalTitle()}
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {getModalDescription()}
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={20} className="text-gray-500" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col lg:flex-row h-[calc(90vh-200px)]">
                            {/* Configuration Panel */}
                            <div className="lg:w-1/2 p-6 border-r overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-800">
                                            Configuración de Estilos
                                        </h3>
                                        <motion.button
                                            onClick={resetToDefault}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <RotateCcw size={14} />
                                            Restaurar por defecto
                                        </motion.button>
                                    </div>
                                    
                                    {/* Estilos generales del cuerpo */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3">Estilos generales del cuerpo</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Fuente del cuerpo
                                                </label>
                                                <select
                                                    value={config.bodyFontFamily}
                                                    onChange={(e) => updateConfig('bodyFontFamily', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                >
                                                    {fontFamilyOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tamaño de fuente del cuerpo
                                                </label>
                                                <select
                                                    value={config.bodyFontSize}
                                                    onChange={(e) => updateConfig('bodyFontSize', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                >
                                                    {fontSizeOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Altura de línea
                                                </label>
                                                <select
                                                    value={config.bodyLineHeight}
                                                    onChange={(e) => updateConfig('bodyLineHeight', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                >
                                                    {lineHeightOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Alineación del texto
                                                </label>
                                                <div className="flex gap-2">
                                                    {alignmentOptions.map(option => (
                                                        <motion.button
                                                            key={option.value}
                                                            onClick={() => updateConfig('bodyAlignment', option.value)}
                                                            className={`flex-1 p-2 rounded-lg border transition-colors ${
                                                                config.bodyAlignment === option.value
                                                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <div className="flex items-center justify-center gap-1">
                                                                {option.value === 'left' && <AlignLeft size={16} />}
                                                                {option.value === 'center' && <AlignCenter size={16} />}
                                                                {option.value === 'right' && <AlignRight size={16} />}
                                                                {option.value === 'justify' && <AlignLeft size={16} />}
                                                                <span className="text-xs">{option.label}</span>
                                                            </div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estilos para texto seleccionado */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3">Estilos para texto seleccionado</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tamaño de fuente
                                                </label>
                                                <select
                                                    value={config.selectedTextFontSize}
                                                    onChange={(e) => updateConfig('selectedTextFontSize', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                >
                                                    {fontSizeOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Peso de fuente
                                                </label>
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        onClick={() => updateConfig('selectedTextFontWeight', 'normal')}
                                                        className={`flex-1 p-2 rounded-lg border transition-colors ${
                                                            config.selectedTextFontWeight === 'normal'
                                                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        Normal
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => updateConfig('selectedTextFontWeight', 'bold')}
                                                        className={`flex-1 p-2 rounded-lg border transition-colors ${
                                                            config.selectedTextFontWeight === 'bold'
                                                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <Bold size={16} className="mx-auto" />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Estilo de fuente
                                                </label>
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        onClick={() => updateConfig('selectedTextFontStyle', 'normal')}
                                                        className={`flex-1 p-2 rounded-lg border transition-colors ${
                                                            config.selectedTextFontStyle === 'normal'
                                                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        Normal
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => updateConfig('selectedTextFontStyle', 'italic')}
                                                        className={`flex-1 p-2 rounded-lg border transition-colors ${
                                                            config.selectedTextFontStyle === 'italic'
                                                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <Italic size={16} className="mx-auto" />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Decoración de texto
                                                </label>
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        onClick={() => updateConfig('selectedTextTextDecoration', 'none')}
                                                        className={`flex-1 p-2 rounded-lg border transition-colors ${
                                                            config.selectedTextTextDecoration === 'none'
                                                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        Normal
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => updateConfig('selectedTextTextDecoration', 'underline')}
                                                        className={`flex-1 p-2 rounded-lg border transition-colors ${
                                                            config.selectedTextTextDecoration === 'underline'
                                                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <Underline size={16} className="mx-auto" />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Color del texto
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={config.selectedTextColor}
                                                        onChange={(e) => updateConfig('selectedTextColor', e.target.value)}
                                                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={config.selectedTextColor}
                                                        onChange={(e) => updateConfig('selectedTextColor', e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        placeholder="#000000"
                                                    />
                                                </div>
                                            </div>

                                            {selectedText && (
                                                <motion.button
                                                    onClick={applyStyleToSelection}
                                                    className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    Aplicar estilos al texto seleccionado: "{selectedText.substring(0, 30)}..."
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Panel */}
                            <div className="lg:w-1/2 p-6 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-800">
                                        Vista Previa del Ticket
                                    </h3>
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Eye size={16} />
                                        {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
                                    </motion.button>
                                </div>
                                
                                <AnimatePresence>
                                    {showPreview && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <TicketPreview />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                {!showPreview && (
                                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-8 rounded-lg text-center">
                                        <Palette size={32} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-500">
                                            Haz clic en "Mostrar Vista Previa" para ver cómo se verá el cuerpo del ticket
                                        </p>
                                    </div>
                                )}

                                {showPreview && selectedText && (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Texto seleccionado:</strong> "{selectedText}"
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Configura los estilos en el panel izquierdo y haz clic en "Aplicar estilos" para aplicarlos.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
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
                                onClick={handleSubmit}
                                disabled={isSubmitting} 
                                className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2" 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                            >
                                {isSubmitting ? (
                                    <Loader size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Guardar Configuración
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
