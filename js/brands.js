/**
 * Módulo Brands (Marcas)
 * Placeholder para futuro desarrollo del módulo de gestión de marcas
 */

function BrandsPage() {
    const permissions = window.AuthHooks.usePermissions();
    
    if (!permissions.canManageBrands) {
        return React.createElement('div', {
            className: 'flex-1 bg-gray-50 overflow-auto p-8'
        },
            React.createElement('div', {
                className: 'card-base p-8 text-center max-w-md mx-auto'
            },
                React.createElement('div', {
                    className: 'text-4xl mb-4'
                }, '🔒'),
                React.createElement('h3', {
                    className: 'text-lg font-semibold text-gray-900 mb-2'
                }, 'Sin permisos'),
                React.createElement('p', {
                    className: 'text-gray-600'
                }, 'No tienes permisos para acceder al módulo de marcas')
            )
        );
    }

    return window.DashboardComponents.ComingSoon({ 
        module: 'Marcas', 
        icon: '🏪' 
    });
}

// Exportar componentes
window.BrandsComponents = {
    BrandsPage
};

UGCUtils.log('Brands module loaded successfully');