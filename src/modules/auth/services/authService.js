/**
 * Servicio de Autenticación
 * Maneja todas las operaciones de auth con el backend
 */

import { api } from '../../../services/api.js';
import { authStorage } from '../../../services/storage.js';
import { config, log, logError } from '../../../services/config.js';
import { validation } from '../../../utils/validators.js';

class AuthService {
    constructor() {
        this.baseEndpoint = '';
        this.setupApiInterceptor();
    }

    // Configurar interceptor para manejar tokens expirados
    setupApiInterceptor() {
        api.setAuthInterceptor(() => {
            this.clearAuthData();
            window.location.reload(); // Recargar para mostrar login
        });
    }

    // Login
    async login(credentials) {
        try {
            // Validar credenciales
            const validation = this.validateLogin(credentials);
            if (!validation.isValid) {
                throw new Error(Object.values(validation.errors).flat()[0]);
            }

            log('Attempting login for:', credentials.email);

            const response = await api.post(config.ENDPOINTS.AUTH.LOGIN, {
                email: credentials.email.trim(),
                password: credentials.password,
            });

            if (response.success) {
                // Guardar tokens
                if (response.data.token) {
                    authStorage.setToken(response.data.token);
                }
                
                if (response.data.refreshToken) {
                    authStorage.setRefreshToken(response.data.refreshToken);
                }

                log('Login successful');
                return {
                    success: true,
                    user: response.data.user,
                    token: response.data.token,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNAUTHORIZED);
            }
        } catch (error) {
            logError(error, 'Login');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Logout
    async logout() {
        try {
            const token = authStorage.getToken();
            
            if (token) {
                // Intentar hacer logout en el servidor
                try {
                    await api.post(config.ENDPOINTS.AUTH.LOGOUT);
                } catch (error) {
                    // No es crítico si falla el logout del servidor
                    log('Server logout failed (non-critical):', error.message);
                }
            }

            // Limpiar datos locales
            this.clearAuthData();
            log('Logout completed');
            
        } catch (error) {
            logError(error, 'Logout');
            // Aún así limpiar datos locales
            this.clearAuthData();
        }
    }

    // Verificar token
    async verifyToken() {
        try {
            const token = authStorage.getToken();
            
            if (!token) {
                log('No token found');
                return null;
            }

            const response = await api.post(config.ENDPOINTS.AUTH.VERIFY);

            if (response.success && response.data.user) {
                log('Token verified successfully');
                return response.data.user;
            } else {
                log('Token verification failed');
                this.clearAuthData();
                return null;
            }
        } catch (error) {
            log('Token verification error:', error.message);
            this.clearAuthData();
            return null;
        }
    }

    // Refrescar token
    async refreshToken() {
        try {
            const refreshToken = authStorage.getRefreshToken();
            
            if (!refreshToken) {
                log('No refresh token found');
                return null;
            }

            const response = await api.post(config.ENDPOINTS.AUTH.REFRESH, {
                refreshToken,
            });

            if (response.success) {
                // Actualizar tokens
                if (response.data.token) {
                    authStorage.setToken(response.data.token);
                }
                
                if (response.data.refreshToken) {
                    authStorage.setRefreshToken(response.data.refreshToken);
                }

                log('Token refreshed successfully');
                return response.data.user;
            } else {
                log('Token refresh failed');
                this.clearAuthData();
                return null;
            }
        } catch (error) {
            log('Token refresh error:', error.message);
            this.clearAuthData();
            return null;
        }
    }

    // Actualizar perfil
    async updateProfile(profileData) {
        try {
            const response = await api.put('/profile', profileData);

            if (response.success) {
                log('Profile updated successfully');
                return response.data.user;
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Update profile');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Cambiar contraseña
    async changePassword(passwordData) {
        try {
            // Validar datos de contraseña
            const validation = this.validatePasswordChange(passwordData);
            if (!validation.isValid) {
                throw new Error(Object.values(validation.errors).flat()[0]);
            }

            const response = await api.put('/profile/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            if (response.success) {
                log('Password changed successfully');
                return true;
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Change password');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Restablecer contraseña
    async resetPassword(email) {
        try {
            if (!validation.isValidEmail(email)) {
                throw new Error('Email inválido');
            }

            const response = await api.post('/auth/reset-password', {
                email: email.trim(),
            });

            if (response.success) {
                log('Password reset email sent');
                return true;
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Reset password');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Confirmar restablecimiento de contraseña
    async confirmPasswordReset(resetData) {
        try {
            const validation = this.validatePasswordReset(resetData);
            if (!validation.isValid) {
                throw new Error(Object.values(validation.errors).flat()[0]);
            }

            const response = await api.post('/auth/confirm-reset', {
                token: resetData.token,
                newPassword: resetData.newPassword,
            });

            if (response.success) {
                log('Password reset confirmed');
                return true;
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Confirm password reset');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Validar credenciales de login
    validateLogin(credentials) {
        return validation.validateLogin(credentials);
    }

    // Validar cambio de contraseña
    validatePasswordChange(passwordData) {
        const rules = {
            currentPassword: [
                { validator: validation.isRequired, message: 'La contraseña actual es requerida' },
            ],
            newPassword: [
                { validator: validation.isRequired, message: 'La nueva contraseña es requerida' },
                { validator: validation.isValidPassword, message: `La contraseña debe tener al menos ${config.VALIDATION.MIN_PASSWORD_LENGTH} caracteres` },
            ],
            confirmPassword: [
                { validator: validation.isRequired, message: 'Confirma la nueva contraseña' },
                { 
                    validator: (value) => value === passwordData.newPassword, 
                    message: 'Las contraseñas no coinciden' 
                },
            ],
        };

        return validation.validateObject(passwordData, rules);
    }

    // Validar restablecimiento de contraseña
    validatePasswordReset(resetData) {
        const rules = {
            token: [
                { validator: validation.isRequired, message: 'Token de restablecimiento requerido' },
            ],
            newPassword: [
                { validator: validation.isRequired, message: 'La nueva contraseña es requerida' },
                { validator: validation.isValidPassword, message: `La contraseña debe tener al menos ${config.VALIDATION.MIN_PASSWORD_LENGTH} caracteres` },
            ],
            confirmPassword: [
                { validator: validation.isRequired, message: 'Confirma la nueva contraseña' },
                { 
                    validator: (value) => value === resetData.newPassword, 
                    message: 'Las contraseñas no coinciden' 
                },
            ],
        };

        return validation.validateObject(resetData, rules);
    }

    // Limpiar datos de autenticación
    clearAuthData() {
        authStorage.clearAuth();
        log('Auth data cleared');
    }

    // Obtener usuario actual desde token
    getCurrentUser() {
        return authStorage.getToken() ? this.verifyToken() : null;
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return !!authStorage.getToken();
    }

    // Obtener token actual
    getToken() {
        return authStorage.getToken();
    }

    // Verificar si el token está próximo a expirar
    isTokenExpiringSoon() {
        const token = authStorage.getToken();
        if (!token) return false;

        try {
            // Decodificar JWT para verificar expiración
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiration = payload.exp * 1000; // Convertir a milliseconds
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            return (expiration - now) < fiveMinutes;
        } catch (error) {
            log('Error checking token expiration:', error.message);
            return true; // Asumir que expira si no se puede decodificar
        }
    }

    // Auto-refresh del token si está próximo a expirar
    async autoRefreshToken() {
        if (this.isTokenExpiringSoon()) {
            log('Token expiring soon, attempting refresh...');
            return await this.refreshToken();
        }
        return null;
    }
}

// Instancia singleton
export const authService = new AuthService();

export default authService;