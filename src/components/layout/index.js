/**
 * Componentes de Layout
 * Sidebar, Header y Layout principal
 */

import React, { useState } from 'react';
import { useAuth, usePermissions } from '../../modules/auth/hooks/index.js';
import { UserInfo, UserDropdown } from '../../modules/auth/components/index.js';
import { UI } from '../ui/index.js';
import { config } from '../../services/config.js';

// Componente Sidebar
export const Sidebar = ({ 
    currentPage, 
    onNavigate, 
    isMobileOpen, 
    onMobileClose 
}) => {
    const { user } = useAuth();
    const permissions = usePermissions();

    // Menú de navegación
    const menuItems = [
        { 
            id: 'dashboard', 
            label: 'Dashboard',             
            alwaysShow: true 
        },
        { 
            id: 'creators', 
            label: 'Creators',  
            alwaysShow: true 
        },
        { 
            id: 'brands', 
            label: 'Marcas', 
            requiresPermission: 'canViewBrands' 
        },
        { 
            id: 'users', 
            label: 'Usuarios', 
            requiresPermission: 'canViewUsers' 
        },
    ];

    // Filtrar items visibles según permisos
    const visibleItems = menuItems.filter(item => {
        if (item.alwaysShow) return true;
        if (item.requiresPermission) {
            return permissions[item.requiresPermission];
        }
        return true;
    });

    const handleNavigation = (pageId) => {
        onNavigate?.(pageId);
        onMobileClose?.();
    };

    return (
        <>
            {/* Overlay móvil */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50
                w-72 bg-white shadow-xl
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                flex flex-col h-full
            `}>
                {/* Header del sidebar */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                            UGC Creators
                        </h2>
                        <button
                            onClick={onMobileClose}
                            className="md:hidden text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {config.COMPANY_NAME}
                    </p>
                </div>
                
                {/* Saludo personalizado */}
                <div className="p-6">
                    <div className="flex items-center space-x-3">
                        <UserInfo size="md" />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Bienvenido de nuevo
                    </p>
                </div>
                
                {/* Menú de navegación */}
                <nav className="flex-1 px-4 space-y-2">
                    {visibleItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigation(item.id)}
                            className={`
                                w-full text-left px-4 py-3 rounded-xl font-medium
                                transition-all duration-200 flex items-center space-x-3
                                ${currentPage === item.id 
                                    ? 'bg-purple-100 text-purple-700 shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                
                {/* Footer del sidebar */}
                <div className="p-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 text-center">
                        v{config.APP_VERSION}
                    </div>
                </div>
            </div>
        </>
    );
};

// Componente Header
export const Header = ({ 
    title, 
    subtitle,
    onMenuToggle,
    actions 
}) => {
    const { logout } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center space-x-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuToggle}
                        className="md:hidden text-gray-600 hover:text-gray-900 p-2"
                    >
                        <span className="text-xl">☰</span>
                    </button>
                    
                    {/* Title */}
                    <div>
                        {title && (
                            <h1 className="text-xl font-semibold text-gray-900">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-600">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                    {/* Actions personalizadas */}
                    {actions && (
                        <div className="flex items-center space-x-2">
                            {actions}
                        </div>
                    )}
                    
                    {/* User dropdown */}
                    <UserDropdown onLogout={logout} />
                </div>
            </div>
        </header>
    );
};

// Componente de navegación breadcrumb
export const Breadcrumb = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span className="text-gray-400">/</span>
                    )}
                    {item.href ? (
                        <button
                            onClick={() => item.onClick?.()}
                            className="hover:text-gray-900 transition-colors"
                        >
                            {item.label}
                        </button>
                    ) : (
                        <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

// Componente de contenedor de página
export const PageContainer = ({ 
    children, 
    title, 
    subtitle,
    breadcrumb,
    actions,
    maxWidth = '7xl' 
}) => {
    const maxWidthClasses = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        'full': 'max-w-full',
    };

    return (
        <div className="flex-1 bg-gray-50 overflow-auto">
            <div className={`p-8 ${maxWidthClasses[maxWidth] || maxWidthClasses['7xl']}`}>
                {/* Breadcrumb */}
                {breadcrumb && <Breadcrumb items={breadcrumb} />}
                
                {/* Header */}
                {(title || subtitle || actions) && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                        <div>
                            {title && (
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-gray-600">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        
                        {actions && (
                            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                                {actions}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Content */}
                {children}
            </div>
        </div>
    );
};

// Layout principal
export const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');

    const handleNavigate = (page) => {
        setCurrentPage(page);
        // Aquí podrías integrar con react-router
        console.log('Navigate to:', page);
    };

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleMobileMenuClose = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={handleMobileMenuClose}
            />
            
            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header
                    onMenuToggle={handleMobileMenuToggle}
                />
                
                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

// Componente de estado de carga para páginas
export const PageLoader = ({ message = 'Cargando...' }) => {
    return (
        <div className="flex-1 bg-gray-50 overflow-auto">
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <UI.Spinner size="xl" className="mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {message}
                    </h3>
                    <p className="text-gray-600">
                        Un momento por favor...
                    </p>
                </div>
            </div>
        </div>
    );
};

// Componente de error para páginas
export const PageError = ({ 
    title = 'Error inesperado',
    message = 'Ha ocurrido un error al cargar la página',
    onRetry,
    showRetry = true 
}) => {
    return (
        <div className="flex-1 bg-gray-50 overflow-auto">
            <div className="flex items-center justify-center min-h-96">
                <UI.Card className="p-8 text-center max-w-md">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>
                    {showRetry && onRetry && (
                        <UI.Button
                            variant="primary"
                            onClick={onRetry}
                        >
                            Reintentar
                        </UI.Button>
                    )}
                </UI.Card>
            </div>
        </div>
    );
};

// Exportar todos los componentes
export const layoutComponents = {
    Sidebar,
    Header,
    Breadcrumb,
    PageContainer,
    Layout,
    PageLoader,
    PageError,
};

export default layoutComponents;