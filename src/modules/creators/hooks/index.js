/**
 * Hooks de Creators - Index
 * Archivo de exportación centralizado para todos los hooks de creators
 */

// Exportar hooks individuales
export { useCreators } from './useCreators.js';
export { useCreatorFilters } from './useCreatorFilters.js';
export { useCreatorActions } from './useCreatorActions.js';
export { useCreatorSearch } from './useCreatorSearch.js';
export { useCreatorExport } from './useCreatorExport.js';
export { useFavorites } from './useFavorites.js';

// Exportación agrupada (opcional)
import { useCreators } from './useCreators.js';
import { useCreatorFilters } from './useCreatorFilters.js';
import { useCreatorActions } from './useCreatorActions.js';
import { useCreatorSearch } from './useCreatorSearch.js';
import { useCreatorExport } from './useCreatorExport.js';
import { useFavorites } from './useFavorites.js';

export const creatorsHooks = {
    useCreators,
    useCreatorFilters,
    useCreatorActions,
    useCreatorSearch,
    useCreatorExport,
    useFavorites,
};

export default creatorsHooks;