import React from 'react';

export const Pin = ({ color }) => (
  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
    <div className={`w-4 h-4 rounded-full shadow-md ${color} border-2 border-white`} />
  </div>
);

export default Pin;