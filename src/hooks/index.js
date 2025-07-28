/**
 * Hooks Globales
 * Hooks reutilizables para toda la aplicación
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '../services/storage.js';
import { config, log } from '../services/config.js';

// Hook para manejo de localStorage
export const useLocalStorage = (key, initialValue) => {
    // Obtener valor inicial del storage o usar el valor por defecto
    const [storedValue, setStoredValue] = useState(() => {
        try {
            return storage.get(key, initialValue);
        } catch (error) {
            log('Error reading from localStorage:', error);
            return initialValue;
        }
    });

    // Función para actualizar el valor
    const setValue = useCallback((value) => {
        try {
            // Permitir que value sea una función
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            setStoredValue(valueToStore);
            storage.set(key, valueToStore);
        } catch (error) {
            log('Error setting localStorage:', error);
        }
    }, [key, storedValue]);

    // Función para remover el valor
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            storage.remove(key);
        } catch (error) {
            log('Error removing from localStorage:', error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
};

// Hook para debounce
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Hook para detección de clicks fuera de un elemento
export const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

// Hook para estado de loading con manejo de errores
export const useAsyncState = (asyncFunction) => {
    const [state, setState] = useState({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(async (...args) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            const result = await asyncFunction(...args);
            setState({ data: result, loading: false, error: null });
            return result;
        } catch (error) {
            setState({ data: null, loading: false, error });
            throw error;
        }
    }, [asyncFunction]);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return { ...state, execute, reset };
};

// Hook para manejo de formularios
export const useForm = (initialValues, validationRules = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Función para actualizar un campo
    const setValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo si existe
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }, [errors]);

    // Función para marcar un campo como tocado
    const setTouched = useCallback((name, isTouched = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));
    }, []);

    // Función para validar un campo específico
    const validateField = useCallback((name, value) => {
        const rule = validationRules[name];
        if (!rule) return null;

        if (typeof rule === 'function') {
            return rule(value, values);
        }

        if (typeof rule === 'object') {
            const { validator, message } = rule;
            if (typeof validator === 'function') {
                return validator(value, values) ? null : message;
            }
        }

        return null;
    }, [validationRules, values]);

    // Función para validar todos los campos
    const validate = useCallback(() => {
        const newErrors = {};
        
        Object.keys(validationRules).forEach(name => {
            const error = validateField(name, values[name]);
            if (error) {
                newErrors[name] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [validationRules, values, validateField]);

    // Función para manejar cambios en inputs
    const handleChange = useCallback((event) => {
        const { name, value, type, checked } = event.target;
        const newValue = type === 'checkbox' ? checked : value;
        setValue(name, newValue);
    }, [setValue]);

    // Función para manejar blur en inputs
    const handleBlur = useCallback((event) => {
        const { name } = event.target;
        setTouched(name, true);
        
        const error = validateField(name, values[name]);
        if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    }, [validateField, values]);

    // Función para manejar envío del formulario
    const handleSubmit = useCallback((onSubmit) => {
        return async (event) => {
            if (event) {
                event.preventDefault();
            }

            setIsSubmitting(true);
            
            // Marcar todos los campos como tocados
            const allTouched = Object.keys(values).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setTouched(allTouched);

            // Validar formulario
            if (!validate()) {
                setIsSubmitting(false);
                return;
            }

            try {
                await onSubmit(values);
            } catch (error) {
                log('Form submission error:', error);
            } finally {
                setIsSubmitting(false);
            }
        };
    }, [values, validate]);

    // Función para resetear el formulario
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        setValue,
        setTouched,
        handleChange,
        handleBlur,
        handleSubmit,
        validate,
        reset,
    };
};

// Hook para estado de toggle
export const useToggle = (initialValue = false) => {
    const [value, setValue] = useState(initialValue);
    
    const toggle = useCallback(() => setValue(v => !v), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);
    
    return [value, toggle, setTrue, setFalse];
};

// Hook para contador
export const useCounter = (initialValue = 0) => {
    const [count, setCount] = useState(initialValue);
    
    const increment = useCallback(() => setCount(c => c + 1), []);
    const decrement = useCallback(() => setCount(c => c - 1), []);
    const reset = useCallback(() => setCount(initialValue), [initialValue]);
    const setValue = useCallback((value) => setCount(value), []);
    
    return {
        count,
        increment,
        decrement,
        reset,
        setValue,
    };
};

// Hook para copiar al portapapeles
export const useClipboard = () => {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef(null);

    const copy = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            
            // Limpiar el estado después de 2 segundos
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(() => {
                setCopied(false);
            }, 2000);
            
            return true;
        } catch (error) {
            log('Failed to copy to clipboard:', error);
            setCopied(false);
            return false;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return { copied, copy };
};

// Hook para detección de estado de red
export const useOnline = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};

// Hook para detección de tamaño de pantalla
export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        
        const handler = (event) => setMatches(event.matches);
        
        mediaQuery.addEventListener('change', handler);
        
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
};

// Hook para detección de dispositivo móvil
export const useIsMobile = () => {
    return useMediaQuery('(max-width: 768px)');
};

// Hook para intervalo
export const useInterval = (callback, delay) => {
    const savedCallback = useRef();

    // Recordar el último callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Configurar el intervalo
    useEffect(() => {
        const tick = () => {
            savedCallback.current();
        };
        
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};

// Hook para timeout
export const useTimeout = (callback, delay) => {
    const savedCallback = useRef();

    // Recordar el último callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Configurar el timeout
    useEffect(() => {
        const tick = () => {
            savedCallback.current();
        };
        
        if (delay !== null) {
            const id = setTimeout(tick, delay);
            return () => clearTimeout(id);
        }
    }, [delay]);
};

// Hook para estado de visibilidad de la página
export const usePageVisibility = () => {
    const [isVisible, setIsVisible] = useState(!document.hidden);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return isVisible;
};

// Hook para prevenir scroll
export const usePreventScroll = (isActive) => {
    useEffect(() => {
        if (isActive) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isActive]);
};

// Hook para API requests con cache
export const useApiCache = () => {
    const cache = useRef(new Map());

    const get = useCallback((key) => {
        return cache.current.get(key);
    }, []);

    const set = useCallback((key, data, ttl = 5 * 60 * 1000) => { // 5 minutos por defecto
        const expiryTime = Date.now() + ttl;
        cache.current.set(key, { data, expiryTime });
    }, []);

    const has = useCallback((key) => {
        const item = cache.current.get(key);
        if (!item) return false;
        
        if (Date.now() > item.expiryTime) {
            cache.current.delete(key);
            return false;
        }
        
        return true;
    }, []);

    const clear = useCallback(() => {
        cache.current.clear();
    }, []);

    return { get, set, has, clear };
};

// Exportar todos los hooks
export const globalHooks = {
    useLocalStorage,
    useDebounce,
    useClickOutside,
    useAsyncState,
    useForm,
    useToggle,
    useCounter,
    useClipboard,
    useOnline,
    useMediaQuery,
    useIsMobile,
    useInterval,
    useTimeout,
    usePageVisibility,
    usePreventScroll,
    useApiCache,
};

export default globalHooks;