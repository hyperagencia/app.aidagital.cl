/**
 * Componente de estado de carga para páginas
 */

import React from 'react';
import { UI } from '../ui/index.js';

export const PageLoader = ({ message = 'Cargando...' }) => {
    return (
        <div className="flex-1 bg-gray-50 overflow-auto">
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <UI.Spinner size="xl" className="mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {message}
                    </h3>
                    <p className="text-gray-600">
                        Un momento por favor...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;