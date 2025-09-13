/**
 * Componente de actividad reciente
 */

import React from 'react';
import { useRecentActivity } from '../hooks/index.js';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';

const RecentActivity = ({ limit = 5 }) => {
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

export default RecentActivity;