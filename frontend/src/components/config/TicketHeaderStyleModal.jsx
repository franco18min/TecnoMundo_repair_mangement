import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Type, Layout, Eye, Save, Loader } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { 
    fetchTicketConfigByType, 
    createOrUpdateTicketConfig, 
    defaultConfigurations 
} from '../../api/ticketConfigApi';

export function TicketHeaderStyleModal({ isOpen, onClose, ticketType = 'client', onSave }) {
    const [styleConfig, setStyleConfig] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showPreview, setShowPreview] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            loadTicketStyleConfig();
        }
    }, [isOpen, ticketType]);

    const loadTicketStyleConfig = async () => {
        try {
            setIsSubmitting(true);
            setError('');
            
            const configType = `${ticketType}_header_style`;
            const config = await fetchTicketConfigByType(configType);
            
            if (config && config.config_value) {
                setStyleConfig(JSON.parse(config.config_value));
            } else {
                setStyleConfig(defaultConfigurations[configType] || {});
            }
        } catch (error) {
            console.error('Error loading ticket style config:', error);
            setStyleConfig(defaultConfigurations[`${ticketType}_header_style`] || {});
            setError('Error al cargar la configuración. Se usará la por defecto.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const configType = `${ticketType}_header_style`;
            await createOrUpdateTicketConfig(configType, styleConfig);
            
            onSave();
            showToast('Estilo de cabecera actualizado con éxito', 'success');
            onClose();
        } catch (err) {
            console.error('Error saving ticket style config:', err);
            setError(err.message || 'Ocurrió un error al guardar.');
            showToast(err.message || 'Error al guardar', 'error');
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

        return (
            <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg">
                {styleConfig.showHeader && (
                    <header style={headerStyle} className="mb-2">
                        {styleConfig.showLogo ? (
                            <>
                                {styleConfig.logoPosition === 'top' && (
                                    <div className="flex justify-center" style={{ marginBottom: styleConfig.logoMarginBottomPx || 2 }}>
                                        <img src="/logo.png" alt="Logo" style={{ height: styleConfig.logoHeightPx || 28 }} />
                                    </div>
                                )}
                                {styleConfig.logoPosition !== 'top' && (
                                    <div className={`flex ${styleConfig.logoPosition === 'right' ? 'justify-end' : 'justify-start'}`} style={{ marginBottom: styleConfig.logoMarginBottomPx || 2 }}>
                                        <img src="/logo.png" alt="Logo" style={{ height: styleConfig.logoHeightPx || 28 }} />
                                    </div>
                                )}
                            </>
                        ) : null}

                        {styleConfig.showContactInfo && (
                            <div className="space-y-1" style={{ fontSize: styleConfig.contactInfoFontSize }}>
                                {styleConfig.showAddress && <div>Av. Principal 123, Ciudad</div>}
                                {styleConfig.showPhone && <div>+1 (555) 123-4567</div>}
                                {styleConfig.showEmail && <div>info@tecnomundo.com</div>}
                            </div>
                        )}

                        {styleConfig.showBranchName && (
                            <div className="flex items-center justify-center gap-1 font-medium mt-2" style={{ fontSize: styleConfig.branchNameFontSize }}>
                                {styleConfig.showIcon && (
                                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                                )}
                                <span>Sucursal Principal</span>
                            </div>
                        )}
                    </header>
                )}

                {styleConfig.showDivider && (
                    <hr className="border-t border-dashed border-gray-400 my-2" />
                )}
                
                <div>
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                                    Configurar Estilo de Cabecera (Global)
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    Personaliza la apariencia de la cabecera del ticket ({ticketType === 'client' ? 'Cliente' : 'Taller'})
                                </p>
                            </div>
                            <motion.button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                                <X size={24} />
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                                <h3 className="text-lg font-medium text-gray-800">
                                    Configuración de Estilo
                                </h3>
                                
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Elementos a mostrar</h4>
                                    <div className="space-y-2">
                                        {([
                                            { key: 'showHeader', label: 'Mostrar cabecera completa' },
                                            { key: 'showLogo', label: 'Logo' },
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
                                                    checked={styleConfig[key] || false}
                                                    onChange={(e) => updateConfig(key, e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Estilos de cabecera</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
                                            <select
                                                value={styleConfig.headerFontFamily || ''}
                                                onChange={(e) => updateConfig('headerFontFamily', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            >
                                                {fontFamilyOptions.map(option => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño general</label>
                                            <select
                                                value={styleConfig.headerFontSize || ''}
                                                onChange={(e) => updateConfig('headerFontSize', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            >
                                                {fontSizeOptions.map(option => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Posición del logo</label>
                                                <select
                                                    value={styleConfig.logoPosition || 'top'}
                                                    onChange={(e) => updateConfig('logoPosition', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                >
                                                    <option value="top">Arriba (centrado)</option>
                                                    <option value="left">Izquierda</option>
                                                    <option value="right">Derecha</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Altura del logo (px)</label>
                                                <input
                                                    type="number"
                                                    min="16"
                                                    max="64"
                                                    value={styleConfig.logoHeightPx || 28}
                                                    onChange={(e) => updateConfig('logoHeightPx', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Margen inferior del logo (px)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="24"
                                                    value={styleConfig.logoMarginBottomPx || 2}
                                                    onChange={(e) => updateConfig('logoMarginBottomPx', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño info. contacto</label>
                                            <select
                                                value={styleConfig.contactInfoFontSize || ''}
                                                onChange={(e) => updateConfig('contactInfoFontSize', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            >
                                                {fontSizeOptions.map(option => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Alineación</label>
                                            <select
                                                value={styleConfig.headerAlignment || ''}
                                                onChange={(e) => updateConfig('headerAlignment', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            >
                                                {alignmentOptions.map(option => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-800">Vista Previa</h3>
                                    <button type="button" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 text-indigo-600 font-medium">
                                        <Eye size={16} />
                                        {showPreview ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                </div>
                                
                                <AnimatePresence>
                                    {showPreview && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <TicketPreview />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                {!showPreview && (
                                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-8 rounded-lg text-center">
                                        <Palette size={32} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-500">Vista previa oculta</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            {error && <p className="text-red-500 text-sm mr-auto self-center">{error}</p>}
                            <motion.button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg">
                                Cancelar
                            </motion.button>
                            <motion.button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2">
                                {isSubmitting ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
                                Guardar Estilo
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}