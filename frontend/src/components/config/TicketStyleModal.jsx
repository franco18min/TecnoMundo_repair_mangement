import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Type, Layout, Eye, Save, Loader } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getBranchTicketConfig, updateBranchTicketConfig } from '../../api/branchApi';

export function TicketStyleModal({ isOpen, onClose, branch, ticketType = 'client', onSave }) {
    const [styleConfig, setStyleConfig] = useState({
        // Configuración de cabecera
        showHeader: true,
        showCompanyName: true,
        showAddress: true,
        showPhone: true,
        showEmail: true,
        showBranchName: true,
        showIcon: true,
        branchIcon: 'Building2',
        showContactInfo: true,
        showDivider: true,

        // Logo
        showLogo: true,
        logoPosition: 'top', // top | left | right
        logoHeightPx: 28,
        logoMarginBottomPx: 2,
        
        // Estilos de cabecera
        headerFontFamily: '"Courier New", monospace',
        headerFontSize: '16px',
        headerAlignment: 'center',
        companyNameFontSize: '24px',
        contactInfoFontSize: '12px',
        branchNameFontSize: '12px',
        

        
        // Espaciado y diseño
        headerSpacing: 'normal',
        bodySpacing: 'normal',
        headerStyle: 'simple' // simple, bordered, highlighted
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (branch) {
                loadBranchConfig();
            } else {
                loadGlobalConfig();
            }
            setError('');
            setShowPreview(false);
        }
    }, [branch, isOpen, ticketType]);

    const loadBranchConfig = async () => {
        try {
            const config = await getBranchTicketConfig(branch.id);
            
            // Determinar qué campo usar según el tipo de ticket
            const fieldName = ticketType === 'client' ? 'client_header_style' : 'workshop_header_style';
            
            if (config[fieldName]) {
                setStyleConfig(JSON.parse(config[fieldName]));
            }
        } catch (error) {
            console.error('Error loading branch config:', error);
            // Si hay error, usar configuración por defecto
        }
    };

    const loadGlobalConfig = () => {
        try {
            // Cargar configuración global desde localStorage
            const globalKey = `globalHeaderStyle_${ticketType}`;
            const savedConfig = localStorage.getItem(globalKey);
            
            if (savedConfig) {
                setStyleConfig(JSON.parse(savedConfig));
            }
            // Si no hay configuración guardada, usar la configuración por defecto
        } catch (error) {
            console.error('Error loading global config:', error);
            // Si hay error, usar configuración por defecto
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            if (branch) {
                // Modo sucursal específica - guardar en API
                const fieldName = ticketType === 'client' ? 'client_header_style' : 'workshop_header_style';
                
                const updateData = {
                    [fieldName]: JSON.stringify(styleConfig)
                };

                await updateBranchTicketConfig(branch.id, updateData);
                showToast('Estilo de ticket actualizado con éxito', 'success');
            } else {
                // Modo global - guardar en localStorage
                const globalKey = `globalHeaderStyle_${ticketType}`;
                localStorage.setItem(globalKey, JSON.stringify(styleConfig));
                showToast('Estilo de cabecera global actualizado con éxito', 'success');
            }
            
            onSave(styleConfig);
            onClose();
        } catch (err) {
            const errorMessage = err.message || 'Ocurrió un error inesperado.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateConfig = (key, value) => {
        setStyleConfig(prev => ({ ...prev, [key]: value }));
    };

    const TicketPreview = () => {
        const headerStyle = {
            fontSize: styleConfig.headerFontSize,
            fontFamily: styleConfig.headerFontFamily,
            textAlign: styleConfig.headerAlignment
        };

        const bodyStyle = {
            fontSize: styleConfig.bodyFontSize,
            fontFamily: styleConfig.bodyFontFamily,
            lineHeight: styleConfig.bodyLineHeight,
            textAlign: styleConfig.bodyAlignment
        };

        return (
            <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg">
                {/* Cabecera */}
                {styleConfig.showHeader && (
                    <header style={headerStyle} className="mb-2">
                        {styleConfig.showLogo ? (
                            <>
                                {styleConfig.logoPosition === 'top' && (
                                    <div className="flex justify-center" style={{ marginBottom: styleConfig.logoMarginBottomPx }}>
                                        <img src="/logo.png" alt="Logo" style={{ height: styleConfig.logoHeightPx }} />
                                    </div>
                                )}
                                {styleConfig.logoPosition !== 'top' && (
                                    <div className={`flex ${styleConfig.logoPosition === 'right' ? 'justify-end' : 'justify-start'}`} style={{ marginBottom: styleConfig.logoMarginBottomPx }}>
                                        <img src="/logo.png" alt="Logo" style={{ height: styleConfig.logoHeightPx }} />
                                    </div>
                                )}
                            </>
                        ) : (
                            styleConfig.showCompanyName && (
                                <div className="font-bold tracking-widest mb-1" style={{ fontSize: styleConfig.companyNameFontSize }}>
                                    {branch?.company_name || 'TECNO MUNDO'}
                                </div>
                            )
                        )}
                        {/* company name duplicado eliminado */}
                        
                        {styleConfig.showContactInfo && (
                            <div className="space-y-1" style={{ fontSize: styleConfig.contactInfoFontSize }}>
                                {styleConfig.showAddress && (
                                    <div>{branch?.address || 'Av. Principal 123, Ciudad'}</div>
                                )}
                                {styleConfig.showPhone && (
                                    <div>{branch?.phone || 'Tel: (555) 123-4567'}</div>
                                )}
                                {styleConfig.showEmail && (
                                    <div>{branch?.email || 'info@tecnomundo.com'}</div>
                                )}
                            </div>
                        )}
                        
                        {styleConfig.showBranchName && (
                            <div className="flex items-center justify-center gap-1 font-medium mt-2" style={{ fontSize: styleConfig.branchNameFontSize }}>
                                {styleConfig.showIcon && (
                                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                                )}
                                <span>{branch?.branch_name || 'Sucursal Principal'}</span>
                            </div>
                        )}
                    </header>
                )}

                {styleConfig.showDivider && (
                    <hr className="border-t border-dashed border-gray-400 my-2" />
                )}
                
                {/* Cuerpo del ticket */}
                <div style={bodyStyle}>
                    <div className="font-bold text-center mb-2">Orden N° 00001234</div>
                    <div>Cliente: Juan Pérez</div>
                    <div>Dispositivo: iPhone 12</div>
                    <div>Problema: Pantalla rota</div>
                </div>
            </div>
        );
    };

    const fontSizeOptions = [
        { value: '10px', label: '10px - Muy pequeño' },
        { value: '12px', label: '12px - Pequeño' },
        { value: '14px', label: '14px - Normal' },
        { value: '16px', label: '16px - Mediano' },
        { value: '18px', label: '18px - Grande' },
        { value: '20px', label: '20px - Muy grande' },
        { value: '24px', label: '24px - Extra grande' },
        { value: '28px', label: '28px - Gigante' },
        { value: '32px', label: '32px - Enorme' }
    ];

    const fontFamilyOptions = [
        { value: '"Courier New", monospace', label: 'Courier New (Monospace)' },
        { value: 'Arial, sans-serif', label: 'Arial (Sans Serif)' },
        { value: '"Times New Roman", serif', label: 'Times New Roman (Serif)' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica (Sans Serif)' },
        { value: '"Lucida Console", monospace', label: 'Lucida Console (Monospace)' },
        { value: 'Georgia, serif', label: 'Georgia (Serif)' }
    ];

    const alignmentOptions = [
        { value: 'left', label: 'Izquierda' },
        { value: 'center', label: 'Centro' },
        { value: 'right', label: 'Derecha' },
        { value: 'justify', label: 'Justificado' }
    ];

    const lineHeightOptions = [
        { value: '1.0', label: '1.0 - Muy compacto' },
        { value: '1.2', label: '1.2 - Compacto' },
        { value: '1.4', label: '1.4 - Normal' },
        { value: '1.6', label: '1.6 - Espaciado' },
        { value: '1.8', label: '1.8 - Muy espaciado' }
    ];

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
                        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                    >
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {branch 
                                        ? `Configurar Estilo de Cabecera - ${branch.branch_name}`
                                        : `Configurar Estilo de Cabecera (Global) - ${ticketType === 'client' ? 'Cliente' : 'Taller'}`
                                    }
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {branch 
                                        ? 'Personaliza la apariencia y disposición de la cabecera del ticket para esta sucursal'
                                        : 'Configuración global de estilos de cabecera que se aplicará a todas las sucursales'
                                    }
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                            {/* Configuración de estilo */}
                            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                                <h3 className="text-lg font-medium text-gray-800">
                                    Configuración de Estilo - {ticketType === 'client' ? 'Cliente' : 'Taller'}
                                </h3>
                                
                                {/* Elementos de cabecera a mostrar */}
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Elementos de cabecera</h4>
                                    <div className="space-y-2">
                                        {([
                                            { key: 'showHeader', label: 'Mostrar cabecera completa' },
                                            { key: 'showLogo', label: 'Logo' },
                                            ...(branch ? [{ key: 'showCompanyName', label: 'Nombre de la empresa' }] : []),
                                            { key: 'showContactInfo', label: 'Información de contacto' },
                                            { key: 'showAddress', label: 'Dirección' },
                                            { key: 'showPhone', label: 'Teléfono' },
                                            { key: 'showEmail', label: 'Email' },
                                            { key: 'showBranchName', label: 'Nombre de sucursal' },
                                            { key: 'showIcon', label: 'Icono de sucursal' },
                                            { key: 'showDivider', label: 'Línea divisoria' }
                                        ]).map(({ key, label }) => (
                                            <label key={key} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={styleConfig[key]}
                                                    onChange={(e) => updateConfig(key, e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Configuración de cabecera */}
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Estilos de cabecera</h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Posición del logo</label>
                                                <select
                                                    value={styleConfig.logoPosition}
                                                    onChange={(e) => updateConfig('logoPosition', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                >
                                                    <option value="top">Arriba (centrado)</option>
                                                    <option value="left">Izquierda (junto al nombre)</option>
                                                    <option value="right">Derecha (junto al nombre)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Altura del logo (px)</label>
                                                <input
                                                    type="number"
                                                    min="16"
                                                    max="64"
                                                    value={styleConfig.logoHeightPx}
                                                    onChange={(e) => updateConfig('logoHeightPx', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Margen inferior logo (px)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="24"
                                                    value={styleConfig.logoMarginBottomPx}
                                                    onChange={(e) => updateConfig('logoMarginBottomPx', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fuente de cabecera
                                            </label>
                                            <select
                                                value={styleConfig.headerFontFamily}
                                                onChange={(e) => updateConfig('headerFontFamily', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
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
                                                Tamaño general de cabecera
                                            </label>
                                            <select
                                                value={styleConfig.headerFontSize}
                                                onChange={(e) => updateConfig('headerFontSize', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            >
                                                {fontSizeOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {branch && styleConfig.showCompanyName && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño nombre empresa</label>
                                                <select
                                                    value={styleConfig.companyNameFontSize}
                                                    onChange={(e) => updateConfig('companyNameFontSize', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                >
                                                    {fontSizeOptions.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tamaño información contacto
                                            </label>
                                            <select
                                                value={styleConfig.contactInfoFontSize}
                                                onChange={(e) => updateConfig('contactInfoFontSize', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
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
                                                Alineación de cabecera
                                            </label>
                                            <select
                                                value={styleConfig.headerAlignment}
                                                onChange={(e) => updateConfig('headerAlignment', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            >
                                                {alignmentOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {styleConfig.showIcon && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Icono de la sucursal
                                                </label>
                                                <select
                                                    value={styleConfig.branchIcon}
                                                    onChange={(e) => updateConfig('branchIcon', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                >
                                                    <option value="Building">Edificio (Building)</option>
                                                    <option value="Building2">Edificio 2 (Building2)</option>
                                                    <option value="Store">Tienda (Store)</option>
                                                    <option value="MapPin">Ubicación (MapPin)</option>
                                                    <option value="Home">Casa (Home)</option>
                                                    <option value="Globe">Global (Globe)</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>


                            </div>

                            {/* Vista previa */}
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
                                            Haz clic en "Mostrar Vista Previa" para ver cómo se verá la cabecera del ticket
                                        </p>
                                    </div>
                                )}
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
                                onClick={handleSubmit}
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
                                        Guardar Estilo
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