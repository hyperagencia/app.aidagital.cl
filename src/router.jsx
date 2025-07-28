/**
 * Router Principal de la Aplicación
 * Maneja la navegación y renderizado de páginas
 */

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from './modules/auth/components/index.js';
import { Layout, PageLoader, PageError } from './components/layout/index.js';
import { storage } from './services/storage.js';
import { log } from './services/config.js';

// Importar páginas dinámicamente
const DashboardPage = React.lazy(() => 
    import('./modules/dashboard/components/index.js').then(module => ({
        default: module.DashboardPage
    }))
);

const CreatorsPage = React.lazy(() => 
    import('./modules/creators/components/index.js').then(module => ({
        default: module.CreatorsPage
    }))
);

const BrandsPage = React.lazy(() => 
    import('./modules/brands/components/index.js').then(module => ({
        default: module.BrandsPage
    }))
);

// Placeholder para Users (módulo futuro)
const UsersPage = React.lazy(() => 
    Promise.resolve({
        default: () => {
            const { ComingSoon } = require('./modules/brands/components/index.js');
            return React.createElement(ComingSoon, { 
                module: 'Usuarios', 
                icon: '⚙️' 
            });
        }
    })
);

// Configuración de rutas
const routes = {
    dashboard: {
        component: DashboardPage,
        title: 'Dashboard',
        subtitle: 'Resumen de actividad y estadísticas',
        requireAuth: true,
        requireAdmin: false,
    },
    creators: {
        component: CreatorsPage,
        title: 'Creators',
        subtitle: 'Gestiona tu base de creators registrados',
        requireAuth: true,
        requireAdmin: false,
    },
    brands: {
        component: BrandsPage,
        title: 'Marcas',
        subtitle: 'Administra las marcas cliente',
        requireAuth: true,
        requireAdmin: true,
    },
    users: {
        component: UsersPage,
        title: 'Usuarios',
        subtitle: 'Gestión de usuarios del sistema',
        requireAuth: true,
        requireAdmin: true,
    },
};

// Hook para manejo de rutas
const useRouter = () => {
    const [currentRoute, setCurrentRoute] = useState(() => {
        // Restaurar ruta desde localStorage o usar dashboard por defecto
        return storage.get('currentRoute', 'dashboard');
    });

    // Guardar ruta actual en localStorage
    useEffect(() => {
        storage.set('currentRoute', currentRoute);
        log('Navigation:', currentRoute);
    }, [currentRoute]);

    const navigate = (route) => {
        if (routes[route]) {
            setCurrentRoute(route);
        } else {
            log('Unknown route:', route);
            setCurrentRoute('dashboard');
        }
    };

    // Función para obtener ruta actual
    const getCurrentRoute = () => routes[currentRoute];

    // Función para verificar si una ruta existe
    const routeExists = (route) => !!routes[route];

    return {
        currentRoute,
        navigate,
        getCurrentRoute,
        routeExists,
        routes,
    };
};

// Componente de manejo de errores de Suspense
const SuspenseErrorBoundary = ({ children, fallback }) => {
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
        setHasError(false);
    }, [children]);

    if (hasError) {
        return (
            <PageError
                title="Error al cargar la página"
                message="No se pudo cargar el módulo solicitado"
                onRetry={() => setHasError(false)}
            />
        );
    }

    return (
        <React.Suspense 
            fallback={fallback}
            onError={() => setHasError(true)}
        >
            {children}
        </React.Suspense>
    );
};

// Componente principal del router
export const AppRouter = () => {
    const { currentRoute, navigate, getCurrentRoute } = useRouter();
    const route = getCurrentRoute();

    if (!route) {
        return (
            <PageError
                title="Página no encontrada"
                message="La página solicitada no existe"
                onRetry={() => navigate('dashboard')}
            />
        );
    }

    const PageComponent = route.component;

    return (
        <ProtectedRoute requireAdmin={route.requireAdmin}>
            <Layout>
                <SuspenseErrorBoundary 
                    fallback={<PageLoader message={`Cargando ${route.title}...`} />}
                >
                    <PageComponent onNavigate={navigate} />
                </SuspenseErrorBoundary>
            </Layout>
        </ProtectedRoute>
    );
};

// Layout con Sidebar integrado
export const AppWithSidebar = () => {
    const { currentRoute, navigate, getCurrentRoute } = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const route = getCurrentRoute();

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleMobileMenuClose = () => {
        setIsMobileMenuOpen(false);
    };

    const handleNavigate = (newRoute) => {
        navigate(newRoute);
        setIsMobileMenuOpen(false); // Cerrar menú móvil al navegar
    };

    if (!route) {
        return (
            <PageError
                title="Página no encontrada"
                message="La página solicitada no existe"
                onRetry={() => navigate('dashboard')}
            />
        );
    }

    const PageComponent = route.component;

    return (
        <ProtectedRoute requireAdmin={route.requireAdmin}>
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar */}
                <div className="hidden md:flex md:flex-shrink-0">
                    <div className="flex flex-col w-72">
                        {/* Sidebar content se renderiza aquí */}
                        <nav className="flex-1 bg-white shadow-sm">
                            {/* El sidebar se maneja en el Layout component */}
                        </nav>
                    </div>
                </div>

                {/* Mobile sidebar overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={handleMobileMenuClose}
                    />
                )}

                {/* Main content */}
                <div className="flex-1 overflow-hidden">
                    <SuspenseErrorBoundary 
                        fallback={<PageLoader message={`Cargando ${route.title}...`} />}
                    >
                        <PageComponent 
                            onNavigate={handleNavigate}
                            currentRoute={currentRoute}
                            routeInfo={route}
                        />
                    </SuspenseErrorBoundary>
                </div>
            </div>
        </ProtectedRoute>
    );
};

// Hook exportado para usar el router en componentes
export const useAppRouter = () => {
    return useRouter();
};

// Función utilitaria para navegación programática
export const navigateTo = (route) => {
    // Esta función se puede usar globalmente
    const event = new CustomEvent('navigate', { detail: { route } });
    window.dispatchEvent(event);
};

// Función para obtener información de la ruta actual
export const getCurrentRouteInfo = () => {
    const currentRoute = storage.get('currentRoute', 'dashboard');
    return routes[currentRoute] || routes.dashboard;
};

// Función para verificar permisos de ruta
export const canAccessRoute = (route, user) => {
    const routeConfig = routes[route];
    if (!routeConfig) return false;
    
    if (routeConfig.requireAuth && !user) return false;
    if (routeConfig.requireAdmin && user?.role !== 'admin') return false;
    
    return true;
};

// Componente de enlace para navegación interna
export const AppLink = ({ 
    to, 
    children, 
    className = '', 
    activeClassName = '',
    ...props 
}) => {
    const { currentRoute, navigate } = useRouter();
    const isActive = currentRoute === to;
    
    const handleClick = (e) => {
        e.preventDefault();
        navigate(to);
    };
    
    const finalClassName = `${className} ${isActive ? activeClassName : ''}`.trim();
    
    return (
        <button
            onClick={handleClick}
            className={finalClassName}
            {...props}
        >
            {children}
        </button>
    );
};

// Función para manejo de rutas con historial del navegador (futuro)
export const setupBrowserHistory = () => {
    // Escuchar cambios en la URL del navegador
    window.addEventListener('popstate', (event) => {
        const path = window.location.pathname;
        const route = pathToRoute(path);
        
        if (route && routes[route]) {
            // Actualizar ruta sin recargar página
            storage.set('currentRoute', route);
            window.dispatchEvent(new CustomEvent('routechange', { 
                detail: { route } 
            }));
        }
    });
    
    // Escuchar eventos de navegación personalizada
    window.addEventListener('navigate', (event) => {
        const { route } = event.detail;
        if (routes[route]) {
            const path = routeToPath(route);
            window.history.pushState({ route }, '', path);
        }
    });
};

// Utilidades para conversión ruta <-> path
const routeToPath = (route) => {
    const paths = {
        dashboard: '/',
        creators: '/creators',
        brands: '/brands',
        users: '/users',
    };
    return paths[route] || '/';
};

const pathToRoute = (path) => {
    const routes = {
        '/': 'dashboard',
        '/creators': 'creators',
        '/brands': 'brands',
        '/users': 'users',
    };
    return routes[path] || 'dashboard';
};

export default AppRouter;