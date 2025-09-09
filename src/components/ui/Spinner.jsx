import React from 'react';

export const Spinner = ({
    size = 'md',
    className = '',
    ...props
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };
    
    const sizeClass = sizes[size] || sizes.md;
    
    return (
        <div
            className={`loading-spinner border-purple-600 ${sizeClass} ${className}`}
            {...props}
        />
    );
};