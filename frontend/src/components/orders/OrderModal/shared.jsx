import React from 'react';
import { FormField } from '../../shared/FormField';

export const DisplayField = ({ label, value, fullWidth = false, isCurrency = false }) => {
  const hasValue = value !== null && value !== undefined && String(value).trim() !== '';
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      <p className="w-full bg-gray-100/70 border border-gray-200 rounded-lg py-2 px-3 text-gray-800 min-h-[42px] whitespace-pre-wrap">
        {hasValue ? (isCurrency ? `$${Number(value).toFixed(2)}` : value) : 'N/A'}
      </p>
    </div>
  );
};

// Re-exportamos FormField del shared para mantener compatibilidad
export { FormField };

export const TextAreaField = ({ label, id, rows = 3, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea id={id} {...props} rows={rows} className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
);
