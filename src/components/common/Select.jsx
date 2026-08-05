import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';


export const Select = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  id,
  className = '',
  ...props
}, ref) => {
  const selectId = id || props.name;


  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? 'true' : 'false'}
        className={`px-3 py-2 border rounded-md text-sm bg-white outline-none transition-colors
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-gray-500">{helperText}</span>}
    </div>
  );
});


Select.displayName = 'Select';


Select.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  error: PropTypes.string,
  helperText: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
};
