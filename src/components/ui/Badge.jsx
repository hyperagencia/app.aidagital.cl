import React from 'react';

export const Badge = ({
    children,
    variant = 'gray',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseClasses = 'badge';
    
    const variants = {
        gray: 'badge-gray',
        purple: 'badge-purple',
        green: 'badge-green',
        red: 'bg-red-100 text-red-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        blue: 'bg-blue-100 text-blue-700',
    };
    
    const sizes = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2',
    };
    
    const variantClass = variants[variant] || variants.gray;
    const sizeClass = sizes[size] || sizes.md;
    
    const finalClassName = `${baseClasses} ${variantClass} ${sizeClass} ${className}`;
    
    return (
        <span className={finalClassName} {...props}>
            {children}
        </span>
    );
};