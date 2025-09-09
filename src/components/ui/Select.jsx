import React from 'react';

export const Select = ({
    label,
    error,
    helper,
    required = false,
    children,
    className = '',
    containerClassName = '',
    ...props
}) => {
    const selectClasses = `input-base ${error ? 'error-state' : ''} ${className}`;
    
    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <select
                className={selectClasses}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p className="error-text">{error}</p>
            )}
            {helper && !error && (
                <p className="text-xs text-gray-500">{helper}</p>
            )}
        </div>
    );
};