import React from 'react';

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