import React, { forwardRef } from 'react';

export const CurrencyInput = forwardRef(({ 
  label, 
  error, 
  helperText, 
  id, 
  value = '', 
  onChange, 
  className = '', 
  ...props 
}, ref) => {
  const inputId = id || props.name;

  // Format number to Indian Currency system (e.g., 1,00,000)
  const formatIndianCurrency = (val) => {
    if (!val) return '';
    const cleanNum = String(val).replace(/\D/g, '');
    if (!cleanNum) return '';
    
    const lastThree = cleanNum.substring(cleanNum.length - 3);
    const otherNumbers = cleanNum.substring(0, cleanNum.length - 3);
    
    if (otherNumbers !== '') {
      return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    return lastThree;
  };

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (/^\d*$/.test(rawValue)) {
      if (onChange) {
        // Create a synthetic event or pass the raw/formatted value depending on RHF needs
        e.target.value = rawValue;
        onChange(e);
      }
    }
  };

  const displayValue = formatIndianCurrency(value);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span className="absolute left-3 text-sm text-gray-500">₹</span>
        <input
          ref={ref}
          id={inputId}
          type="text"
          value={displayValue}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          className={`w-full pl-8 pr-3 py-2 border rounded-md text-sm outline-none transition-colors 
            ${error ? 'border-red-500' : 'border-gray-300'} 
            ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-gray-500">{helperText}</span>}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';