/**
 * Módulo de Dashboard
 * Exporta componentes, hooks y servicios del dashboard
 */

// Service
export { dashboardService } from './services/dashboardService.js';

// Hooks
export { useDashboardStats, useRecentActivity } from './hooks/index.js';

// Components
export { 
    DashboardPage,
    StatsCard,
    PlatformStats,
    RecentActivity,
    QuickActions
} from './components/index.js';