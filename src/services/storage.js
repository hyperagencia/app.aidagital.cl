/**
 * Servicio de Storage
 * Maneja localStorage con prefix y manejo de errores
 */

import { config, log, logError } from './config.js';

class StorageService {
    constructor(prefix = config.STORAGE_PREFIX) {
        this.prefix = prefix;
        this.isAvailable = this.checkAvailability();
    }

    // Verificar si localStorage está disponible
    checkAvailability() {
        try {
            const testKey = 'test_storage';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            logError(error, 'Storage availability check');
            return false;
        }
    }

    // Generar key con prefix
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    // Guardar item
    set(key, value) {
        if (!this.isAvailable) {
            log('Storage not available, skipping set operation');
            return false;
        }

        try {
            const serializedValue = JSON.stringify({
                value,
                timestamp: Date.now(),
                version: config.APP_VERSION,
            });
            
            localStorage.setItem(this.getKey(key), serializedValue);
            log(`Storage set: ${key}`);
            return true;
        } catch (error) {
            logError(error, `Storage set: ${key}`);
            return false;
        }
    }

    // Obtener item
    get(key, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(this.getKey(key));
            
            if (!item) {
                return defaultValue;
            }

            const parsedItem = JSON.parse(item);
            
            // Verificar si el item tiene la estructura esperada
            if (typeof parsedItem === 'object' && parsedItem.hasOwnProperty('value')) {
                return parsedItem.value;
            }
            
            // Fallback para items guardados en formato anterior
            return parsedItem;
        } catch (error) {
            logError(error, `Storage get: ${key}`);
            return defaultValue;
        }
    }

    // Obtener item con metadata
    getWithMetadata(key) {
        if (!this.isAvailable) {
            return null;
        }

        try {
            const item = localStorage.getItem(this.getKey(key));
            
            if (!item) {
                return null;
            }

            return JSON.parse(item);
        } catch (error) {
            logError(error, `Storage getWithMetadata: ${key}`);
            return null;
        }
    }

    // Eliminar item
    remove(key) {
        if (!this.isAvailable) {
            return false;
        }

        try {
            localStorage.removeItem(this.getKey(key));
            log(`Storage remove: ${key}`);
            return true;
        } catch (error) {
            logError(error, `Storage remove: ${key}`);
            return false;
        }
    }

    // Limpiar todos los items con el prefix
    clear() {
        if (!this.isAvailable) {
            return false;
        }

        try {
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            log(`Storage cleared: ${keysToRemove.length} items removed`);
            return true;
        } catch (error) {
            logError(error, 'Storage clear');
            return false;
        }
    }

    // Obtener todos los items con el prefix
    getAll() {
        if (!this.isAvailable) {
            return {};
        }

        try {
            const items = {};
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    const shortKey = key.replace(this.prefix, '');
                    items[shortKey] = this.get(shortKey);
                }
            }
            
            return items;
        } catch (error) {
            logError(error, 'Storage getAll');
            return {};
        }
    }

    // Verificar si un item existe
    has(key) {
        if (!this.isAvailable) {
            return false;
        }

        return localStorage.getItem(this.getKey(key)) !== null;
    }

    // Obtener el tamaño del storage usado
    getStorageSize() {
        if (!this.isAvailable) {
            return 0;
        }

        try {
            let totalSize = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    const value = localStorage.getItem(key);
                    totalSize += key.length + (value ? value.length : 0);
                }
            }
            
            return totalSize;
        } catch (error) {
            logError(error, 'Storage getStorageSize');
            return 0;
        }
    }

    // Limpiar items expirados (si se implementa TTL en el futuro)
    cleanExpired() {
        if (!this.isAvailable) {
            return 0;
        }

        try {
            let removedCount = 0;
            const now = Date.now();
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    try {
                        const item = JSON.parse(localStorage.getItem(key));
                        
                        // Si el item tiene TTL y está expirado
                        if (item.expiry && item.expiry < now) {
                            keysToRemove.push(key);
                        }
                    } catch (e) {
                        // Ignorar items que no se pueden parsear
                    }
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                removedCount++;
            });
            
            if (removedCount > 0) {
                log(`Storage cleanup: ${removedCount} expired items removed`);
            }
            
            return removedCount;
        } catch (error) {
            logError(error, 'Storage cleanExpired');
            return 0;
        }
    }

    // Exportar datos para backup
    export() {
        const data = this.getAll();
        return {
            data,
            timestamp: Date.now(),
            version: config.APP_VERSION,
        };
    }

    // Importar datos desde backup
    import(backup) {
        try {
            if (!backup.data || typeof backup.data !== 'object') {
                throw new Error('Invalid backup format');
            }

            let importedCount = 0;
            
            Object.entries(backup.data).forEach(([key, value]) => {
                if (this.set(key, value)) {
                    importedCount++;
                }
            });
            
            log(`Storage import: ${importedCount} items imported`);
            return importedCount;
        } catch (error) {
            logError(error, 'Storage import');
            return 0;
        }
    }
}

// Instancia singleton
export const storage = new StorageService();

// Funciones de conveniencia para tokens de auth
export const authStorage = {
    setToken: (token) => storage.set(config.AUTH_TOKEN_KEY, token),
    getToken: () => storage.get(config.AUTH_TOKEN_KEY),
    removeToken: () => storage.remove(config.AUTH_TOKEN_KEY),
    hasToken: () => storage.has(config.AUTH_TOKEN_KEY),
    
    setRefreshToken: (token) => storage.set(config.AUTH_REFRESH_KEY, token),
    getRefreshToken: () => storage.get(config.AUTH_REFRESH_KEY),
    removeRefreshToken: () => storage.remove(config.AUTH_REFRESH_KEY),
    
    clearAuth: () => {
        storage.remove(config.AUTH_TOKEN_KEY);
        storage.remove(config.AUTH_REFRESH_KEY);
    },
};

export default storage;