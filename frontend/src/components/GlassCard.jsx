import React from 'react';

export const GlassCard = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 border transition-all duration-300 hover:shadow-glass-hover ${
        onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
