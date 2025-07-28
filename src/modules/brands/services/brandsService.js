/**
 * Servicio de Brands (Marcas)
 * Placeholder para futuro desarrollo
 */

import { api } from '../../../services/api.js';
import { config, log, logError } from '../../../services/config.js';

class BrandsService {
    constructor() {
        this.baseEndpoint = config.ENDPOINTS.BRANDS.LIST;
    }

    // Obtener lista de marcas
    async getBrands(filters = {}) {
        try {
            log('Fetching brands with filters:', filters);
            
            const response = await api.get(this.baseEndpoint, filters);

            if (response.success) {
                log(`Fetched ${response.data.brands.length} brands`);
                return {
                    success: true,
                    brands: response.data.brands,
                    total: response.data.total || response.data.brands.length,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Get brands');
            // Retornar datos mock para desarrollo
            return {
                success: true,
                brands: this.getMockBrands(),
                total: this.getMockBrands().length,
            };
        }
    }

    // Obtener una marca por ID
    async getBrand(id) {
        try {
            log('Fetching brand:', id);
            
            const response = await api.get(`${this.baseEndpoint}/${id}`);

            if (response.success) {
                log('Brand fetched successfully');
                return {
                    success: true,
                    brand: response.data.brand,
                };
            } else {
                throw new Error(response.message || config.ERRORS.NOT_FOUND);
            }
        } catch (error) {
            logError(error, 'Get brand');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Crear nueva marca
    async createBrand(brandData) {
        try {
            log('Creating brand:', brandData.name);
            
            const response = await api.post(config.ENDPOINTS.BRANDS.CREATE, brandData);

            if (response.success) {
                log('Brand created successfully');
                return {
                    success: true,
                    brand: response.data.brand,
                    message: response.message || config.SUCCESS.SAVE,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Create brand');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Actualizar marca
    async updateBrand(id, brandData) {
        try {
            log('Updating brand:', id);
            
            const response = await api.put(`${config.ENDPOINTS.BRANDS.UPDATE}/${id}`, brandData);

            if (response.success) {
                log('Brand updated successfully');
                return {
                    success: true,
                    brand: response.data.brand,
                    message: response.message || config.SUCCESS.UPDATE,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Update brand');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Eliminar marca
    async deleteBrand(id) {
        try {
            log('Deleting brand:', id);
            
            const response = await api.delete(`${config.ENDPOINTS.BRANDS.DELETE}/${id}`);

            if (response.success) {
                log('Brand deleted successfully');
                return {
                    success: true,
                    message: response.message || config.SUCCESS.DELETE,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Delete brand');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Datos mock para desarrollo
    getMockBrands() {
        return [
            {
                id: 1,
                name: 'AIDA Digital',
                description: 'Agencia de marketing digital especializada en UGC',
                logo: null,
                website: 'https://aidadigital.cl',
                industry: 'Marketing Digital',
                status: 'active',
                assignedCreators: 0,
                campaigns: 0,
                created_at: new Date().toISOString(),
            },
            {
                id: 2,
                name: 'Marca Ejemplo 1',
                description: 'Descripción de marca ejemplo para desarrollo',
                logo: null,
                website: 'https://ejemplo1.com',
                industry: 'E-commerce',
                status: 'active',
                assignedCreators: 3,
                campaigns: 2,
                created_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: 3,
                name: 'Marca Ejemplo 2',
                description: 'Otra marca de ejemplo para testing',
                logo: null,
                website: 'https://ejemplo2.com',
                industry: 'Tecnología',
                status: 'inactive',
                assignedCreators: 1,
                campaigns: 1,
                created_at: new Date(Date.now() - 172800000).toISOString(),
            },
        ];
    }

    // Validar datos de marca
    validateBrandData(brandData) {
        const errors = {};

        if (!brandData.name || brandData.name.trim().length < 2) {
            errors.name = 'El nombre es requerido y debe tener al menos 2 caracteres';
        }

        if (!brandData.industry || brandData.industry.trim().length < 2) {
            errors.industry = 'La industria es requerida';
        }

        if (brandData.website && !this.isValidUrl(brandData.website)) {
            errors.website = 'La URL del sitio web no es válida';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    // Validar URL
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Instancia singleton
export const brandsService = new BrandsService();

export default brandsService;