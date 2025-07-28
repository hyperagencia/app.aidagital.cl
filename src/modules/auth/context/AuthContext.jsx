/**
 * Contexto de Autenticación
 * Maneja el estado global de autenticación
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { config, log } from '../../../services/config.js';

// Crear contexto
export const AuthContext = createContext(null);

// Hook para usar el contexto
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext debe usarse dentro de AuthProvider');
    }
    return context;
};

// Provider de autenticación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verificar autenticación al cargar
    useEffect(() => {
        checkAuth();
    }, []);

    // Función para verificar autenticación
    const checkAuth = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const userData = await authService.verifyToken();
            
            if (userData) {
                setUser(userData);
                log('User authenticated:', userData);
            } else {
                setUser(null);
                log('No valid authentication found');
            }
        } catch (error) {
            log('Auth verification failed:', error.message);
            setUser(null);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Función de login
    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await authService.login(credentials);
            
            if (result.success) {
                setUser(result.user);
                log('Login successful:', result.user);
                return { success: true };
            } else {
                setError(result.message);
                return { 
                    success: false, 
                    message: result.message 
                };
            }
        } catch (error) {
            const errorMessage = error.message || config.ERRORS.UNKNOWN;
            setError(errorMessage);
            return { 
                success: false, 
                message: errorMessage 
            };
        } finally {
            setLoading(false);
        }
    };

    // Función de logout
    const logout = async () => {
        try {
            setLoading(true);
            await authService.logout();
            setUser(null);
            setError(null);
            log('User logged out');
            return { success: true };
        } catch (error) {
            log('Logout error (non-critical):', error.message);
            // Aún así limpiar el estado local
            setUser(null);
            setError(null);
            return { success: true };
        } finally {
            setLoading(false);
        }
    };

    // Función para refrescar token
    const refreshAuth = async () => {
        try {
            const userData = await authService.refreshToken();
            if (userData) {
                setUser(userData);
                return { success: true };
            } else {
                setUser(null);
                return { success: false };
            }
        } catch (error) {
            log('Token refresh failed:', error.message);
            setUser(null);
            return { success: false };
        }
    };

    // Función para actualizar perfil de usuario
    const updateProfile = async (profileData) => {
        try {
            setLoading(true);
            const updatedUser = await authService.updateProfile(profileData);
            setUser(updatedUser);
            log('Profile updated:', updatedUser);
            return { success: true, user: updatedUser };
        } catch (error) {
            const errorMessage = error.message || config.ERRORS.UNKNOWN;
            setError(errorMessage);
            return { 
                success: false, 
                message: errorMessage 
            };
        } finally {
            setLoading(false);
        }
    };

    // Función para cambiar contraseña
    const changePassword = async (passwordData) => {
        try {
            setLoading(true);
            const result = await authService.changePassword(passwordData);
            log('Password changed successfully');
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || config.ERRORS.UNKNOWN;
            setError(errorMessage);
            return { 
                success: false, 
                message: errorMessage 
            };
        } finally {
            setLoading(false);
        }
    };

    // Limpiar error
    const clearError = () => {
        setError(null);
    };

    // Valores del contexto
    const value = {
        // Estado
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        
        // Funciones
        login,
        logout,
        refreshAuth,
        updateProfile,
        changePassword,
        clearError,
        checkAuth,
        
        // Utilidades
        hasPermission: (permission) => {
            if (!user) return false;
            if (user.role === 'admin') return true;
            return user.permissions?.includes(permission) || false;
        },
        
        canAccess: (resource) => {
            if (!user) return false;
            if (user.role === 'admin') return true;
            
            const resourcePermissions = {
                'creators': ['view_creators'],
                'brands': ['view_brands', 'manage_brands'],
                'users': ['manage_users'],
                'analytics': ['view_analytics'],
            };
            
            const requiredPermissions = resourcePermissions[resource];
            if (!requiredPermissions) return false;
            
            return requiredPermissions.some(permission => 
                user.permissions?.includes(permission)
            );
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};