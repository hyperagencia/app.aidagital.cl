/**
 * Utilidades de Validación
 * Funciones para validar datos de entrada
 */

import { config } from '../services/config.js';

// Validar email
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    return config.VALIDATION.EMAIL_REGEX.test(email.trim());
};

// Validar teléfono
export const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    return config.VALIDATION.PHONE_REGEX.test(phone.trim());
};

// Validar contraseña
export const isValidPassword = (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= config.VALIDATION.MIN_PASSWORD_LENGTH;
};

// Validar edad
export const isValidAge = (age) => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return false;
    return ageNum >= config.VALIDATION.MIN_AGE && ageNum <= config.VALIDATION.MAX_AGE;
};

// Validar nombre
export const isValidName = (name) => {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 50;
};

// Validar URL
export const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Validar campo requerido
export const isRequired = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

// Validar longitud mínima
export const hasMinLength = (value, minLength) => {
    if (!value || typeof value !== 'string') return false;
    return value.trim().length >= minLength;
};

// Validar longitud máxima
export const hasMaxLength = (value, maxLength) => {
    if (!value || typeof value !== 'string') return true;
    return value.trim().length <= maxLength;
};

// Validar rango numérico
export const isInRange = (value, min, max) => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
};

// Validar que sea un número
export const isNumber = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

// Validar que sea un entero
export const isInteger = (value) => {
    return Number.isInteger(parseFloat(value));
};

// Validar formato de fecha
export const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

// Validar que la fecha sea futura
export const isFutureDate = (dateString) => {
    if (!isValidDate(dateString)) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date > now;
};

// Validar que la fecha sea pasada
export const isPastDate = (dateString) => {
    if (!isValidDate(dateString)) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
};

// Validar archivo
export const isValidFile = (file, options = {}) => {
    if (!file || !(file instanceof File)) return false;
    
    const {
        maxSize = config.MAX_FILE_SIZE,
        allowedTypes = config.ALLOWED_FILE_TYPES,
    } = options;
    
    // Validar tamaño
    if (file.size > maxSize) return false;
    
    // Validar tipo
    if (allowedTypes && allowedTypes.length > 0) {
        return allowedTypes.includes(file.type);
    }
    
    return true;
};

// Validar array de selección múltiple
export const isValidSelection = (selection, options = {}) => {
    if (!Array.isArray(selection)) return false;
    
    const { min = 0, max = Infinity } = options;
    
    return selection.length >= min && selection.length <= max;
};

// Validar formato específico de campos
export const validators = {
    // Validador para intereses
    interests: (interests) => {
        if (!Array.isArray(interests)) return false;
        return interests.length > 0 && interests.length <= 10;
    },
    
    // Validador para plataformas
    platforms: (platforms) => {
        if (!Array.isArray(platforms)) return false;
        const validPlatforms = ['instagram', 'tiktok', 'youtube', 'otra'];
        return platforms.length > 0 && 
               platforms.every(platform => validPlatforms.includes(platform));
    },
    
    // Validador para nacionalidad
    nationality: (nationality) => {
        if (!nationality || typeof nationality !== 'string') return false;
        const validNationalities = ['chilena', 'extranjera'];
        return validNationalities.includes(nationality.toLowerCase());
    },
    
    // Validador para modalidad
    modality: (modality) => {
        if (!modality || typeof modality !== 'string') return false;
        const validModalities = ['presencial', 'remoto', 'hibrido'];
        return validModalities.includes(modality.toLowerCase());
    },
    
    // Validador para ubicación
    location: (location) => {
        if (!location || typeof location !== 'string') return false;
        return location.trim().length >= 3;
    },
    
    // Validador para username
    username: (username) => {
        if (!username || typeof username !== 'string') return false;
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    },
    
    // Validador para código postal chileno
    postalCode: (code) => {
        if (!code || typeof code !== 'string') return false;
        const chileanPostalRegex = /^\d{7}$/;
        return chileanPostalRegex.test(code);
    },
    
    // Validador para RUT chileno
    rut: (rut) => {
        if (!rut || typeof rut !== 'string') return false;
        
        // Limpiar RUT
        const cleaned = rut.replace(/[^0-9kK]/g, '');
        if (cleaned.length < 8 || cleaned.length > 9) return false;
        
        const body = cleaned.slice(0, -1);
        const dv = cleaned.slice(-1).toUpperCase();
        
        // Calcular dígito verificador
        let sum = 0;
        let multiplier = 2;
        
        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }
        
        const remainder = sum % 11;
        const calculatedDv = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();
        
        return dv === calculatedDv;
    },
};

// Función para validar objeto completo
export const validateObject = (obj, rules) => {
    const errors = {};
    
    Object.entries(rules).forEach(([field, fieldRules]) => {
        const value = obj[field];
        const fieldErrors = [];
        
        fieldRules.forEach(rule => {
            if (typeof rule === 'function') {
                if (!rule(value)) {
                    fieldErrors.push('Campo inválido');
                }
            } else if (typeof rule === 'object') {
                const { validator, message } = rule;
                if (typeof validator === 'function' && !validator(value)) {
                    fieldErrors.push(message || 'Campo inválido');
                }
            }
        });
        
        if (fieldErrors.length > 0) {
            errors[field] = fieldErrors;
        }
    });
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

// Reglas de validación predefinidas para creators
export const creatorValidationRules = {
    full_name: [
        { validator: isRequired, message: 'El nombre es requerido' },
        { validator: isValidName, message: 'El nombre debe tener entre 2 y 50 caracteres' },
    ],
    email: [
        { validator: isRequired, message: 'El email es requerido' },
        { validator: isValidEmail, message: 'El email no es válido' },
    ],
    phone: [
        { validator: isRequired, message: 'El teléfono es requerido' },
        { validator: isValidPhone, message: 'El teléfono no es válido' },
    ],
    age: [
        { validator: isRequired, message: 'La edad es requerida' },
        { validator: isValidAge, message: `La edad debe estar entre ${config.VALIDATION.MIN_AGE} y ${config.VALIDATION.MAX_AGE} años` },
    ],
    nationality: [
        { validator: isRequired, message: 'La nacionalidad es requerida' },
        { validator: validators.nationality, message: 'Selecciona una nacionalidad válida' },
    ],
    location: [
        { validator: isRequired, message: 'La ubicación es requerida' },
        { validator: validators.location, message: 'La ubicación debe tener al menos 3 caracteres' },
    ],
    modality: [
        { validator: isRequired, message: 'La modalidad es requerida' },
        { validator: validators.modality, message: 'Selecciona una modalidad válida' },
    ],
    platforms: [
        { validator: isRequired, message: 'Debes seleccionar al menos una plataforma' },
        { validator: validators.platforms, message: 'Selecciona plataformas válidas' },
    ],
    interests: [
        { validator: isRequired, message: 'Debes seleccionar al menos un interés' },
        { validator: validators.interests, message: 'Puedes seleccionar máximo 10 intereses' },
    ],
};

// Función para validar creator
export const validateCreator = (creator) => {
    return validateObject(creator, creatorValidationRules);
};

// Función para validar login
export const validateLogin = (credentials) => {
    const rules = {
        email: [
            { validator: isRequired, message: 'El email es requerido' },
            { validator: isValidEmail, message: 'El email no es válido' },
        ],
        password: [
            { validator: isRequired, message: 'La contraseña es requerida' },
            { validator: isValidPassword, message: `La contraseña debe tener al menos ${config.VALIDATION.MIN_PASSWORD_LENGTH} caracteres` },
        ],
    };
    
    return validateObject(credentials, rules);
};

// Exportar todas las funciones de validación
export const validation = {
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isValidAge,
    isValidName,
    isValidUrl,
    isRequired,
    hasMinLength,
    hasMaxLength,
    isInRange,
    isNumber,
    isInteger,
    isValidDate,
    isFutureDate,
    isPastDate,
    isValidFile,
    isValidSelection,
    validators,
    validateObject,
    validateCreator,
    validateLogin,
    creatorValidationRules,
};

export default validation;