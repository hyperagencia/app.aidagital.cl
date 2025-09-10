/**
 * Punto de entrada para todos los componentes de autenticación
 */

// Importar componentes individuales
import { LoginForm } from './LoginForm.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { AuthLoader } from './AuthLoader.jsx';
import { UserInfo } from './UserInfo.jsx';
import { UserDropdown } from './UserDropdown.jsx';
import { SessionExpired } from './SessionExpired.jsx';

// Exportaciones individuales
export { LoginForm } from './LoginForm.jsx';
export { ProtectedRoute } from './ProtectedRoute.jsx';
export { AuthLoader } from './AuthLoader.jsx';
export { UserInfo } from './UserInfo.jsx';
export { UserDropdown } from './UserDropdown.jsx';
export { SessionExpired } from './SessionExpired.jsx';

// Exportación agrupada (compatible con el código existente)
export const authComponents = {
    LoginForm,
    AuthLoader,
    ProtectedRoute,
    UserInfo,
    UserDropdown,
    SessionExpired,
};

// Exportación por defecto
export default authComponents;