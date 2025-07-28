/**
 * Módulo de Brands (Marcas)
 * Exporta componentes, hooks y servicios de marcas
 */

// Service
export { brandsService } from './services/brandsService.js';

// Hooks
export { useBrands, useBrandActions } from './hooks/index.js';

// Components
export { 
    BrandsPage,
    BrandCard,
    BrandForm,
    ComingSoon
} from './components/index.js';