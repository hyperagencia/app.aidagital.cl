/**
 * Hooks de Dashboard
 * Hooks personalizados para el dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService.js';
import { creatorsService } from '../../creators/services/creatorsService.js';
import { log } from '../../../services/config.js';

// Hook para estadísticas del dashboard
export const useDashboardStats = (useLocalCalculation = true) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (useLocalCalculation) {
                // Obtener creators y calcular estadísticas localmente
                const creatorsResult = await creatorsService.getCreators();
                
                if (creatorsResult.success) {
                    const calculatedStats = dashboardService.calculateStatsFromCreators(
                        creatorsResult.creators
                    );
                    setStats(calculatedStats);
                    setLastUpdated(new Date());
                    log('Stats calculated locally from creators data');
                }
            } else {
                // Obtener desde el servidor
                const result = await dashboardService.getDashboardStats();
                
                if (result.success) {
                    setStats(result.stats);
                    setLastUpdated(new Date());
                    log('Stats fetched from server');
                }
            }
        } catch (error) {
            setError(error.message);
            log('Error fetching dashboard stats:', error.message);
        } finally {
            setLoading(false);
        }
    }, [useLocalCalculation]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const refresh = useCallback(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        lastUpdated,
        refresh,
    };
};

// Hook para actividad reciente
export const useRecentActivity = (limit = 10) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await dashboardService.getRecentActivity(limit);
            
            if (result.success) {
                setActivities(result.activities);
                log(`Loaded ${result.activities.length} recent activities`);
            }
        } catch (error) {
            setError(error.message);
            // Generar actividades de ejemplo en caso de error
            const mockActivities = generateMockActivities(limit);
            setActivities(mockActivities);
            log('Using mock activities due to error:', error.message);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const refresh = useCallback(() => {
        fetchActivities();
    }, [fetchActivities]);

    return {
        activities,
        loading,
        error,
        refresh,
    };
};

// Hook para datos de gráficos
export const useChartData = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchChartData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener creators para generar datos de gráficos
            const creatorsResult = await creatorsService.getCreators();
            
            if (creatorsResult.success) {
                const generatedData = dashboardService.generateChartData(
                    creatorsResult.creators
                );
                setChartData(generatedData);
                log('Chart data generated successfully');
            }
        } catch (error) {
            setError(error.message);
            log('Error generating chart data:', error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    const refresh = useCallback(() => {
        fetchChartData();
    }, [fetchChartData]);

    return {
        chartData,
        loading,
        error,
        refresh,
    };
};

// Hook para notificaciones
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await dashboardService.getNotifications();
            
            if (result.success) {
                setNotifications(result.notifications);
                const unread = result.notifications.filter(n => !n.read).length;
                setUnreadCount(unread);
                log(`Loaded ${result.notifications.length} notifications (${unread} unread)`);
            }
        } catch (error) {
            setError(error.message);
            log('Error fetching notifications:', error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            const result = await dashboardService.markNotificationAsRead(notificationId);
            
            if (result.success) {
                setNotifications(prev => 
                    prev.map(notification => 
                        notification.id === notificationId 
                            ? { ...notification, read: true }
                            : notification
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                log('Notification marked as read:', notificationId);
            }
        } catch (error) {
            log('Error marking notification as read:', error.message);
        }
    }, []);

    const refresh = useCallback(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        refresh,
    };
};

// Hook para métricas de rendimiento
export const usePerformanceMetrics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMetrics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await dashboardService.getPerformanceMetrics();
            
            if (result.success) {
                setMetrics(result.metrics);
                log('Performance metrics loaded');
            }
        } catch (error) {
            setError(error.message);
            log('Error fetching performance metrics:', error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
        
        // Refrescar métricas cada 5 minutos
        const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [fetchMetrics]);

    return {
        metrics,
        loading,
        error,
        refresh: fetchMetrics,
    };
};

// Función auxiliar para generar actividades de ejemplo
function generateMockActivities(limit) {
    const activities = [
        {
            id: 1,
            type: 'creator_registered',
            message: 'Nuevo creator registrado: María González',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
            icon: '👤',
            user: 'María González',
        },
        {
            id: 2,
            type: 'export_completed',
            message: 'Exportación de creators completada',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            icon: '📊',
            user: 'Admin',
        },
        {
            id: 3,
            type: 'creator_registered',
            message: 'Nuevo creator registrado: Carlos Pérez',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
            icon: '👤',
            user: 'Carlos Pérez',
        },
        {
            id: 4,
            type: 'brand_assigned',
            message: 'Marca asignada a creator: Ana Martín',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
            icon: '🏪',
            user: 'Admin',
        },
        {
            id: 5,
            type: 'creator_registered',
            message: 'Nuevo creator registrado: Luis Rodríguez',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
            icon: '👤',
            user: 'Luis Rodríguez',
        },
    ];

    return activities.slice(0, limit);
}

// Exportar todos los hooks
export const dashboardHooks = {
    useDashboardStats,
    useRecentActivity,
    useChartData,
    useNotifications,
    usePerformanceMetrics,
};

export default dashboardHooks;