/**
 * Componentes de Creators
 * Solo exportaciones - cada componente está en su archivo individual
 */

// Primero importar todos los componentes
import { SearchBar } from './SearchBar.jsx';
import { CreatorFilters } from './CreatorFilters.jsx';
import { CreatorCard } from './CreatorCard.jsx';
import { EmptyState } from './EmptyState.jsx';
import { CreatorsList } from './CreatorsList.jsx';
import { CreatorsPage } from './CreatorsPage.jsx';

// Luego exportarlos
export { SearchBar };
export { CreatorFilters };
export { CreatorCard };
export { EmptyState };
export { CreatorsList };
export { CreatorsPage };

// Exportación por defecto con todos los componentes
export const creatorsComponents = {
    SearchBar,
    CreatorFilters,
    CreatorCard,
    EmptyState,
    CreatorsList,
    CreatorsPage,
};

export default creatorsComponents;