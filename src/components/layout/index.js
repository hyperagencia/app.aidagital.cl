/**
 * Punto de entrada para todos los componentes de Layout
 */

// Importar componentes individuales
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import Breadcrumb from './Breadcrumb.jsx';
import PageContainer from './PageContainer.jsx';
import Layout from './Layout.jsx';
import PageLoader from './PageLoader.jsx';
import PageError from './PageError.jsx';

// Exportaciones individuales (re-exportando como nombradas)
export { default as Sidebar } from './Sidebar.jsx';
export { default as Header } from './Header.jsx';
export { default as Breadcrumb } from './Breadcrumb.jsx';
export { default as PageContainer } from './PageContainer.jsx';
export { default as Layout } from './Layout.jsx';
export { default as PageLoader } from './PageLoader.jsx';
export { default as PageError } from './PageError.jsx';

// Exportación agrupada (compatible con el código existente)
export const layoutComponents = {
    Sidebar,
    Header,
    Breadcrumb,
    PageContainer,
    Layout,
    PageLoader,
    PageError,
};

// Exportación por defecto
export default layoutComponents;