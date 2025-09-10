/**
 * Componente Sidebar con botón de cerrar sesión
 */

import React, { useState } from 'react';
import { useAuth, usePermissions } from '../../modules/auth/hooks/index.js';
import { UserInfo } from '../../modules/auth/components/index.js';
import { UI } from '../ui/index.js';
import { config } from '../../services/config.js';

export const Sidebar = ({ 
    currentPage, 
    onNavigate, 
    isMobileOpen, 
    onMobileClose 
}) => {
    const { user, logout } = useAuth();
    const permissions = usePermissions();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Menú de navegación
    const menuItems = [
        { 
            id: 'dashboard', 
            label: 'Dashboard',
            alwaysShow: true 
        },
        { 
            id: 'creators', 
            label: 'Creators',
            alwaysShow: true 
        },
        { 
            id: 'brands', 
            label: 'Marcas',
            requiresPermission: 'canViewBrands' 
        },
        { 
            id: 'users', 
            label: 'Usuarios',
            requiresPermission: 'canViewUsers' 
        },
    ];

    // Filtrar items visibles según permisos
    const visibleItems = menuItems.filter(item => {
        if (item.alwaysShow) return true;
        if (item.requiresPermission) {
            return permissions[item.requiresPermission];
        }
        return true;
    });

    const handleNavigation = (pageId) => {
        onNavigate?.(pageId);
        onMobileClose?.();
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        try {
            await logout();
            // El contexto se encargará de limpiar el estado y redirigir
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            {/* Overlay móvil */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50
                w-72 bg-white shadow-xl
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                flex flex-col h-full
            `}>
                {/* Header del sidebar */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                            UGC Creators
                        </h2>
                        <button
                            onClick={onMobileClose}
                            className="md:hidden text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {config.COMPANY_NAME}
                    </p>
                </div>
                
                {/* Saludo personalizado */}
                <div className="p-6">
                    <div className="flex items-center space-x-3">
                        <UserInfo size="md" />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Bienvenido de nuevo
                    </p>
                </div>
                
                {/* Menú de navegación */}
                <nav className="flex-1 px-4 space-y-2">
                    {visibleItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigation(item.id)}
                            className={`
                                w-full text-left px-4 py-3 rounded-xl font-medium
                                transition-all duration-200 flex items-center space-x-3
                                ${currentPage === item.id 
                                    ? 'bg-purple-100 text-purple-700 shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                
                {/* Footer del sidebar con botón de cerrar sesión */}
                <div className="p-4 border-t border-gray-100 space-y-3">
                    {/* Botón de cerrar sesión */}
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`
                            w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                            font-medium transition-all duration-200
                            ${isLoggingOut
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                            }
                        `}
                    >
                        <span className="text-lg">
                            {isLoggingOut ? '' : ''}
                        </span>
                        <span>
                            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                        </span>
                    </button>
                    
                    {/* Versión */}
                    <div className="text-xs text-gray-500 text-center">
                        v{config.APP_VERSION}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;