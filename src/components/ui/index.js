/**
 * Componentes UI Base
 * Componentes reutilizables para toda la aplicación
 */

import React from 'react';
import { formatters } from '../../utils/formatters.js';

// Componente Button
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

// Componente Input
export const Input = ({
    label,
    error,
    helper,
    required = false,
    className = '',
    containerClassName = '',
    ...props
}) => {
    const inputClasses = `input-base ${error ? 'error-state' : ''} ${className}`;
    
    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                className={inputClasses}
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

// Componente Select
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

// Componente Textarea
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

// Componente Card
export const Card = ({
    children,
    className = '',
    hover = false,
    padding = 'p-6',
    ...props
}) => {
    const cardClasses = `card-base ${padding} ${hover ? 'hover-shadow cursor-pointer' : ''} ${className}`;
    
    return (
        <div className={cardClasses} {...props}>
            {children}
        </div>
    );
};

// Componente Badge
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

// Componente Spinner
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

// Componente Modal
export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = '',
}) => {
    if (!isOpen) return null;
    
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-7xl',
    };
    
    const sizeClass = sizes[size] || sizes.md;
    
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className={`relative bg-white rounded-2xl shadow-xl ${sizeClass} w-full ${className}`}>
                    {/* Header */}
                    {title && (
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente Alert
export const Alert = ({
    type = 'info',
    title,
    children,
    onClose,
    className = '',
    ...props
}) => {
    const types = {
        info: {
            container: 'bg-blue-50 border-blue-200 text-blue-800',
            icon: 'ℹ️',
        },
        success: {
            container: 'bg-green-50 border-green-200 text-green-800',
            icon: '✅',
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            icon: '⚠️',
        },
        error: {
            container: 'bg-red-50 border-red-200 text-red-800',
            icon: '❌',
        },
    };
    
    const typeConfig = types[type] || types.info;
    
    return (
        <div
            className={`border rounded-xl p-4 ${typeConfig.container} ${className}`}
            {...props}
        >
            <div className="flex items-start">
                <span className="mr-3 text-lg">{typeConfig.icon}</span>
                <div className="flex-1">
                    {title && (
                        <h4 className="font-semibold mb-1">{title}</h4>
                    )}
                    <div className="text-sm">{children}</div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-3 text-current opacity-70 hover:opacity-100 transition-opacity"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

// Componente Avatar
export const Avatar = ({
    name,
    src,
    size = 'md',
    className = '',
    ...props
}) => {
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-20 h-20 text-xl',
    };
    
    const sizeClass = sizes[size] || sizes.md;
    const colorClass = formatters.getAvatarColor(name || '');
    
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizeClass} rounded-full object-cover ${className}`}
                {...props}
            />
        );
    }
    
    return (
        <div
            className={`${sizeClass} rounded-full ${colorClass} flex items-center justify-center text-white font-semibold ${className}`}
            {...props}
        >
            {formatters.getInitials(name)}
        </div>
    );
};

// Componente Skeleton (para loading states)
export const Skeleton = ({
    width = 'w-full',
    height = 'h-4',
    className = '',
    ...props
}) => {
    return (
        <div
            className={`bg-gray-200 rounded animate-pulse ${width} ${height} ${className}`}
            {...props}
        />
    );
};

// Componente Divider
export const Divider = ({
    orientation = 'horizontal',
    className = '',
    ...props
}) => {
    const orientationClass = orientation === 'vertical' 
        ? 'w-px h-full' 
        : 'h-px w-full';
    
    return (
        <div
            className={`bg-gray-200 ${orientationClass} ${className}`}
            {...props}
        />
    );
};

// Exportar todos los componentes
export const UI = {
    Button,
    Input,
    Select,
    Textarea,
    Card,
    Badge,
    Spinner,
    Modal,
    Alert,
    Avatar,
    Skeleton,
    Divider,
};

export default UI;