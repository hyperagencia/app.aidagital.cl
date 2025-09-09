import React from 'react';

export const Textarea = ({
    label,
    error,
    helper,
    required = false,
    className = '',
    containerClassName = '',
    rows = 3,
    ...props
}) => {
    const textareaClasses = `input-base resize-none ${error ? 'error-state' : ''} ${className}`;
    
    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                rows={rows}
                className={textareaClasses}
                {...props}
            />
            {error && (
                <p className="error-text">{error}</p>
            )}
            {helper && !error && (
                <p className="text-xs text-gray-500">{helper}</p>
            )}
        </div>
    );
};