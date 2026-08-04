import React, { forwardRef } from 'react';

export const RadioGroup = forwardRef(({ 
  label, 
  options = [], 
  error, 
  direction = 'vertical', 
  name, 
  value, 
  onChange 
}, ref) => {
  return (
    <fieldset className="flex flex-col gap-2 w-full border-none p-0 m-0">
      {label && <legend className="text-sm font-medium text-gray-700 mb-1">{label}</legend>}
      <div className={`flex ${direction === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              ref={ref}
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {error && <span className="text-xs text-red-500" role="alert">{error}</span>}
    </fieldset>
  );
});

RadioGroup.displayName = 'RadioGroup';