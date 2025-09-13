/**
 * Página principal del dashboard
 */

import React from 'react';
import { useDashboardStats } from '../hooks/index.js';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';
import { config } from '../../../services/config.js';
import StatsCard from './StatsCard.jsx';
import PlatformStats from './PlatformStats.jsx';
import RecentActivity from './RecentActivity.jsx';
import QuickActions from './QuickActions.jsx';

const DashboardPage = ({ onNavigate }) => {
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
                        bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
                        textColor="text-gray-700"
                        loading={loading}
                    />
                    
                    <StatsCard
                        title="Registros hoy"
                        value={stats?.overview?.today || 0}
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

export default DashboardPage;