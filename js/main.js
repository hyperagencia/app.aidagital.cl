/**
 * App Principal
 * Punto de entrada y enrutador principal de la aplicación
 */

const { useState, useEffect } = React;

// Estado global de la aplicación
window.DashboardState = {};

// Componente principal de enrutamiento
function AppRouter() {
    const [currentPage, setCurrentPage] = useState(() => {
        // Restaurar página desde localStorage o usar dashboard por defecto
        return UGCUtils.storage.get('currentPage', 'dashboard');
    });

    // Guardar página actual en localStorage
    useEffect(() => {
        UGCUtils.storage.set('currentPage', currentPage);
        UGCUtils.log('Navigation:', currentPage);
    }, [currentPage]);

    // Exponer estado global
    window.DashboardState.currentPage = currentPage;
    window.DashboardState.setCurrentPage = setCurrentPage;

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return React.createElement(window.DashboardComponents.DashboardHome);
                
            case 'creators':
                return React.createElement(window.CreatorsComponents.CreatorsPage);
                
            case 'brands':
                return React.createElement(window.BrandsComponents.BrandsPage);
                
            case 'users':
                return window.DashboardComponents.ComingSoon({ 
                    module: 'Usuarios', 
                    icon: '⚙️' 
                });
                
            default:
                UGCUtils.log('Unknown page:', currentPage);
                setCurrentPage('dashboard');
                return React.createElement(window.DashboardComponents.DashboardHome);
        }
    };

    return React.createElement(window.DashboardComponents.DashboardLayout, {},
        renderPage()
    );
}

// Componente principal de la aplicación
function App() {
    const { user, loading, isAuthenticated } = window.AuthHooks.useAuth();

    useEffect(() => {
        // Ocultar loader inicial cuando React esté listo
        document.body.classList.add('app-loaded');
        UGCUtils.log('App initialized');
    }, []);

    // Mostrar loader mientras verifica autenticación
    if (loading) {
        return React.createElement(window.AuthComponents.AuthLoader);
    }

    // Mostrar login si no está autenticado
    if (!isAuthenticated) {
        return React.createElement(window.AuthComponents.LoginPage);
    }

    // Mostrar dashboard si está autenticado
    return React.createElement(AppRouter);
}

// Función para inicializar la aplicación
function initializeApp() {
    try {
        // Verificar que todos los módulos estén cargados
        const requiredModules = [
            'UGCUtils',
            'AuthComponents',
            'AuthHooks', 
            'DashboardComponents',
            'CreatorsComponents',
            'BrandsComponents'
        ];

        const missingModules = requiredModules.filter(module => !window[module]);
        
        if (missingModules.length > 0) {
            throw new Error(`Missing modules: ${missingModules.join(', ')}`);
        }

        // Crear la aplicación con provider de autenticación
        const AppWithAuth = React.createElement(
            window.AuthComponents.AuthProvider,
            {},
            React.createElement(App)
        );

        // Renderizar en el DOM
        const rootElement = document.getElementById('root');
        if (!rootElement) {
            throw new Error('Root element not found');
        }

        ReactDOM.render(AppWithAuth, rootElement);
        
        UGCUtils.log('Application started successfully');
        
        // Configurar manejo de errores globales
        window.addEventListener('unhandledrejection', (event) => {
            UGCUtils.handleError(event.reason, 'Unhandled promise rejection');
        });

    } catch (error) {
        console.error('Failed to initialize app:', error);
        
        // Mostrar error en el DOM si falla la inicialización
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.innerHTML = `
                <div style="
                    min-height: 100vh; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    background: #f9fafb;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                    <div style="
                        background: white; 
                        border-radius: 1rem; 
                        padding: 2rem; 
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        max-width: 400px;
                    ">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                        <h2 style="color: #1f2937; margin-bottom: 0.5rem;">Error de inicialización</h2>
                        <p style="color: #6b7280; margin-bottom: 1rem;">
                            No se pudo cargar la aplicación correctamente.
                        </p>
                        <button 
                            onclick="window.location.reload()" 
                            style="
                                background: #9333ea; 
                                color: white; 
                                border: none; 
                                padding: 0.75rem 1.5rem; 
                                border-radius: 0.5rem; 
                                cursor: pointer;
                                font-weight: 500;
                            "
                        >
                            Recargar página
                        </button>
                        <details style="margin-top: 1rem; text-align: left;">
                            <summary style="cursor: pointer; color: #6b7280;">Detalles del error</summary>
                            <pre style="
                                background: #f3f4f6; 
                                padding: 1rem; 
                                border-radius: 0.5rem; 
                                font-size: 0.75rem; 
                                margin-top: 0.5rem;
                                overflow: auto;
                            ">${error.message}</pre>
                        </details>
                    </div>
                </div>
            `;
        }
    }
}

// Función para manejar navegación por URL (futuro)
function handleRouting() {
    // Esta función se puede usar en el futuro para manejar rutas con history API
    const path = window.location.pathname;
    const routes = {
        '/': 'dashboard',
        '/dashboard': 'dashboard',
        '/creators': 'creators',
        '/brands': 'brands',
        '/users': 'users'
    };
    
    const page = routes[path] || 'dashboard';
    if (window.DashboardState?.setCurrentPage) {
        window.DashboardState.setCurrentPage(page);
    }
}

// Función de utilidad para navegación programática
window.navigateTo = (page) => {
    if (window.DashboardState?.setCurrentPage) {
        window.DashboardState.setCurrentPage(page);
        UGCUtils.log('Navigated to:', page);
    }
};

// Función para reiniciar la aplicación
window.restartApp = () => {
    UGCUtils.storage.remove('currentPage');
    UGCUtils.storage.remove('authToken');
    window.location.reload();
};

// Información de la aplicación para debugging
window.AppInfo = {
    version: window.UGCConfig.APP_VERSION,
    modules: [
        'UGCUtils',
        'AuthComponents', 
        'AuthHooks',
        'DashboardComponents',
        'CreatorsComponents', 
        'BrandsComponents'
    ],
    getCurrentPage: () => window.DashboardState?.currentPage,
    getUser: () => {
        try {
            return window.AuthHooks?.useAuth?.()?.user;
        } catch {
            return null;
        }
    },
    debug: {
        enableDebug: () => {
            window.UGCConfig.DEBUG = true;
            UGCUtils.log('Debug mode enabled');
        },
        disableDebug: () => {
            window.UGCConfig.DEBUG = false;
            console.log('Debug mode disabled');
        },
        clearStorage: () => {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('ugc_')) {
                    localStorage.removeItem(key);
                }
            });
            UGCUtils.log('UGC storage cleared');
        },
        exportLogs: () => {
            // En el futuro se pueden exportar logs para debugging
            console.log('Logs export feature coming soon');
        }
    }
};

// Event listeners para el ciclo de vida de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    UGCUtils.log('DOM loaded, initializing app...');
    
    // Pequeño delay para asegurar que todos los scripts se carguen
    setTimeout(initializeApp, 100);
});

// Manejar visibilidad de la página
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        UGCUtils.log('App became visible');
        // Aquí se pueden refrescar datos si es necesario
    }
});

// Manejar eventos de red (online/offline)
window.addEventListener('online', () => {
    UGCUtils.log('App is online');
    // Aquí se pueden sincronizar datos pendientes
});

window.addEventListener('offline', () => {
    UGCUtils.log('App is offline');
    // Aquí se puede mostrar un mensaje de sin conexión
});

// Prevenir recarga accidental en desarrollo
window.addEventListener('beforeunload', (event) => {
    if (window.UGCConfig.DEBUG) {
        // Solo en desarrollo
        event.preventDefault();
        event.returnValue = '¿Estás seguro de que quieres recargar la página?';
    }
});

// Exportar función principal
window.initializeApp = initializeApp;

UGCUtils.log('Main module loaded successfully');