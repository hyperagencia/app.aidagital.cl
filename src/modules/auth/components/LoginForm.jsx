/**
 * Componente de formulario de login
 */

import React, { useState } from 'react';
import { useLogin } from '../hooks/index.js';
import { UI } from '../../../components/ui/index.js';
import { config } from '../../../services/config.js';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLogging, loginError, clearError } = useLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        
        const result = await login({ email, password });
        
        if (result.success) {
            // Login exitoso - el contexto manejará la redirección
            console.log('Login successful');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
            <UI.Card className="w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">👥</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        UGC Creators AIDA
                    </h1>
                    <p className="text-gray-600">
                        {config.COMPANY_NAME}
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <UI.Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        disabled={isLogging}
                        error={loginError && !email ? 'Email requerido' : ''}
                    />
                    
                    <UI.Input
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={isLogging}
                        error={loginError && !password ? 'Contraseña requerida' : ''}
                    />
                    
                    {loginError && (
                        <UI.Alert type="error">
                            {loginError}
                        </UI.Alert>
                    )}
                    
                    <UI.Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        loading={isLogging}
                        disabled={isLogging}
                        icon="🔐"
                    >
                        {isLogging ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </UI.Button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        v{config.APP_VERSION} • Desarrollado por {config.COMPANY_NAME}
                    </p>
                </div>
            </UI.Card>
        </div>
    );
};

export default LoginForm;