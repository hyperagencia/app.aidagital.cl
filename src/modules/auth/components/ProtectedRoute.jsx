/**
 * Componente de ruta protegida
 */

import React from 'react';
import { useAuth } from '../hooks/index.js';
import { UI } from '../../../components/ui/index.js';
import { LoginForm } from './LoginForm.jsx';
import { AuthLoader } from './AuthLoader.jsx';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading, isAuthenticated, isAdmin } = useAuth();
    
    if (loading) {
        return <AuthLoader />;
    }
    
    if (!isAuthenticated) {
        return <LoginForm />;
    }
    
    if (requireAdmin && !isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <UI.Card className="max-w-md p-8 text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Sin permisos
                    </h3>
                    <p className="text-gray-600 mb-4">
                        No tienes permisos para acceder a esta sección
                    </p>
                    <UI.Button
                        variant="secondary"
                        onClick={() => window.location.href = '/dashboard'}
                    >
                        Volver al Dashboard
                    </UI.Button>
                </UI.Card>
            </div>
        );
    }
    
    return children;
};

export default ProtectedRoute;