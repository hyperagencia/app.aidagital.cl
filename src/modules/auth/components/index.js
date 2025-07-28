/**
 * Componentes de Autenticación
 */

import React, { useState } from 'react';
import { useLogin, useAuth } from '../hooks/index.js';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';
import { config } from '../../../services/config.js';

// Componente de formulario de login
export const LoginForm = () => {
    const [email, setEmail] = useState('admin@aidadigital.cl');
    const [password, setPassword] = useState('password123');
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

// Componente de carga de autenticación
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

// Componente de ruta protegida
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

// Componente de información del usuario
export const UserInfo = ({ 
    showEmail = false, 
    showRole = false,
    size = 'md',
    className = '' 
}) => {
    const { user } = useAuth();
    
    if (!user) return null;
    
    return (
        <div className={`flex items-center ${className}`}>
            <UI.Avatar 
                name={user.name} 
                src={user.avatar}
                size={size}
            />
            
            <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                    {user.name?.split(' ')[0] || 'Usuario'}
                </p>
                {showEmail && (
                    <p className="text-xs text-gray-500">
                        {user.email}
                    </p>
                )}
                {showRole && (
                    <UI.Badge variant={user.role === 'admin' ? 'purple' : 'gray'} size="sm">
                        {formatters.capitalize(user.role)}
                    </UI.Badge>
                )}
            </div>
        </div>
    );
};

// Componente de dropdown de usuario
export const UserDropdown = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    
    const handleLogout = async () => {
        await logout();
        if (onLogout) onLogout();
    };
    
    if (!user) return null;
    
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <UserInfo />
                <span className="ml-2 text-gray-400">
                    {isOpen ? '▲' : '▼'}
                </span>
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                    <div className="p-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    
                    <div className="p-2">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // Aquí podrías abrir un modal de perfil
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                        >
                            Editar Perfil
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // Aquí podrías abrir configuración
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                        >
                            Configuración
                        </button>
                        <hr className="my-2" />
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente de mensaje de sesión expirada
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

// Exportar todos los componentes
export const authComponents = {
    LoginForm,
    AuthLoader,
    ProtectedRoute,
    UserInfo,
    UserDropdown,
    SessionExpired,
};

export default authComponents;