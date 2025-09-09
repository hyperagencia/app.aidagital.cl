import React from 'react';

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