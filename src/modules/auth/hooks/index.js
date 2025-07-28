/**
 * Hooks de Autenticación
 * Hooks personalizados para manejo de auth
 */

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { authService } from '../services/authService.js';
import { log } from '../../../services/config.js';

// Hook principal de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    
    return context;
};

// Hook para permisos específicos
export const usePermissions = () => {
    const { user, isAuthenticated, isAdmin } = useAuth();
    
    return {
        // Permisos básicos
        isAuthenticated,
        isAdmin,
        
        // Permisos específicos de recursos
        canViewCreators: isAuthenticated,
        canCreateCreators: isAdmin,
        canEditCreators: isAdmin,
        canDeleteCreators: isAdmin,
        canExportCreators: isAuthenticated,
        
        canViewBrands: isAdmin,
        canCreateBrands: isAdmin,
        canEditBrands: isAdmin,
        canDeleteBrands: isAdmin,
        
        canViewUsers: isAdmin,
        canCreateUsers: isAdmin,
        canEditUsers: isAdmin,
        canDeleteUsers: isAdmin,
        
        canViewAnalytics: isAuthenticated,
        canExportData: isAuthenticated,
        canManageSettings: isAdmin,
        
        // Verificar permiso específico
        hasPermission: (permission) => {
            if (!user) return false;
            if (isAdmin) return true;
            return user.permissions?.includes(permission) || false;
        },
        
        // Verificar acceso a recurso
        canAccess: (resource) => {
            if (!user) return false;
            if (isAdmin) return true;
            
            const resourcePermissions = {
                'creators': ['view_creators'],
                'brands': ['view_brands'],
                'users': ['manage_users'],
                'analytics': ['view_analytics'],
                'settings': ['manage_settings'],
            };
            
            const required = resourcePermissions[resource];
            if (!required) return false;
            
            return required.some(perm => user.permissions?.includes(perm));
        },
    };
};

// Hook para auto-refresh de token
export const useTokenRefresh = () => {
    const { user, refreshAuth } = useAuth();
    
    useEffect(() => {
        if (!user) return;
        
        // Configurar refresh automático cada 5 minutos
        const interval = setInterval(async () => {
            if (authService.isTokenExpiringSoon()) {
                log('Auto-refreshing token...');
                await refreshAuth();
            }
        }, 5 * 60 * 1000); // 5 minutos
        
        return () => clearInterval(interval);
    }, [user, refreshAuth]);
};

// Hook para manejar login
export const useLogin = () => {
    const { login: contextLogin } = useAuth();
    const [isLogging, setIsLogging] = useState(false);
    const [loginError, setLoginError] = useState(null);
    
    const login = async (credentials) => {
        try {
            setIsLogging(true);
            setLoginError(null);
            
            const result = await contextLogin(credentials);
            
            if (!result.success) {
                setLoginError(result.message);
            }
            
            return result;
        } catch (error) {
            setLoginError(error.message);
            return { success: false, message: error.message };
        } finally {
            setIsLogging(false);
        }
    };
    
    const clearError = () => setLoginError(null);
    
    return {
        login,
        isLogging,
        loginError,
        clearError,
    };
};

// Hook para manejar logout
export const useLogout = () => {
    const { logout: contextLogout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const logout = async () => {
        try {
            setIsLoggingOut(true);
            await contextLogout();
        } catch (error) {
            log('Logout error:', error.message);
        } finally {
            setIsLoggingOut(false);
        }
    };
    
    return {
        logout,
        isLoggingOut,
    };
};

// Hook para manejar cambio de perfil
export const useProfileUpdate = () => {
    const { updateProfile } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    
    const update = async (profileData) => {
        try {
            setIsUpdating(true);
            setUpdateError(null);
            setUpdateSuccess(false);
            
            const result = await updateProfile(profileData);
            
            if (result.success) {
                setUpdateSuccess(true);
                // Limpiar success después de 3 segundos
                setTimeout(() => setUpdateSuccess(false), 3000);
            } else {
                setUpdateError(result.message);
            }
            
            return result;
        } catch (error) {
            setUpdateError(error.message);
            return { success: false, message: error.message };
        } finally {
            setIsUpdating(false);
        }
    };
    
    const clearMessages = () => {
        setUpdateError(null);
        setUpdateSuccess(false);
    };
    
    return {
        update,
        isUpdating,
        updateError,
        updateSuccess,
        clearMessages,
    };
};

// Hook para manejar cambio de contraseña
export const usePasswordChange = () => {
    const { changePassword } = useAuth();
    const [isChanging, setIsChanging] = useState(false);
    const [changeError, setChangeError] = useState(null);
    const [changeSuccess, setChangeSuccess] = useState(false);
    
    const change = async (passwordData) => {
        try {
            setIsChanging(true);
            setChangeError(null);
            setChangeSuccess(false);
            
            const result = await changePassword(passwordData);
            
            if (result.success) {
                setChangeSuccess(true);
                // Limpiar success después de 3 segundos
                setTimeout(() => setChangeSuccess(false), 3000);
            } else {
                setChangeError(result.message);
            }
            
            return result;
        } catch (error) {
            setChangeError(error.message);
            return { success: false, message: error.message };
        } finally {
            setIsChanging(false);
        }
    };
    
    const clearMessages = () => {
        setChangeError(null);
        setChangeSuccess(false);
    };
    
    return {
        change,
        isChanging,
        changeError,
        changeSuccess,
        clearMessages,
    };
};

// Hook para verificar autenticación en tiempo real
export const useAuthStatus = () => {
    const { user, loading, error, isAuthenticated } = useAuth();
    const [authStatus, setAuthStatus] = useState({
        status: 'checking', // 'checking', 'authenticated', 'unauthenticated', 'error'
        user: null,
        error: null,
    });
    
    useEffect(() => {
        if (loading) {
            setAuthStatus({
                status: 'checking',
                user: null,
                error: null,
            });
        } else if (error) {
            setAuthStatus({
                status: 'error',
                user: null,
                error,
            });
        } else if (isAuthenticated && user) {
            setAuthStatus({
                status: 'authenticated',
                user,
                error: null,
            });
        } else {
            setAuthStatus({
                status: 'unauthenticated',
                user: null,
                error: null,
            });
        }
    }, [user, loading, error, isAuthenticated]);
    
    return authStatus;
};

// Hook para redirección condicional
export const useAuthRedirect = (redirectTo = '/login', requireAuth = true) => {
    const { isAuthenticated, loading } = useAuth();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    
    useEffect(() => {
        if (loading) return;
        
        const shouldRedirectNow = requireAuth ? !isAuthenticated : isAuthenticated;
        setShouldRedirect(shouldRedirectNow);
        
        if (shouldRedirectNow && typeof window !== 'undefined') {
            // Aquí podrías usar react-router para redirección
            // window.location.href = redirectTo;
            log(`Should redirect to: ${redirectTo}`);
        }
    }, [isAuthenticated, loading, redirectTo, requireAuth]);
    
    return {
        shouldRedirect,
        isReady: !loading,
    };
};

// Exportar todos los hooks
export const authHooks = {
    useAuth,
    usePermissions,
    useTokenRefresh,
    useLogin,
    useLogout,
    useProfileUpdate,
    usePasswordChange,
    useAuthStatus,
    useAuthRedirect,
};

export default authHooks;