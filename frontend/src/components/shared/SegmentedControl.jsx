import React from 'react';
import { motion } from 'framer-motion';

export function SegmentedControl({ options = [], value, onChange, disabled = false, className = '', size = 'md' }) {
  const base = 'inline-flex rounded-full bg-gray-100 p-1 border border-gray-200';
  const sz = size === 'sm' ? 'text-xs' : 'text-sm';
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
            className={`px-3 py-1.5 rounded-full font-medium ${sz} ${activeCls}`}
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

