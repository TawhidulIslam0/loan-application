import React, { forwardRef, useState } from 'react';

export const MaskedInput = forwardRef(({ 
  label, 
  error, 
  helperText, 
  id, 
  type = 'pan', 
  value = '', 
  onChange, 
  onBlur,
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
    
    return `${maskedPart}${lastFour}`;
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    const rawVal = e.target.value.replace(/[•]/g, '');
    if (onChange) {
      e.target.value = rawVal;
      onChange(e);
    }
  };

  const displayValue = isFocused ? value : getMaskedValue(value);

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
        value={displayValue || ''}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
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

export default MaskedInput;