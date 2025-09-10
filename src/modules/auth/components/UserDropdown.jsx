/**
 * Componente de dropdown de usuario mejorado
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/index.js';
import { UserInfo } from './UserInfo.jsx';

export const UserDropdown = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { user, logout } = useAuth();
    const dropdownRef = useRef(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        setIsOpen(false);
        
        try {
            await logout();
            if (onLogout) onLogout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setIsLoggingOut(false);
        }
    };
    
    if (!user) return null;
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoggingOut}
                className={`
                    flex items-center p-2 rounded-lg transition-colors
                    ${isLoggingOut 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-100'
                    }
                `}
            >
                <UserInfo />
                <span className="ml-2 text-gray-400">
                    {isLoggingOut ? '⏳' : (isOpen ? '▲' : '▼')}
                </span>
            </button>
            
            {isOpen && !isLoggingOut && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                    {/* Header del dropdown */}
                    <div className="p-4 border-b border-gray-100">
                        <p className="font-medium text-gray-900 truncate">
                            {user.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                            {user.email}
                        </p>
                        {user.role && (
                            <span className={`
                                inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2
                                ${user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }
                            `}>
                                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </span>
                        )}
                    </div>
                    
                    {/* Opciones del menú */}
                    <div className="p-2">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // Aquí podrías abrir un modal de perfil
                                console.log('Abrir perfil');
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
                        >
                            <span>👤</span>
                            <span>Editar Perfil</span>
                        </button>
                        
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // Aquí podrías abrir configuración
                                console.log('Abrir configuración');
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
                        >
                            <span>⚙️</span>
                            <span>Configuración</span>
                        </button>
                        
                        <hr className="my-2" />
                        
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`
                                w-full text-left px-3 py-2 text-sm rounded flex items-center space-x-2
                                transition-colors
                                ${isLoggingOut 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-red-600 hover:bg-red-50'
                                }
                            `}
                        >
                            <span>{isLoggingOut ? '⏳' : '🚪'}</span>
                            <span>
                                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                            </span>
                        </button>
                    </div>
                </div>
            )}
            
            {/* Overlay de logout global */}
            {isLoggingOut && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-xl">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin text-2xl">⏳</div>
                            <span className="text-gray-900 font-medium">
                                Cerrando sesión...
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;