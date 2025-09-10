/**
 * Componente de contenedor de página
 */

import React from 'react';
import Breadcrumb from './Breadcrumb.jsx';

export const PageContainer = ({ 
    children, 
    title, 
    subtitle,
    breadcrumb,
    actions,
    maxWidth = '7xl' 
}) => {
    const maxWidthClasses = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        'full': 'max-w-full',
    };

    return (
        <div className="flex-1 bg-gray-50 overflow-auto">
            <div className={`p-8 mx-auto ${maxWidthClasses[maxWidth] || maxWidthClasses['7xl']}`}>
                {/* Breadcrumb */}
                {breadcrumb && <Breadcrumb items={breadcrumb} />}
                
                {/* Header */}
                {(title || subtitle || actions) && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                        <div>
                            {title && (
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-gray-600">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        
                        {actions && (
                            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                                {actions}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Content */}
                {children}
            </div>
        </div>
    );
};

export default PageContainer;