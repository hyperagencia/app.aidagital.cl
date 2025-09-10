/**
 * Componente de carga de autenticación
 */

import React from 'react';
import { UI } from '../../../components/ui/index.js';

export const AuthLoader = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <UI.Spinner size="xl" className="mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Verificando sesión...
                </h3>
                <p className="text-gray-600 mb-2">
                    Un momento por favor
                </p>
                <p className="text-xs text-gray-500">
                    UGC Creators Dashboard
                </p>
            </div>
        </div>
    );
};

export default AuthLoader;