import React, { forwardRef, useState } from 'react';

export const MaskedInput = forwardRef(({ 
  label, 
  error, 
  helperText, 
  id, 
  type = 'pan', // 'pan' or 'aadhaar'
  value = '', 
  onChange, 
  className = '', 
  ...props 
}, ref) => {
  const inputId = id || props.name;
  const [isFocused, setIsFocused] = useState(false);

  const getMaskedValue = (val) => {
    if (!val) return '';
    const strVal = String(val);
    if (strVal.length <= 4) return strVal;
    
    const lastFour = strVal.slice(-4);
    const maskedPart = '•'.repeat(strVal.length - 4);
    
    // Format Aadhaar with spaces every 4 characters if desired, or keep raw
    return `${maskedPart}${lastFour}`;
  };

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
        type="text"
        value={isFocused ? value : getMaskedValue(value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={onChange}
        maxLength={type === 'pan' ? 10 : 12}
        aria-invalid={error ? 'true' : 'false'}
        className={`px-3 py-2 border rounded-md text-sm outline-none transition-colors uppercase 
          ${error ? 'border-red-500' : 'border-gray-300'} 
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-gray-500">{helperText}</span>}
    </div>
  );
});

MaskedInput.displayName = 'MaskedInput';