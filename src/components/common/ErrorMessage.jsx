import React from 'react';

export const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div 
      aria-live="polite" 
      role="alert" 
      className={`text-xs text-red-600 font-medium flex items-center gap-1 mt-1 ${className}`}
    >
      <span>{message}</span>
    </div>
  );
};