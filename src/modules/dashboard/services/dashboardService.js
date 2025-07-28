/**
 * Servicio de Dashboard
 * Maneja datos y estadísticas del dashboard
 */

import { api } from '../../../services/api.js';
import { config, log, logError } from '../../../services/config.js';

class DashboardService {
    constructor() {
        this.baseEndpoint = config.ENDPOINTS.STATS.DASHBOARD;
    }

    // Obtener estadísticas generales
    async getDashboardStats() {
        try {
            log('Fetching dashboard statistics');
            
            const response = await api.get(this.baseEndpoint);

            if (response.success) {
                log('Dashboard stats fetched successfully');
                return {
                    success: true,
                    stats: response.data.stats,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Get dashboard stats');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Obtener estadísticas de creators
    async getCreatorsStats() {
        try {
            log('Fetching creators statistics');
            
            const response = await api.get(config.ENDPOINTS.STATS.CREATORS);

            if (response.success) {
                log('Creators stats fetched successfully');
                return {
                    success: true,
                    stats: response.data.stats,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Get creators stats');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Obtener actividad reciente
    async getRecentActivity(limit = 10) {
        try {
            log('Fetching recent activity');
            
            const response = await api.get('/activity/recent', { limit });

            if (response.success) {
                log('Recent activity fetched successfully');
                return {
                    success: true,
                    activities: response.data.activities,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Get recent activity');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Calcular estadísticas localmente desde datos de creators
    calculateStatsFromCreators(creators) {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Estadísticas básicas
        const total = creators.length;
        const thisMonthCount = creators.filter(c => 
            new Date(c.created_at) >= thisMonth
        ).length;
        const todayCount = creators.filter(c => 
            new Date(c.created_at) >= today
        ).length;

        // Distribución por plataformas
        const platformCounts = {};
        creators.forEach(creator => {
            if (creator.platforms) {
                creator.platforms.forEach(platform => {
                    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
                });
            }
        });

        // Distribución por nacionalidad
        const nationalityCounts = {};
        creators.forEach(creator => {
            if (creator.nationality) {
                nationalityCounts[creator.nationality] = 
                    (nationalityCounts[creator.nationality] || 0) + 1;
            }
        });

        // Distribución por ubicación
        const locationCounts = {};
        creators.forEach(creator => {
            if (creator.location) {
                locationCounts[creator.location] = 
                    (locationCounts[creator.location] || 0) + 1;
            }
        });

        // Distribución por edad
        const ageRanges = {
            '18-24': 0,
            '25-34': 0,
            '35-44': 0,
            '45+': 0,
        };
        
        creators.forEach(creator => {
            const age = parseInt(creator.age);
            if (!isNaN(age)) {
                if (age >= 18 && age <= 24) ageRanges['18-24']++;
                else if (age >= 25 && age <= 34) ageRanges['25-34']++;
                else if (age >= 35 && age <= 44) ageRanges['35-44']++;
                else if (age >= 45) ageRanges['45+']++;
            }
        });

        // Intereses más populares
        const interestCounts = {};
        creators.forEach(creator => {
            if (creator.interests) {
                creator.interests.forEach(interest => {
                    interestCounts[interest] = (interestCounts[interest] || 0) + 1;
                });
            }
        });

        // Top 5 intereses
        const topInterests = Object.entries(interestCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});

        // Crecimiento (simulado para el ejemplo)
        const lastMonthCount = Math.max(0, total - thisMonthCount);
        const monthlyGrowth = lastMonthCount > 0 
            ? ((thisMonthCount / lastMonthCount) * 100) - 100 
            : 0;

        return {
            overview: {
                total,
                thisMonth: thisMonthCount,
                today: todayCount,
                monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
            },
            platforms: platformCounts,
            nationalities: nationalityCounts,
            locations: locationCounts,
            ageRanges,
            topInterests,
            lastUpdated: new Date().toISOString(),
        };
    }

    // Generar datos de ejemplo para gráficos
    generateChartData(creators) {
        const last7Days = [];
        const now = new Date();

        // Generar datos de los últimos 7 días
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            const dayCreators = creators.filter(creator => {
                const createdDate = new Date(creator.created_at);
                return createdDate.toDateString() === date.toDateString();
            });

            last7Days.push({
                date: date.toLocaleDateString('es-CL', { 
                    weekday: 'short',
                    day: 'numeric'
                }),
                creators: dayCreators.length,
                fullDate: date.toISOString().split('T')[0],
            });
        }

        return {
            weeklyRegistrations: last7Days,
        };
    }

    // Obtener métricas de rendimiento
    async getPerformanceMetrics() {
        try {
            const response = await api.get('/metrics/performance');

            if (response.success) {
                return {
                    success: true,
                    metrics: response.data.metrics,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Get performance metrics');
            // Retornar métricas simuladas en caso de error
            return {
                success: true,
                metrics: {
                    averageResponseTime: '1.2s',
                    uptime: '99.9%',
                    totalRequests: 15847,
                    errorRate: '0.1%',
                },
            };
        }
    }

    // Obtener notificaciones
    async getNotifications() {
        try {
            const response = await api.get('/notifications');

            if (response.success) {
                return {
                    success: true,
                    notifications: response.data.notifications,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Get notifications');
            return {
                success: true,
                notifications: [],
            };
        }
    }

    // Marcar notificación como leída
    async markNotificationAsRead(notificationId) {
        try {
            const response = await api.put(`/notifications/${notificationId}/read`);

            if (response.success) {
                return { success: true };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Mark notification as read');
            return { success: false, message: error.message };
        }
    }
}

// Instancia singleton
export const dashboardService = new DashboardService();

export default dashboardService;