/**
 * Componente de estadísticas por plataforma
 */

import React from 'react';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';

const PlatformStats = ({ platforms, loading = false }) => {
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

export default PlatformStats;