import React from 'react';

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

export const FormField = ({ label, id, isCurrency = false, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            {isCurrency && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>}
            {props.as === 'select' ?
              <select id={id} {...props} className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">{children}</select>
              :
              <input id={id} {...props} className={`w-full bg-gray-50 border border-gray-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isCurrency ? 'pl-7 pr-3' : 'px-3'}`} />
            }
        </div>
    </div>
);

export const TextAreaField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea id={id} {...props} rows="3" className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
);