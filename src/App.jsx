/**
 * Componente Principal de la Aplicación
 * Punto de entrada y configuración global
 */

import React, { useEffect, useState } from 'react';
import { AuthProvider } from './modules/auth/context/AuthContext.jsx';
import { LoginForm, AuthLoader } from './modules/auth/components/index.js';
import { useAuth } from './modules/auth/hooks/index.js';
import { AppRouter } from './router.jsx';
import { Layout } from './components/layout/index.js';
import { Sidebar } from './components/layout/index.js';
import { UI } from './components/ui/index.js';
import { config, log } from './services/config.js';
import { storage } from './services/storage.js';

// Componente de manejo de errores globales
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            errorInfo: null 
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });
        
        // Log del error
        console.error('[App Error Boundary]:', error, errorInfo);
        
        // En producción, aquí podrías enviar el error a un servicio de logging
        if (config.IS_PRODUCTION && window.analytics) {
            window.analytics.track('error', {
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <UI.Card className="p-8 text-center max-w-md">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Error inesperado
                        </h2>
                        <p className="text-gray-600 mb-4">
                            La aplicación ha encontrado un error inesperado.
                        </p>
                        <div className="space-y-3">
                            <UI.Button
                                variant="primary"
                                onClick={() => window.location.reload()}
                                className="w-full"
                            >
                                Recargar Aplicación
                            </UI.Button>
                            {config.DEBUG && (
                                <details className="text-left">
                                    <summary className="cursor-pointer text-sm text-gray-500">
                                        Detalles del error
                                    </summary>
                                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                        {this.state.error && this.state.error.toString()}
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </UI.Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Componente principal del router con layout
const AppContent = () => {
    const { user, loading, isAuthenticated } = useAuth();
    const [currentPage, setCurrentPage] = useState(() => {
        return storage.get('currentPage', 'dashboard');
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Actualizar página en localStorage
    useEffect(() => {
        storage.set('currentPage', currentPage);
    }, [currentPage]);

    // Manejar navegación
    const handleNavigate = (page) => {
        setCurrentPage(page);
        setIsMobileMenuOpen(false);
        log('Navigated to:', page);
    };

    // Importar páginas dinámicamente
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return React.createElement(
                    React.lazy(() => 
                        import('./modules/dashboard/components/index.js').then(module => ({
                            default: module.DashboardPage
                        }))
                    ),
                    { onNavigate: handleNavigate }
                );
                
            case 'creators':
                return React.createElement(
                    React.lazy(() => 
                        import('./modules/creators/components/index.js').then(module => ({
                            default: module.CreatorsPage
                        }))
                    )
                );
                
            case 'brands':
                return React.createElement(
                    React.lazy(() => 
                        import('./modules/brands/components/index.js').then(module => ({
                            default: module.BrandsPage
                        }))
                    )
                );
                
            case 'users':
                const { ComingSoon } = require('./modules/brands/components/index.js');
                return React.createElement(ComingSoon, { 
                    module: 'Usuarios', 
                    icon: '⚙️' 
                });
                
            default:
                log('Unknown page:', currentPage);
                setCurrentPage('dashboard');
                return null;
        }
    };

    // Mostrar loader mientras verifica autenticación
    if (loading) {
        return React.createElement(AuthLoader);
    }

    // Mostrar login si no está autenticado
    if (!isAuthenticated) {
        return React.createElement(LoginForm);
    }

    // Mostrar aplicación principal
    return (
        <>
            {/* Indicador de modo desarrollo */}
            {config.IS_DEVELOPMENT && (
                <div style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                }}>
                    🚧 MODO DESARROLLO
                </div>
            )}
            
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar
                    currentPage={currentPage}
                    onNavigate={handleNavigate}
                    isMobileOpen={isMobileMenuOpen}
                    onMobileClose={() => setIsMobileMenuOpen(false)}
                />
                
                {/* Contenido principal */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header móvil */}
                    <div className="md:hidden bg-white border-b border-gray-200 p-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <span className="text-xl">☰</span>
                        </button>
                    </div>
                    
                    {/* Contenido de la página */}
                    <main className="flex-1 overflow-auto">
                        <React.Suspense 
                            fallback={
                                <div className="flex-1 bg-gray-50 overflow-auto p-8">
                                    <div className="flex items-center justify-center min-h-96">
                                        <div className="text-center">
                                            <UI.Spinner size="xl" className="mx-auto mb-4" />
                                            <p className="text-gray-600">Cargando...</p>
                                        </div>
                                    </div>
                                </div>
                            }
                        >
                            {renderPage()}
                        </React.Suspense>
                    </main>
                </div>
            </div>
        </>
    );
};

// Componente de configuración inicial
const AppInitializer = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                log('Initializing application...');
                
                // Configurar manejo de errores globales
                window.addEventListener('unhandledrejection', (event) => {
                    console.error('[Unhandled Promise Rejection]:', event.reason);
                });

                // Limpiar loader inicial
                const initialLoader = document.getElementById('initial-loader');
                if (initialLoader) {
                    initialLoader.style.display = 'none';
                }

                // Agregar clase para indicar que la app está cargada
                document.body.classList.add('app-loaded');

                // Configurar título de la página
                document.title = `${config.APP_NAME} - ${config.COMPANY_NAME}`;

                // Inicializar configuraciones adicionales
                await new Promise(resolve => setTimeout(resolve, 100)); // Simular inicialización

                setIsInitialized(true);
                log('Application initialized successfully');
                
            } catch (error) {
                console.error('[App Initialization Error]:', error);
                setInitError(error.message);
            }
        };

        initializeApp();
    }, []);

    if (initError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <UI.Card className="p-8 text-center max-w-md">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Error de Inicialización
                    </h2>
                    <p className="text-gray-600 mb-4">
                        No se pudo inicializar la aplicación correctamente.
                    </p>
                    <UI.Button
                        variant="primary"
                        onClick={() => window.location.reload()}
                        className="w-full"
                    >
                        Recargar Página
                    </UI.Button>
                    {config.DEBUG && (
                        <details className="mt-4 text-left">
                            <summary className="cursor-pointer text-sm text-gray-500">
                                Detalles del error
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {initError}
                            </pre>
                        </details>
                    )}
                </UI.Card>
            </div>
        );
    }

    if (!isInitialized) {
        return React.createElement(AuthLoader);
    }

    return children;
};

// Componente principal de la aplicación
const App = () => {
    return (
        <ErrorBoundary>
            <AppInitializer>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </AppInitializer>
        </ErrorBoundary>
    );
};

// Información para debugging
window.AppInfo = {
    version: config.APP_VERSION,
    environment: config.NODE_ENV,
    debug: config.DEBUG,
    features: config.FEATURES,
    
    // Métodos utilitarios
    navigate: (page) => {
        const event = new CustomEvent('navigate', { detail: { page } });
        window.dispatchEvent(event);
    },
    
    clearStorage: () => {
        storage.clear();
        console.log('Storage cleared');
    },
    
    getCurrentUser: () => {
        return storage.get('authToken') ? 'Authenticated' : 'Not authenticated';
    },
    
    restart: () => {
        storage.clear();
        window.location.reload();
    }
};

// Exportar componente principal
export default App;