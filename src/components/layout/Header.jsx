/**
 * Componente Header con opción de botón de logout
 */

import React, { useState } from 'react';
import { useAuth } from '../../modules/auth/hooks/index.js';
import { UserDropdown } from '../../modules/auth/components/index.js';
import { UI } from '../ui/index.js';

export const Header = ({ 
    title, 
    subtitle,
    onMenuToggle,
    actions,
    showLogoutButton = false // ← Nueva prop para mostrar botón de logout
}) => {
    const { logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center space-x-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuToggle}
                        className="md:hidden text-gray-600 hover:text-gray-900 p-2"
                    >
                        <span className="text-xl">☰</span>
                    </button>
                    
                    {/* Title */}
                    <div>
                        {title && (
                            <h1 className="text-xl font-semibold text-gray-900">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-600">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                    {/* Actions personalizadas */}
                    {actions && (
                        <div className="flex items-center space-x-2">
                            {actions}
                        </div>
                    )}
                    
                    {/* Botón de logout opcional (más visible) */}
                    {showLogoutButton && (
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`
                                hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg
                                font-medium transition-all duration-200
                                ${isLoggingOut
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                }
                            `}
                        >
                            <span>{isLoggingOut ? '⏳' : '🚪'}</span>
                            <span className="hidden md:inline">
                                {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
                            </span>
                        </button>
                    )}
                    
                    {/* User dropdown (siempre presente) */}
                    <UserDropdown onLogout={logout} />
                </div>
            </div>
        </header>
    );
};

export default Header;