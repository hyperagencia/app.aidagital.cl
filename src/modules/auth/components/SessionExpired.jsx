/**
 * Componente de mensaje de sesión expirada
 */

import React from 'react';
import { UI } from '../../../components/ui/index.js';

export const SessionExpired = ({ onRestart }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <UI.Card className="max-w-md p-8 text-center">
                <div className="text-4xl mb-4">⏰</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sesión Expirada
                </h3>
                <p className="text-gray-600 mb-4">
                    Tu sesión ha expirado por seguridad. Por favor inicia sesión nuevamente.
                </p>
                <UI.Button
                    variant="primary"
                    onClick={onRestart || (() => window.location.reload())}
                    className="w-full"
                >
                    Iniciar Sesión
                </UI.Button>
            </UI.Card>
        </div>
    );
};

export default SessionExpired;