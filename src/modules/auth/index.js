/**
 * Módulo de Autenticación
 * Exporta todos los componentes, hooks y servicios relacionados con auth
 */

// Context
export { AuthProvider, AuthContext } from './context/AuthContext.jsx';

// Hooks
export { useAuth, usePermissions } from './hooks/index.js';

// Components
export { 
    LoginForm, 
    ProtectedRoute, 
    UserInfo,
    AuthLoader 
} from './components/index.js';

// Services
export { authService } from './services/authService.js';