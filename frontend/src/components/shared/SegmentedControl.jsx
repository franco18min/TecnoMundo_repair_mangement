import React from 'react';
import { motion } from 'framer-motion';

export function SegmentedControl({ options = [], value, onChange, disabled = false, className = '', size = 'md' }) {
  const sizes = {
    xs: { text: 'text-xs leading-none', btn: 'px-2 py-0', container: 'p-0' },
    sm: { text: 'text-sm leading-none', btn: 'px-3 py-0.5', container: 'p-1' },
    md: { text: 'text-sm', btn: 'px-3 py-1.5', container: 'p-1.5' },
  };
  const s = sizes[size] || sizes.md;
  const base = `inline-flex items-center rounded-full bg-gray-100 ${s.container} border border-gray-200`;
  return (
    <div className={`${base} ${className}`} role="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        const activeCls = active ? 'bg-indigo-600 text-white shadow' : 'text-gray-700';
        return (
          <motion.button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange && onChange(opt.value)}
            className={`${s.btn} rounded-full font-medium ${s.text} ${activeCls}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}
