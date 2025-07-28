/**
 * Punto de Entrada Principal
 * Inicializa y renderiza la aplicación React
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { config, log, logError } from './services/config.js';

// Importar estilos globales
import './styles/globals.css';

// Función principal de inicialización
const initializeApp = () => {
    try {
        // Verificar soporte del navegador
        if (!window.React && typeof React === 'undefined') {
            throw new Error('React no está disponible');
        }

        // Configurar entorno
        log(`Starting ${config.APP_NAME} v${config.APP_VERSION}`);
        log(`Environment: ${config.NODE_ENV}`);
        log(`Debug mode: ${config.DEBUG ? 'enabled' : 'disabled'}`);

        // Verificar elemento root
        const rootElement = document.getElementById('root');
        if (!rootElement) {
            throw new Error('Root element not found');
        }

        // Crear root de React 18
        const root = ReactDOM.createRoot(rootElement);

        // Renderizar aplicación
        root.render(
            React.createElement(
                config.IS_DEVELOPMENT ? React.StrictMode : React.Fragment,
                {},
                React.createElement(App)
            )
        );

        log('Application rendered successfully');

        // Configurar manejo global de errores
        setupGlobalErrorHandling();

        // Configurar eventos del ciclo de vida
        setupLifecycleEvents();

        // Ocultar loader inicial después de un pequeño delay
        setTimeout(() => {
            const loader = document.getElementById('initial-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 300);
            }
        }, 500);

    } catch (error) {
        handleInitializationError(error);
    }
};

// Configurar manejo global de errores
const setupGlobalErrorHandling = () => {
    // Errores de JavaScript
    window.addEventListener('error', (event) => {
        logError(event.error, 'Global JavaScript error');
        
        if (config.IS_PRODUCTION) {
            // En producción, enviar a servicio de logging
            sendErrorToService({
                type: 'javascript_error',
                message: event.error?.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString(),
            });
        }
    });

    // Promesas rechazadas no manejadas
    window.addEventListener('unhandledrejection', (event) => {
        logError(event.reason, 'Unhandled promise rejection');
        
        if (config.IS_PRODUCTION) {
            sendErrorToService({
                type: 'unhandled_rejection',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString(),
            });
        }
    });

    // Errores de recursos (imágenes, scripts, etc.)
    window.addEventListener('error', (event) => {
        if (event.target !== window) {
            logError(new Error(`Resource failed to load: ${event.target.src || event.target.href}`), 'Resource error');
        }
    }, true);
};

// Configurar eventos del ciclo de vida
const setupLifecycleEvents = () => {
    // Evento cuando la página se vuelve visible/invisible
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            log('App became visible');
            // Aquí se podrían refrescar datos si es necesario
        } else {
            log('App became hidden');
        }
    });

    // Eventos de conexión online/offline
    window.addEventListener('online', () => {
        log('App is online');
        // Mostrar notificación de reconexión
        showNetworkStatus('online');
    });

    window.addEventListener('offline', () => {
        log('App is offline');
        // Mostrar notificación de desconexión
        showNetworkStatus('offline');
    });

    // Evento antes de cerrar/recargar la página
    window.addEventListener('beforeunload', (event) => {
        // Solo en desarrollo o si hay cambios sin guardar
        if (config.IS_DEVELOPMENT) {
            // Opcional: mostrar confirmación en desarrollo
            // event.preventDefault();
            // event.returnValue = '¿Estás seguro de que quieres salir?';
        }
    });

    // Redimensionamiento de ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            log('Window resized:', window.innerWidth, 'x', window.innerHeight);
        }, 250);
    });
};

// Mostrar estado de la red
const showNetworkStatus = (status) => {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `
        fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium
        ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}
        transition-all duration-300 transform translate-x-full
    `;
    notification.textContent = status === 'online' 
        ? '🟢 Conexión restaurada' 
        : '🔴 Sin conexión a internet';
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
};

// Enviar errores a servicio de logging (placeholder)
const sendErrorToService = (errorData) => {
    // En producción, aquí enviarías los errores a un servicio como Sentry, LogRocket, etc.
    if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track('error', errorData);
    }
    
    // También podrías enviar a tu propio endpoint
    fetch('/api/errors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
    }).catch(() => {
        // Ignorar errores al enviar errores
    });
};

// Manejar errores de inicialización
const handleInitializationError = (error) => {
    console.error('[Initialization Error]:', error);
    
    // Mostrar error en el DOM
    const rootElement = document.getElementById('root') || document.body;
    rootElement.innerHTML = `
        <div style="
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: #f9fafb;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
        ">
            <div style="
                background: white; 
                border-radius: 12px; 
                padding: 32px; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
                width: 100%;
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h2 style="color: #1f2937; margin-bottom: 8px; font-size: 20px; font-weight: 600;">
                    Error de Inicialización
                </h2>
                <p style="color: #6b7280; margin-bottom: 16px; font-size: 14px;">
                    No se pudo cargar la aplicación correctamente.
                </p>
                <button 
                    onclick="window.location.reload()" 
                    style="
                        background: #9333ea; 
                        color: white; 
                        border: none; 
                        padding: 12px 24px; 
                        border-radius: 8px; 
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 14px;
                        width: 100%;
                        margin-bottom: 12px;
                    "
                >
                    Recargar Página
                </button>
                ${config.DEBUG ? `
                    <details style="margin-top: 16px; text-align: left;">
                        <summary style="cursor: pointer; color: #6b7280; font-size: 12px;">
                            Detalles del error
                        </summary>
                        <pre style="
                            background: #f3f4f6; 
                            padding: 12px; 
                            border-radius: 6px; 
                            font-size: 10px; 
                            margin-top: 8px;
                            overflow: auto;
                            white-space: pre-wrap;
                        ">${error.message}\n\n${error.stack || ''}</pre>
                    </details>
                ` : ''}
            </div>
        </div>
    `;
    
    // Ocultar loader inicial si existe
    const loader = document.getElementById('initial-loader');
    if (loader) {
        loader.style.display = 'none';
    }
};

// Verificar compatibilidad del navegador
const checkBrowserCompatibility = () => {
    const requiredFeatures = [
        'Promise',
        'fetch',
        'localStorage',
        'addEventListener',
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => !(feature in window));
    
    if (missingFeatures.length > 0) {
        throw new Error(`Browser not supported. Missing features: ${missingFeatures.join(', ')}`);
    }
    
    // Verificar versión de ES6+
    try {
        eval('const test = () => {}; class Test {}');
    } catch (e) {
        throw new Error('Browser does not support ES6+ features');
    }
};

// Función principal
const main = () => {
    try {
        // Verificar compatibilidad
        checkBrowserCompatibility();
        
        // Inicializar aplicación
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
        
    } catch (error) {
        handleInitializationError(error);
    }
};

// Ejecutar función principal
main();

// Exportar funciones para testing (si es necesario)
if (config.IS_DEVELOPMENT) {
    window.__app__ = {
        reinitialize: initializeApp,
        version: config.APP_VERSION,
        config: config,
    };
}