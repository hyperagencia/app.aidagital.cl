/**
 * Servicio de Autenticación - MODO DESARROLLO
 */

import { api } from '../../../services/api.js';
import { authStorage } from '../../../services/storage.js';
import { config, log, logError } from '../../../services/config.js';
import { validation } from '../../../utils/validators.js';

class AuthService {
    constructor() {
        this.baseEndpoint = '';
        
        // FORZAR MODO DESARROLLO
        this.isDevelopment = true; // Siempre desarrollo por ahora
        
        log('AuthService initialized - Development mode:', this.isDevelopment);
        
        if (!this.isDevelopment) {
            this.setupApiInterceptor();
        }
    }

    // Login con modo desarrollo FORZADO
    async login(credentials) {
        try {
            log('🔐 Starting login process...');
            log('🔐 Development mode:', this.isDevelopment);
            
            // Validar credenciales básicas
            if (!credentials.email || credentials.email.length < 3) {
                throw new Error('Email requerido');
            }
            
            if (!credentials.password || credentials.password.length < 1) {
                throw new Error('Contraseña requerida');
            }

            log('🔐 Attempting login for:', credentials.email);

            // SIEMPRE usar modo desarrollo por ahora
            return await this.mockLogin(credentials);
            
        } catch (error) {
            logError(error, 'Login');
            throw error;
        }
    }

    // Login SIMULADO para desarrollo
    async mockLogin(credentials) {
        log('🔐 Using MOCK login...');
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800));

        const { email, password } = credentials;

        // Usuarios de prueba - CUALQUIER PASSWORD FUNCIONA
        const mockUsers = {
            'admin@aidadigital.cl': {
                id: 1,
                name: 'Admin AIDA',
                email: 'admin@aidadigital.cl',
                role: 'admin',
                permissions: ['all'],
            },
            'user@aidadigital.cl': {
                id: 2,
                name: 'Usuario Demo',
                email: 'user@aidadigital.cl',
                role: 'user',
                permissions: ['view_creators'],
            }
        };

        // Verificar si el usuario existe
        if (!mockUsers[email]) {
            // Si no existe, crear usuario genérico
            const genericUser = {
                id: 999,
                name: 'Usuario Genérico',
                email: email,
                role: 'user',
                permissions: ['view_creators'],
            };
            
            const token = `mock_token_${Date.now()}`;
            authStorage.setToken(token);
            
            log('🔐 Mock login successful (generic user):', genericUser);
            return {
                success: true,
                user: genericUser,
                token,
            };
        }

        // Usar usuario predefinido
        const user = mockUsers[email];
        const token = `mock_token_${Date.now()}`;

        // Guardar token falso
        authStorage.setToken(token);

        log('🔐 Mock login successful:', user);

        return {
            success: true,
            user,
            token,
        };
    }

    // Logout
    async logout() {
        log('🔐 Logging out...');
        this.clearAuthData();
        log('🔐 Logout completed');
    }

    // Verificar token - SIEMPRE SIMULADO
    async verifyToken() {
        const token = authStorage.getToken();
        
        if (!token) {
            log('🔐 No token found');
            return null;
        }

        if (!token.startsWith('mock_token_')) {
            log('🔐 Invalid token format');
            this.clearAuthData();
            return null;
        }

        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 200));

        // Retornar usuario admin por defecto
        const user = {
            id: 1,
            name: 'Admin AIDA',
            email: 'admin@aidadigital.cl',
            role: 'admin',
            permissions: ['all'],
        };

        log('🔐 Token verified successfully');
        return user;
    }

    // Limpiar datos
    clearAuthData() {
        authStorage.clearAuth();
        log('🔐 Auth data cleared');
    }

    // Métodos requeridos pero no usados en desarrollo
    setupApiInterceptor() {
        // No hacer nada en desarrollo
    }

    refreshToken() {
        return this.verifyToken();
    }

    isAuthenticated() {
        return !!authStorage.getToken();
    }

    getToken() {
        return authStorage.getToken();
    }

    validateLogin(credentials) {
        // Validación súper básica para desarrollo
        return {
            isValid: true,
            errors: {}
        };
    }
}

// Instancia singleton
export const authService = new AuthService();
export default authService;