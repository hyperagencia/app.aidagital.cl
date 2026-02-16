/**
 * Configuración Global de la Aplicación
 */

export const config = {
    // API Configuration
    API_BASE: import.meta.env.VITE_API_BASE || 'https://aidadigital.cl/wp-content/themes/salient/api',
    
    // App Configuration
    APP_NAME: 'UGC Creators Dashboard',
    APP_VERSION: '1.0.0',
    COMPANY_NAME: 'AIDA Digital',
    
    // Environment
    NODE_ENV: import.meta.env.NODE_ENV || 'development',
    IS_DEVELOPMENT: import.meta.env.NODE_ENV === 'development',
    IS_PRODUCTION: import.meta.env.NODE_ENV === 'production',
    
    // Debug
    DEBUG: import.meta.env.VITE_DEBUG === 'true' || import.meta.env.NODE_ENV === 'development',
    
    // Storage
    STORAGE_PREFIX: 'ugc_',
    
    // Auth
    AUTH_TOKEN_KEY: 'authToken',
    AUTH_REFRESH_KEY: 'refreshToken',
    
    // UI Configuration
    DEBOUNCE_DELAY: 300,
    PAGINATION_SIZE: 50, // Aumentado de 25 a 50 para mostrar más creators
    
    // File Upload
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    
    // Theme
    THEME: {
        PRIMARY_COLOR: '#9333ea',
        SECONDARY_COLOR: '#7c3aed',
        SUCCESS_COLOR: '#10b981',
        ERROR_COLOR: '#ef4444',
        WARNING_COLOR: '#f59e0b',
    },
    
    // Routes
    ROUTES: {
        HOME: '/',
        DASHBOARD: '/dashboard',
        CREATORS: '/creators',
        BRANDS: '/brands',
        PROJECTS: '/projects',
        USERS: '/users',
        LOGIN: '/login',
        LOGOUT: '/logout',
    },
    
    // API Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth.php?action=login',
            LOGOUT: '/auth.php?action=logout',
            VERIFY: '/auth.php?action=verify',
            REFRESH: '/auth.php?action=refresh',
        },
        CREATORS: {
            LIST: '/creators.php',
            CREATE: '/creators.php',
            UPDATE: '/creators.php',
            DELETE: '/creators.php',
            EXPORT: '/creators.php?action=export',
        },
        BRANDS: {
            LIST: '/brands.php',
            CREATE: '/brands.php',
            UPDATE: '/brands.php',
            DELETE: '/brands.php',
        },
        PROJECTS: {
            LIST: '/projects.php',
            CREATE: '/projects.php',
            UPDATE: '/projects.php',
            DELETE: '/projects.php',
        },
        USERS: {
            LIST: '/users.php',
            CREATE: '/users.php',
            UPDATE: '/users.php',
            DELETE: '/users.php',
        },
        STATS: {
            DASHBOARD: '/stats.php?type=dashboard',
            CREATORS: '/stats.php?type=creators',
            BRANDS: '/stats.php?type=brands',
        },
    },
    
    // Validation Rules
    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^[+]?[\d\s\-\(\)]{8,}$/,
        MIN_PASSWORD_LENGTH: 6,
        MIN_AGE: 18,
        MAX_AGE: 80,
    },
    
    // Localization
    LOCALE: {
        DEFAULT_LANGUAGE: 'es',
        DATE_FORMAT: 'es-CL',
        CURRENCY: 'CLP',
    },
    
    // Feature Flags
    FEATURES: {
        ENABLE_REGISTRATION: true,
        ENABLE_EXPORT: true,
        ENABLE_NOTIFICATIONS: false,
        ENABLE_ANALYTICS: true,
        ENABLE_DARK_MODE: false,
    },
    
    // Error Messages
    ERRORS: {
        NETWORK: 'Error de conexión. Verifica tu internet.',
        UNAUTHORIZED: 'Sesión expirada. Inicia sesión nuevamente.',
        FORBIDDEN: 'No tienes permisos para realizar esta acción.',
        NOT_FOUND: 'El recurso solicitado no existe.',
        SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
        VALIDATION_ERROR: 'Hay errores en el formulario.',
        UNKNOWN: 'Ha ocurrido un error inesperado.',
    },
    
    // Success Messages
    SUCCESS: {
        LOGIN: 'Sesión iniciada correctamente',
        LOGOUT: 'Sesión cerrada correctamente',
        SAVE: 'Guardado exitosamente',
        DELETE: 'Eliminado exitosamente',
        EXPORT: 'Exportación completada',
        UPDATE: 'Actualizado exitosamente',
    },
};

// Función para obtener configuración del entorno
export const getEnvConfig = (key, defaultValue = null) => {
    return import.meta.env[key] || defaultValue;
};

// Función para verificar si una feature está habilitada
export const isFeatureEnabled = (feature) => {
    return config.FEATURES[feature] || false;
};

// Función para obtener endpoint completo
export const getEndpoint = (path) => {
    return `${config.API_BASE}${path}`;
};

// Función para logging condicional
export const log = (...args) => {
    if (config.DEBUG) {
        console.log(`[${config.APP_NAME}]`, ...args);
    }
};

// Función para logging de errores
export const logError = (error, context = '') => {
    console.error(`[${config.APP_NAME} Error] ${context}:`, error);
    
    // En producción, aquí podrías enviar a un servicio de logging
    if (config.IS_PRODUCTION && window.analytics) {
        window.analytics.track('error', {
            message: error.message,
            context,
            stack: error.stack,
        });
    }
};

export default config;