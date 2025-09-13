/**
 * Punto de entrada para todos los componentes de Dashboard
 */

// Importaciones por defecto
import DashboardPage from './DashboardPage.jsx';
import StatsCard from './StatsCard.jsx';
import PlatformStats from './PlatformStats.jsx';
import RecentActivity from './RecentActivity.jsx';
import QuickActions from './QuickActions.jsx';

// Exportaciones nombradas (re-exportando desde default)
export { default as DashboardPage } from './DashboardPage.jsx';
export { default as StatsCard } from './StatsCard.jsx';
export { default as PlatformStats } from './PlatformStats.jsx';
export { default as RecentActivity } from './RecentActivity.jsx';
export { default as QuickActions } from './QuickActions.jsx';

// Exportación agrupada para compatibilidad
export const dashboardComponents = {
    DashboardPage,
    StatsCard,
    PlatformStats,
    RecentActivity,
    QuickActions,
};

// Exportación por defecto
export default dashboardComponents;