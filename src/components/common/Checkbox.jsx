import React, { forwardRef } from 'react';

export const Checkbox = forwardRef(({ 
  label, 
  error, 
  id, 
  className = '', 
  ...props 
}, ref) => {
  const checkboxId = id || props.name;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          ref={ref}
          id={checkboxId}
          aria-invalid={error ? 'true' : 'false'}
          className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-sm font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
        )}
      </div>
      {error && <span className="text-xs text-red-500" role="alert">{error}</span>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';