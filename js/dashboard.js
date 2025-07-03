/**
 * Módulo Dashboard Principal
 * Maneja el layout, navegación y estadísticas principales
 */

const { useState, useEffect } = React;

// Componente Sidebar
function Sidebar({ currentPage, setCurrentPage, isMobileOpen, setIsMobileOpen }) {
    const { user, logout } = window.AuthHooks.useAuth();
    const permissions = window.AuthHooks.usePermissions();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', alwaysShow: true },
        { id: 'creators', label: 'Creators', icon: '👥', alwaysShow: true },
        { id: 'brands', label: 'Marcas', icon: '🏪', requiresAdmin: true },
        { id: 'users', label: 'Usuarios', icon: '⚙️', requiresAdmin: true }
    ];

    const visibleItems = menuItems.filter(item => 
        item.alwaysShow || (item.requiresAdmin && permissions.canCreateUsers)
    );

    const handleNavigation = (pageId) => {
        setCurrentPage(pageId);
        if (setIsMobileOpen) {
            setIsMobileOpen(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        if (setIsMobileOpen) {
            setIsMobileOpen(false);
        }
    };

    return React.createElement('div', {
        className: `w-72 bg-white sidebar-shadow h-screen flex flex-col ${isMobileOpen ? 'open' : ''}`
    },
        // Header del sidebar
        React.createElement('div', {
            className: 'p-8 border-b border-gray-100'
        },
            React.createElement('h2', {
                className: 'text-xl font-bold text-gray-900'
            }, 'UGC Creators AIDA'),
            React.createElement('div', {
                className: 'flex items-center justify-between mt-3'
            },
                React.createElement('span', {
                    className: 'text-sm text-gray-600'
                }, user?.name?.split(' ')[0] || 'Usuario'),
                React.createElement('span', {
                    className: 'text-sm text-gray-400'
                }, user?.email)
            )
        ),
        
        // Saludo personalizado
        React.createElement('div', {
            className: 'p-8'
        },
            React.createElement('h3', {
                className: 'text-lg font-semibold text-gray-900 mb-1'
            }, `¡Hola, ${user?.name?.split(' ')[0] || 'Usuario'}!`),
            React.createElement('p', {
                className: 'text-sm text-gray-600 mb-1'
            }, 'Bienvenido de nuevo.'),
            React.createElement('p', {
                className: 'text-xs text-gray-400 mt-3'
            }, 'AIDA Digital Marketing')
        ),
        
        // Menú de navegación
        React.createElement('nav', {
            className: 'flex-1 px-6 space-y-3'
        },
            visibleItems.map(item => 
                React.createElement('button', {
                    key: item.id,
                    onClick: () => handleNavigation(item.id),
                    className: `w-full text-left px-6 py-4 rounded-2xl font-medium transition-all duration-200 ${
                        currentPage === item.id 
                            ? 'bg-purple-100 text-purple-700 shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                }, item.label)
            )
        ),
        
        // Logout
        React.createElement('div', {
            className: 'p-6 border-t border-gray-100'
        },
            React.createElement('button', {
                onClick: handleLogout,
                className: 'w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl hover:bg-gray-200 transition-colors text-center font-medium'
            }, 'Cerrar sesión')
        )
    );
}

// Componente de estadísticas principales
function DashboardStats() {
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        today: 0,
        platforms: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await UGCUtils.apiRequest(`${window.UGCConfig.API_BASE}/creators.php`);
            
            if (data.success) {
                const creators = data.data.creators;
                const now = new Date();
                const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                // Calcular estadísticas
                const total = creators.length;
                const thisMonthCount = creators.filter(c => new Date(c.created_at) >= thisMonth).length;
                const todayCount = creators.filter(c => new Date(c.created_at) >= today).length;

                // Contar plataformas
                const platformCounts = {};
                creators.forEach(creator => {
                    if (creator.platforms) {
                        creator.platforms.forEach(platform => {
                            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
                        });
                    }
                });

                setStats({
                    total,
                    thisMonth: thisMonthCount,
                    today: todayCount,
                    platforms: platformCounts
                });

                UGCUtils.log('Stats loaded:', { total, thisMonthCount, todayCount, platformCounts });
            }
        } catch (error) {
            UGCUtils.handleError(error, 'Fetching stats');
        }
        setLoading(false);
    };

    const StatCard = ({ title, value, bgColor, textColor, buttonText = "Ver detalles", onClick }) => (
        React.createElement('div', {
            className: `${bgColor} rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1`,
            onClick
        },
            // Número grande
            React.createElement('div', {
                className: `text-7xl font-bold ${textColor} mb-4 leading-none`
            }, loading ? '...' : value),
            
            // Título
            React.createElement('h3', {
                className: `text-lg font-semibold ${textColor} mb-6 leading-tight`
            }, title),
            
            // Botón
            React.createElement('button', {
                className: `px-6 py-3 bg-white bg-opacity-20 ${textColor} rounded-full hover:bg-opacity-30 transition-all duration-200 font-medium backdrop-blur-sm`
            }, buttonText)
        )
    );

    const PlatformCard = ({ platform, count, color = "text-purple-400" }) => (
        React.createElement('div', {
            className: 'flex items-center justify-between py-4'
        },
            React.createElement('span', {
                className: 'text-lg font-medium text-gray-900'
            }, platform),
            React.createElement('span', {
                className: `text-3xl font-bold ${color}`
            }, loading ? '...' : count)
        )
    );

    return React.createElement('div', {
        className: 'space-y-8'
    },
        // Cards de estadísticas principales
        React.createElement('div', {
            className: 'grid grid-cols-1 md:grid-cols-3 gap-8'
        },
            // Card 1 - Total creators
            React.createElement(StatCard, {
                title: 'Creators registrados en la plataforma',
                value: stats.total,
                bgColor: 'bg-white border border-gray-100',
                textColor: 'text-gray-400',
                buttonText: 'Ver creators'
            }),
            
            // Card 2 - Este mes
            React.createElement(StatCard, {
                title: 'Registros en el último mes',
                value: stats.thisMonth,
                bgColor: 'bg-gradient-to-br from-purple-400 to-purple-500',
                textColor: 'text-white',
                buttonText: 'Ver detalles'
            }),
            
            // Card 3 - Últimas 24h
            React.createElement(StatCard, {
                title: 'Registros en las últimas 24 hrs',
                value: stats.today,
                bgColor: 'bg-white border border-gray-100',
                textColor: 'text-black',
                buttonText: 'Ver detalles'
            })
        ),

        // Distribución por plataformas
        React.createElement('div', {
            className: 'bg-white rounded-3xl p-8 shadow-sm border border-gray-100'
        },
            React.createElement('h3', {
                className: 'text-2xl font-bold text-gray-900 mb-8'
            }, 'Distribución por Plataformas'),
            
            React.createElement('div', {
                className: 'space-y-1'
            },
                // Instagram
                React.createElement(PlatformCard, {
                    platform: 'Instagram',
                    count: stats.platforms.instagram || 0
                }),
                
                React.createElement('hr', {
                    className: 'border-gray-100'
                }),
                
                // TikTok
                React.createElement(PlatformCard, {
                    platform: 'TikTok',
                    count: stats.platforms.tiktok || 0
                }),
                
                React.createElement('hr', {
                    className: 'border-gray-100'
                }),
                
                // Otras redes
                React.createElement(PlatformCard, {
                    platform: 'Otras redes',
                    count: stats.platforms.otra || 0
                })
            )
        )
    );
}

// Página principal del dashboard
function DashboardHome() {
    return React.createElement('div', {
        className: 'flex-1 bg-gray-50 overflow-auto'
    },
        React.createElement('div', {
            className: 'p-8 max-w-7xl'
        },
            // Header principal
            React.createElement('div', {
                className: 'mb-10'
            },
                React.createElement('h1', {
                    className: 'text-4xl font-bold text-gray-900 mb-3 leading-tight'
                }, 'Mira lo que está pasando con tus Creators'),
                React.createElement('p', {
                    className: 'text-lg text-gray-600'
                }, 'Resumen de actividad y estadísticas principales')
            ),

            // Estadísticas
            React.createElement(DashboardStats)
        )
    );
}

// Layout principal con sidebar y contenido
function DashboardLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return React.createElement('div', {
        className: 'flex h-screen bg-gray-50'
    },
        // Overlay para móvil
        isMobileMenuOpen && React.createElement('div', {
            className: 'mobile-overlay md:hidden',
            onClick: () => setIsMobileMenuOpen(false)
        }),
        
        // Sidebar
        React.createElement(Sidebar, {
            currentPage: window.DashboardState?.currentPage || 'dashboard',
            setCurrentPage: window.DashboardState?.setCurrentPage,
            isMobileOpen: isMobileMenuOpen,
            setIsMobileOpen: setIsMobileMenuOpen
        }),
        
        // Contenido principal
        React.createElement('div', {
            className: 'flex-1 flex flex-col overflow-hidden'
        },
            // Header móvil
            React.createElement('div', {
                className: 'md:hidden bg-white border-b border-gray-200 p-4'
            },
                React.createElement('button', {
                    onClick: () => setIsMobileMenuOpen(true),
                    className: 'text-gray-600 hover:text-gray-900'
                }, '☰')
            ),
            
            // Contenido
            React.createElement('main', {
                className: 'flex-1 overflow-auto'
            }, children)
        )
    );
}

// Placeholder para módulos en desarrollo
function ComingSoon({ module, icon = '🚧' }) {
    return React.createElement('div', {
        className: 'flex-1 bg-gray-50 overflow-auto'
    },
        React.createElement('div', {
            className: 'p-8 flex items-center justify-center min-h-96'
        },
            React.createElement('div', {
                className: 'text-center'
            },
                React.createElement('div', {
                    className: 'text-6xl mb-4'
                }, icon),
                React.createElement('h2', {
                    className: 'text-2xl font-bold text-gray-900 mb-2'
                }, `Módulo ${module}`),
                React.createElement('p', {
                    className: 'text-gray-600 mb-4'
                }, 'Próximamente...'),
                React.createElement('div', {
                    className: 'bg-white rounded-xl p-4 shadow-sm border border-gray-100 max-w-md'
                },
                    React.createElement('h3', {
                        className: 'font-semibold text-gray-900 mb-2'
                    }, 'Funcionalidades planeadas:'),
                    React.createElement('ul', {
                        className: 'text-sm text-gray-600 space-y-1'
                    },
                        module === 'Marcas' ? [
                            React.createElement('li', { key: 1 }, '• Gestión de marcas cliente'),
                            React.createElement('li', { key: 2 }, '• Asignación de creators'),
                            React.createElement('li', { key: 3 }, '• Seguimiento de campañas')
                        ] : [
                            React.createElement('li', { key: 1 }, '• Gestión de usuarios'),
                            React.createElement('li', { key: 2 }, '• Permisos y roles'),
                            React.createElement('li', { key: 3 }, '• Configuración del sistema')
                        ]
                    )
                )
            )
        )
    );
}

// Exportar componentes
window.DashboardComponents = {
    Sidebar,
    DashboardHome,
    DashboardStats,
    DashboardLayout,
    ComingSoon
};

UGCUtils.log('Dashboard module loaded successfully');