/**
 * Cliente API Base
 * Maneja todas las comunicaciones con el backend
 */

import { config } from './config.js';
import { storage } from './storage.js';

class ApiClient {
    constructor() {
        this.baseURL = config.API_BASE;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    // Obtener headers con autenticación
    getHeaders(customHeaders = {}) {
        const token = storage.get('authToken');
        const headers = { ...this.defaultHeaders, ...customHeaders };
        
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
        return headers;
    }

    // Método base para requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.headers),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error(`[API Error] ${endpoint}:`, error);
            throw error;
        }
    }

    // Métodos HTTP
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET',
        });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    // Método específico para upload de archivos
    async upload(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                // No incluir Content-Type para multipart/form-data
                ...this.getHeaders(),
                'Content-Type': undefined,
            },
        });
    }

    // Interceptor para manejar errores de autenticación
    setupAuthInterceptor(onUnauthorized) {
        const originalRequest = this.request.bind(this);
        
        this.request = async (endpoint, options = {}) => {
            try {
                return await originalRequest(endpoint, options);
            } catch (error) {
                if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    storage.remove('authToken');
                    if (onUnauthorized) {
                        onUnauthorized();
                    }
                }
                throw error;
            }
        };
    }
}

// Instancia singleton
export const apiClient = new ApiClient();

// Funciones de conveniencia
export const api = {
    get: (endpoint, params) => apiClient.get(endpoint, params),
    post: (endpoint, data) => apiClient.post(endpoint, data),
    put: (endpoint, data) => apiClient.put(endpoint, data),
    delete: (endpoint) => apiClient.delete(endpoint),
    upload: (endpoint, formData) => apiClient.upload(endpoint, formData),
    setAuthInterceptor: (callback) => apiClient.setupAuthInterceptor(callback),
};

export default api;