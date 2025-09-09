import React from 'react';
import { Spinner } from './Spinner.jsx';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    icon,
    onClick,
    type = 'button',
    ...props
}) => {
    const baseClasses = 'btn-base transition-all-200 font-medium focus:outline-none focus:ring-4 focus:ring-opacity-30';
    
    const variants = {
        primary: 'btn-primary text-white focus:ring-purple-600',
        secondary: 'btn-secondary text-gray-700 focus:ring-gray-300',
        ghost: 'btn-ghost text-gray-600 hover:text-gray-900 focus:ring-gray-300',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    };
    
    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
    };
    
    const variantClass = variants[variant] || variants.primary;
    const sizeClass = sizes[size] || sizes.md;
    
    const finalClassName = `${baseClasses} ${variantClass} ${sizeClass} ${className} ${
        disabled || loading ? 'loading-state' : ''
    }`;
    
    return (
        <button
            type={type}
            className={finalClassName}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span>Cargando...</span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2">
                    {icon && <span>{icon}</span>}
                    {children}
                </div>
            )}
        </button>
    );
};