/**
 * Utilidades compartidas para UGC Dashboard
 */

// Configuración global
window.UGCConfig = {
    API_BASE: 'https://aidadigital.cl/wp-content/themes/salient/api',
    APP_VERSION: '1.0.0',
    DEBUG: true
};

// Utilidades de formato
window.UGCUtils = {
    // Formatear intereses para mostrar
    formatInterests: (interests) => {
        if (!interests || interests.length === 0) return 'Sin intereses';
        
        const interestLabels = {
            'hoteleria-turismo': 'Hoteles y Turismo',
            'gastronomia': 'Gastronomía',
            'cocteleria': 'Coctelería y Vinos',
            'panoramas-eventos': 'Eventos',
            'inmobiliaria': 'Inmobiliaria',
            'familia': 'Familia',
            'mascotas': 'Mascotas',
            'moda': 'Moda',
            'cosmetica': 'Belleza',
            'deporte': 'Deporte',
            'decoracion': 'Decoración',
            'lujo': 'Lujo',
            'tecnologia': 'Tecnología',
            'educacion': 'Educación'
        };
        
        return interests.map(interest => 
            interestLabels[interest] || interest
        ).join(', ');
    },

    // Formatear rango de seguidores
    getFollowersLabel: (followersRange) => {
        const labels = {
            'menos-1000': 'Menos de 1K',
            '1000-4999': '1K-5K',
            '5000-9999': '5K-10K',
            '10000-24999': '10K-25K',
            '25000-49999': '25K-50K',
            'mas-50000': '50K+'
        };
        return labels[followersRange] || followersRange;
    },

    // Capitalizar primera letra
    capitalize: (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Formatear ubicación
    formatLocation: (location) => {
        if (!location) return '';
        return location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    // Formatear nacionalidad
    formatNationality: (nationality) => {
        if (!nationality) return '';
        return nationality.charAt(0).toUpperCase() + nationality.slice(1);
    },

    // Formatear nombre de plataforma
    formatPlatform: (platform) => {
        const platformNames = {
            'instagram': 'Instagram',
            'tiktok': 'TikTok',
            'youtube': 'YouTube',
            'otra': 'Otra'
        };
        return platformNames[platform] || platform;
    },

    // Validar email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Debounce para búsquedas
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Formatear fecha
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Calcular tiempo relativo
    timeAgo: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
        return UGCUtils.formatDate(dateString);
    },

    // Generar color aleatorio para avatars
    getAvatarColor: (name) => {
        const colors = [
            'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
            'bg-yellow-500', 'bg-red-500', 'bg-indigo-500',
            'bg-pink-500', 'bg-teal-500'
        ];
        const index = name.length % colors.length;
        return colors[index];
    },

    // Obtener iniciales del nombre
    getInitials: (name) => {
        if (!name) return 'U';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    },

    // Log con debug
    log: (...args) => {
        if (window.UGCConfig.DEBUG) {
            console.log('[UGC Dashboard]', ...args);
        }
    },

    // Error handling
    handleError: (error, context = '') => {
        console.error(`[UGC Dashboard Error] ${context}:`, error);
        
        // En producción, aquí podrías enviar el error a un servicio de logging
        if (!window.UGCConfig.DEBUG) {
            // Enviar a servicio de logging
        }
        
        return {
            success: false,
            message: 'Ha ocurrido un error. Por favor intenta nuevamente.',
            error: error.message
        };
    },

    // Hacer request HTTP con manejo de errores
    apiRequest: async (url, options = {}) => {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            UGCUtils.log('API Request Error:', error);
            throw error;
        }
    },

    // Filtrar creators
    filterCreators: (creators, filters) => {
        return creators.filter(creator => {
            // Búsqueda por texto
            if (filters.searchTerm) {
                const searchLower = filters.searchTerm.toLowerCase();
                const matchName = creator.full_name.toLowerCase().includes(searchLower);
                const matchEmail = creator.email.toLowerCase().includes(searchLower);
                if (!matchName && !matchEmail) return false;
            }

            // Filtro por intereses
            if (filters.interests && filters.interests.length > 0) {
                const hasInterest = creator.interests && 
                    filters.interests.some(interest => creator.interests.includes(interest));
                if (!hasInterest) return false;
            }

            // Filtro por plataforma
            if (filters.platform) {
                const hasPlatform = creator.platforms && 
                    creator.platforms.includes(filters.platform);
                if (!hasPlatform) return false;
            }

            // Filtro por edad
            if (filters.ageMin || filters.ageMax) {
                const age = parseInt(creator.age);
                const minAge = filters.ageMin ? parseInt(filters.ageMin) : 0;
                const maxAge = filters.ageMax ? parseInt(filters.ageMax) : 100;
                if (age < minAge || age > maxAge) return false;
            }

            // Filtro por nacionalidad
            if (filters.nationality) {
                if (creator.nationality !== filters.nationality) return false;
            }

            // Filtro por ubicación
            if (filters.location) {
                if (creator.location !== filters.location) return false;
            }

            return true;
        });
    },

    // Exportar datos a CSV
    exportToCSV: (data, filename = 'creators.csv') => {
        const headers = [
            'Nombre', 'Email', 'Teléfono', 'Edad', 'Nacionalidad', 
            'Ubicación', 'Modalidad', 'Plataformas', 'Intereses', 'Fecha Registro'
        ];

        const csvContent = [
            headers.join(','),
            ...data.map(creator => [
                `"${creator.full_name}"`,
                `"${creator.email}"`,
                `"${creator.phone}"`,
                creator.age,
                `"${UGCUtils.formatNationality(creator.nationality)}"`,
                `"${UGCUtils.formatLocation(creator.location)}"`,
                `"${UGCUtils.capitalize(creator.modality)}"`,
                `"${creator.platforms ? creator.platforms.join(', ') : ''}"`,
                `"${UGCUtils.formatInterests(creator.interests)}"`,
                `"${UGCUtils.formatDate(creator.created_at)}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Storage helpers
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(`ugc_${key}`, JSON.stringify(value));
            } catch (error) {
                UGCUtils.log('Storage set error:', error);
            }
        },
        
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(`ugc_${key}`);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                UGCUtils.log('Storage get error:', error);
                return defaultValue;
            }
        },
        
        remove: (key) => {
            try {
                localStorage.removeItem(`ugc_${key}`);
            } catch (error) {
                UGCUtils.log('Storage remove error:', error);
            }
        }
    }
};

// Inicializar utilidades
UGCUtils.log('Utils loaded successfully');

// Manejar errores globales
window.addEventListener('error', (event) => {
    UGCUtils.handleError(event.error, 'Global error');
});

window.addEventListener('unhandledrejection', (event) => {
    UGCUtils.handleError(event.reason, 'Unhandled promise rejection');
});