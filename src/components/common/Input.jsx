import React, { forwardRef } from 'react';

export const Input = forwardRef(({ 
  label, 
  error, 
  helperText, 
  id, 
  className = '', 
  ...props 
}, ref) => {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
        className={`px-3 py-2 border rounded-md text-sm outline-none transition-colors 
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'} 
          ${className}`}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-help`} className="text-xs text-gray-500">
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';