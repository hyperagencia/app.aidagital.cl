/**
 * Componentes de Dashboard
 */

import React from 'react';
import { useDashboardStats, useRecentActivity } from '../hooks/index.js';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';
import { config } from '../../../services/config.js';

// Componente de tarjeta de estadísticas
export const StatsCard = ({ 
    title, 
    value, 
    change,
    changeType = 'neutral',
    icon,
    bgColor = 'bg-white',
    textColor = 'text-gray-900',
    onClick,
    loading = false 
}) => {
    const changeColors = {
        positive: 'text-green-600',
        negative: 'text-red-600',
        neutral: 'text-gray-500',
    };

    const changeColor = changeColors[changeType] || changeColors.neutral;

    return (
        <UI.Card 
            className={`${bgColor} ${onClick ? 'cursor-pointer' : ''} hover:shadow-lg transition-all duration-300`}
            onClick={onClick}
            padding="p-6"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className={`text-sm font-medium ${textColor} opacity-75 mb-1`}>
                        {title}
                    </p>
                    <div className="flex items-baseline space-x-2">
                        {loading ? (
                            <UI.Skeleton width="w-16" height="h-8" />
                        ) : (
                            <p className={`text-3xl font-bold ${textColor}`}>
                                {typeof value === 'number' ? formatters.formatNumber(value) : value}
                            </p>
                        )}
                        {change && !loading && (
                            <span className={`text-sm font-medium ${changeColor}`}>
                                {change > 0 ? '+' : ''}{change}%
                            </span>
                        )}
                    </div>
                </div>
                {icon && (
                    <div className={`text-2xl ${textColor} opacity-75`}>
                        {icon}
                    </div>
                )}
            </div>
        </UI.Card>
    );
};

// Componente de estadísticas por plataforma
export const PlatformStats = ({ platforms, loading = false }) => {
    if (loading) {
        return (
            <UI.Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Distribución por Plataformas
                </h3>
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <UI.Skeleton width="w-20" height="h-4" />
                            <UI.Skeleton width="w-8" height="h-4" />
                        </div>
                    ))}
                </div>
            </UI.Card>
        );
    }

    const platformEntries = Object.entries(platforms || {});
    const total = platformEntries.reduce((sum, [, count]) => sum + count, 0);

    return (
        <UI.Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribución por Plataformas
            </h3>
            <div className="space-y-4">
                {platformEntries.map(([platform, count]) => {
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    return (
                        <div key={platform} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-900">
                                    {formatters.formatPlatform(platform)}
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-20">
                                    <div 
                                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-lg font-bold text-purple-600">
                                {count}
                            </span>
                        </div>
                    );
                })}
                
                {platformEntries.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                        No hay datos de plataformas disponibles
                    </p>
                )}
            </div>
        </UI.Card>
    );
};

// Componente de actividad reciente
export const RecentActivity = ({ limit = 5 }) => {
    const { activities, loading, error } = useRecentActivity(limit);

    if (loading) {
        return (
            <UI.Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Actividad Reciente
                </h3>
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <UI.Skeleton width="w-8" height="h-8" className="rounded-full" />
                            <div className="flex-1">
                                <UI.Skeleton width="w-full" height="h-4" className="mb-2" />
                                <UI.Skeleton width="w-20" height="h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </UI.Card>
        );
    }

    if (error) {
        return (
            <UI.Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Actividad Reciente
                </h3>
                <UI.Alert type="error">
                    Error al cargar actividad reciente
                </UI.Alert>
            </UI.Card>
        );
    }

    return (
        <UI.Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actividad Reciente
            </h3>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">{activity.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                {activity.message}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatters.formatTimeAgo(activity.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}
                
                {activities.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                        No hay actividad reciente
                    </p>
                )}
            </div>
        </UI.Card>
    );
};

// Componente de acciones rápidas
export const QuickActions = ({ onNavigate }) => {
    const actions = [
        {
            id: 'view-creators',
            title: 'Ver Creators',
            description: 'Gestionar base de creators',
            icon: '👥',
            color: 'bg-blue-500',
            action: () => onNavigate?.('creators'),
        },
        {
            id: 'export-data',
            title: 'Exportar Datos',
            description: 'Descargar información',
            icon: '📊',
            color: 'bg-green-500',
            action: () => console.log('Export data'),
        },
        {
            id: 'manage-brands',
            title: 'Gestionar Marcas',
            description: 'Administrar marcas cliente',
            icon: '🏪',
            color: 'bg-purple-500',
            action: () => onNavigate?.('brands'),
        },
        {
            id: 'view-analytics',
            title: 'Ver Analytics',
            description: 'Estadísticas detalladas',
            icon: '📈',
            color: 'bg-orange-500',
            action: () => console.log('View analytics'),
        },
    ];

    return (
        <UI.Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={action.action}
                        className="p-4 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                                <span className="text-lg">{action.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {action.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </UI.Card>
    );
};

// Página principal del dashboard
export const DashboardPage = ({ onNavigate }) => {
    const { stats, loading, error, refresh } = useDashboardStats();

    if (error) {
        return (
            <div className="flex-1 bg-gray-50 overflow-auto p-8">
                <UI.Card className="p-8 text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Error al cargar el dashboard
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <UI.Button variant="primary" onClick={refresh}>
                        Reintentar
                    </UI.Button>
                </UI.Card>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50 overflow-auto">
            <div className="p-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Dashboard UGC Creators
                    </h1>
                    <p className="text-lg text-gray-600">
                        Resumen de actividad y estadísticas principales
                    </p>
                </div>

                {/* Estadísticas principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Total Creators"
                        value={stats?.overview?.total || 0}
                        icon="👥"
                        bgColor="bg-white"
                        textColor="text-gray-700"
                        loading={loading}
                        onClick={() => onNavigate?.('creators')}
                    />
                    
                    <StatsCard
                        title="Registros este mes"
                        value={stats?.overview?.thisMonth || 0}
                        change={stats?.overview?.monthlyGrowth}
                        changeType={stats?.overview?.monthlyGrowth > 0 ? 'positive' : 'negative'}
                        icon="📈"
                        bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
                        textColor="text-white"
                        loading={loading}
                    />
                    
                    <StatsCard
                        title="Registros hoy"
                        value={stats?.overview?.today || 0}
                        icon="⭐"
                        bgColor="bg-white"
                        textColor="text-gray-700"
                        loading={loading}
                    />
                </div>

                {/* Contenido secundario */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Estadísticas por plataforma */}
                    <PlatformStats 
                        platforms={stats?.platforms}
                        loading={loading}
                    />
                    
                    {/* Actividad reciente */}
                    <RecentActivity limit={5} />
                    
                    {/* Acciones rápidas */}
                    <QuickActions onNavigate={onNavigate} />
                    
                    {/* Información adicional */}
                    <UI.Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Información del Sistema
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Versión</span>
                                <UI.Badge variant="gray" size="sm">
                                    v{config.APP_VERSION}
                                </UI.Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Última actualización</span>
                                <span className="text-sm text-gray-900">
                                    {stats?.lastUpdated ? 
                                        formatters.formatTimeAgo(stats.lastUpdated) : 
                                        'Hace un momento'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Estado</span>
                                <UI.Badge variant="green" size="sm">
                                    Operativo
                                </UI.Badge>
                            </div>
                        </div>
                    </UI.Card>
                </div>
            </div>
        </div>
    );
};

// Exportar todos los componentes
export const dashboardComponents = {
    DashboardPage,
    StatsCard,
    PlatformStats,
    RecentActivity,
    QuickActions,
};

export default dashboardComponents;