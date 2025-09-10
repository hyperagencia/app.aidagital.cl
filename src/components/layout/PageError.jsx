/**
 * Componente de error para páginas
 */

import React from 'react';
import { UI } from '../ui/index.js';

export const PageError = ({ 
    title = 'Error inesperado',
    message = 'Ha ocurrido un error al cargar la página',
    onRetry,
    showRetry = true 
}) => {
    return (
        <div className="flex-1 bg-gray-50 overflow-auto">
            <div className="flex items-center justify-center min-h-96">
                <UI.Card className="p-8 text-center max-w-md">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>
                    {showRetry && onRetry && (
                        <UI.Button
                            variant="primary"
                            onClick={onRetry}
                        >
                            Reintentar
                        </UI.Button>
                    )}
                </UI.Card>
            </div>
        </div>
    );
};

export default PageError;