/**
 * Utilidades de Formato
 * Funciones para formatear datos para mostrar en la UI
 */

import { config } from '../services/config.js';

// Mapeos de datos
const INTEREST_LABELS = {
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
    'educacion': 'Educación',
};

const FOLLOWERS_LABELS = {
    'menos-1000': 'Menos de 1K',
    '1000-4999': '1K-5K',
    '5000-9999': '5K-10K',
    '10000-24999': '10K-25K',
    '25000-49999': '25K-50K',
    'mas-50000': '50K+',
};

const PLATFORM_LABELS = {
    'instagram': 'Instagram',
    'tiktok': 'TikTok',
    'youtube': 'YouTube',
    'otra': 'Otra',
};

// Formatear intereses
export const formatInterests = (interests) => {
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
        return 'Sin intereses';
    }
    
    return interests
        .map(interest => INTEREST_LABELS[interest] || interest)
        .join(', ');
};

// Formatear rango de seguidores
export const formatFollowersRange = (followersRange) => {
    return FOLLOWERS_LABELS[followersRange] || followersRange;
};

// Formatear plataforma
export const formatPlatform = (platform) => {
    return PLATFORM_LABELS[platform] || platform;
};

// Capitalizar primera letra
export const capitalize = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Formatear nombre completo
export const formatFullName = (firstName, lastName) => {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.join(' ').trim();
};

// Formatear ubicación
export const formatLocation = (location) => {
    if (!location) return '';
    return location
        .replace('-', ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
};

// Formatear nacionalidad
export const formatNationality = (nationality) => {
    if (!nationality) return '';
    return capitalize(nationality);
};

// Formatear modalidad
export const formatModality = (modality) => {
    if (!modality) return '';
    return capitalize(modality);
};

// Formatear teléfono
export const formatPhone = (phone) => {
    if (!phone) return '';
    
    // Limpiar el número
    const cleaned = phone.replace(/\D/g, '');
    
    // Formatear número chileno
    if (cleaned.startsWith('569') && cleaned.length === 11) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    
    // Formatear número con código de país
    if (cleaned.length > 10) {
        return `+${cleaned}`;
    }
    
    // Retornar tal como está si no se puede formatear
    return phone;
};

// Formatear email (ocultar parte del dominio para privacidad)
export const formatEmailPrivate = (email) => {
    if (!email) return '';
    
    const [username, domain] = email.split('@');
    if (!domain) return email;
    
    const maskedUsername = username.length > 3 
        ? `${username.slice(0, 2)}***${username.slice(-1)}`
        : username;
    
    return `${maskedUsername}@${domain}`;
};

// Formatear fecha
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    };
    
    return date.toLocaleDateString(config.LOCALE.DATE_FORMAT, defaultOptions);
};

// Formatear fecha corta
export const formatDateShort = (dateString) => {
    return formatDate(dateString, {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
    });
};

// Formatear tiempo relativo
export const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return formatDate(dateString);
};

// Formatear duración
export const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
};

// Formatear tamaño de archivo
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Formatear números
export const formatNumber = (number, options = {}) => {
    if (typeof number !== 'number' || isNaN(number)) return '0';
    
    const defaultOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...options,
    };
    
    return number.toLocaleString(config.LOCALE.DATE_FORMAT, defaultOptions);
};

// Formatear porcentaje
export const formatPercentage = (value, total, decimals = 1) => {
    if (!value || !total || total === 0) return '0%';
    
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
};

// Formatear moneda (CLP)
export const formatCurrency = (amount, currency = 'CLP') => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0';
    
    return new Intl.NumberFormat(config.LOCALE.DATE_FORMAT, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Formatear texto para URL (slug)
export const formatSlug = (text) => {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '-') // Espacios a guiones
        .replace(/-+/g, '-') // Múltiples guiones a uno
        .trim();
};

// Formatear texto para búsqueda
export const formatSearchText = (text) => {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .trim();
};

// Truncar texto
export const truncateText = (text, maxLength = 100, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    
    return text.substring(0, maxLength).trim() + suffix;
};

// Formatear lista como texto
export const formatList = (items, separator = ', ', lastSeparator = ' y ') => {
    if (!items || !Array.isArray(items) || items.length === 0) return '';
    
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(lastSeparator);
    
    return items.slice(0, -1).join(separator) + lastSeparator + items[items.length - 1];
};

// Obtener iniciales de un nombre
export const getInitials = (name) => {
    if (!name) return 'U';
    
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Generar color para avatar basado en texto
export const getAvatarColor = (text) => {
    if (!text) return 'bg-gray-500';
    
    const colors = [
        'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
        'bg-yellow-500', 'bg-red-500', 'bg-indigo-500',
        'bg-pink-500', 'bg-teal-500', 'bg-orange-500',
        'bg-emerald-500', 'bg-cyan-500', 'bg-violet-500'
    ];
    
    const index = text.length % colors.length;
    return colors[index];
};

// Exportar todas las funciones como objeto
export const formatters = {
    formatInterests,
    formatFollowersRange,
    formatPlatform,
    capitalize,
    formatFullName,
    formatLocation,
    formatNationality,
    formatModality,
    formatPhone,
    formatEmailPrivate,
    formatDate,
    formatDateShort,
    formatTimeAgo,
    formatDuration,
    formatFileSize,
    formatNumber,
    formatPercentage,
    formatCurrency,
    formatSlug,
    formatSearchText,
    truncateText,
    formatList,
    getInitials,
    getAvatarColor,
};

export default formatters;