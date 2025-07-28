/**
 * Servicio de Creators
 * Maneja todas las operaciones CRUD de creators
 */

import { api } from '../../../services/api.js';
import { config, log, logError } from '../../../services/config.js';
import { validation } from '../../../utils/validators.js';

class CreatorsService {
    constructor() {
        this.baseEndpoint = config.ENDPOINTS.CREATORS.LIST;
    }

    // Obtener lista de creators
    async getCreators(filters = {}) {
        try {
            log('Fetching creators with filters:', filters);
            
            const params = this.buildQueryParams(filters);
            const response = await api.get(this.baseEndpoint, params);

            if (response.success) {
                log(`Fetched ${response.data.creators.length} creators`);
                return {
                    success: true,
                    creators: response.data.creators,
                    total: response.data.total || response.data.creators.length,
                    pagination: response.data.pagination || null,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Get creators');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Obtener un creator por ID
    async getCreator(id) {
        try {
            log('Fetching creator:', id);
            
            const response = await api.get(`${this.baseEndpoint}/${id}`);

            if (response.success) {
                log('Creator fetched successfully');
                return {
                    success: true,
                    creator: response.data.creator,
                };
            } else {
                throw new Error(response.message || config.ERRORS.NOT_FOUND);
            }
        } catch (error) {
            logError(error, 'Get creator');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Crear nuevo creator
    async createCreator(creatorData) {
        try {
            // Validar datos
            const validationResult = validation.validateCreator(creatorData);
            if (!validationResult.isValid) {
                const firstError = Object.values(validationResult.errors).flat()[0];
                throw new Error(firstError);
            }

            log('Creating creator:', creatorData.email);
            
            const response = await api.post(config.ENDPOINTS.CREATORS.CREATE, creatorData);

            if (response.success) {
                log('Creator created successfully');
                return {
                    success: true,
                    creator: response.data.creator,
                    message: response.message || config.SUCCESS.SAVE,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Create creator');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Actualizar creator
    async updateCreator(id, creatorData) {
        try {
            // Validar datos (sin requerir todos los campos)
            const validationRules = { ...validation.creatorValidationRules };
            // Hacer campos opcionales para actualización
            Object.keys(validationRules).forEach(key => {
                if (!creatorData.hasOwnProperty(key)) {
                    delete validationRules[key];
                }
            });

            const validationResult = validation.validateObject(creatorData, validationRules);
            if (!validationResult.isValid) {
                const firstError = Object.values(validationResult.errors).flat()[0];
                throw new Error(firstError);
            }

            log('Updating creator:', id);
            
            const response = await api.put(`${config.ENDPOINTS.CREATORS.UPDATE}/${id}`, creatorData);

            if (response.success) {
                log('Creator updated successfully');
                return {
                    success: true,
                    creator: response.data.creator,
                    message: response.message || config.SUCCESS.UPDATE,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Update creator');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Eliminar creator
    async deleteCreator(id) {
        try {
            log('Deleting creator:', id);
            
            const response = await api.delete(`${config.ENDPOINTS.CREATORS.DELETE}/${id}`);

            if (response.success) {
                log('Creator deleted successfully');
                return {
                    success: true,
                    message: response.message || config.SUCCESS.DELETE,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Delete creator');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Eliminar múltiples creators
    async deleteMultipleCreators(ids) {
        try {
            log('Deleting multiple creators:', ids);
            
            const response = await api.post(`${config.ENDPOINTS.CREATORS.DELETE}/bulk`, { ids });

            if (response.success) {
                log(`${ids.length} creators deleted successfully`);
                return {
                    success: true,
                    deletedCount: response.data.deletedCount || ids.length,
                    message: response.message || `${ids.length} creators eliminados`,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Delete multiple creators');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Exportar creators
    async exportCreators(filters = {}, format = 'csv') {
        try {
            log('Exporting creators with format:', format);
            
            const params = { 
                ...this.buildQueryParams(filters),
                format,
                export: true,
            };
            
            const response = await api.get(config.ENDPOINTS.CREATORS.EXPORT, params);

            if (response.success) {
                log('Export completed successfully');
                return {
                    success: true,
                    data: response.data,
                    downloadUrl: response.data.downloadUrl,
                    filename: response.data.filename,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Export creators');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Obtener estadísticas de creators
    async getCreatorsStats() {
        try {
            log('Fetching creators statistics');
            
            const response = await api.get(config.ENDPOINTS.STATS.CREATORS);

            if (response.success) {
                log('Stats fetched successfully');
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

    // Buscar creators
    async searchCreators(searchTerm, filters = {}) {
        try {
            log('Searching creators:', searchTerm);
            
            const params = {
                ...this.buildQueryParams(filters),
                search: searchTerm,
            };
            
            const response = await api.get(`${this.baseEndpoint}/search`, params);

            if (response.success) {
                log(`Found ${response.data.creators.length} creators`);
                return {
                    success: true,
                    creators: response.data.creators,
                    total: response.data.total,
                    searchTerm,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Search creators');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Asignar marca a creator
    async assignBrand(creatorId, brandId) {
        try {
            log('Assigning brand to creator:', { creatorId, brandId });
            
            const response = await api.post(`${this.baseEndpoint}/${creatorId}/assign-brand`, {
                brandId,
            });

            if (response.success) {
                log('Brand assigned successfully');
                return {
                    success: true,
                    creator: response.data.creator,
                    message: response.message || 'Marca asignada correctamente',
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Assign brand');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Desasignar marca de creator
    async unassignBrand(creatorId) {
        try {
            log('Unassigning brand from creator:', creatorId);
            
            const response = await api.delete(`${this.baseEndpoint}/${creatorId}/assign-brand`);

            if (response.success) {
                log('Brand unassigned successfully');
                return {
                    success: true,
                    creator: response.data.creator,
                    message: response.message || 'Marca desasignada correctamente',
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Unassign brand');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Construir parámetros de consulta
    buildQueryParams(filters) {
        const params = {};
        
        if (filters.page) params.page = filters.page;
        if (filters.limit) params.limit = filters.limit;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        if (filters.sortOrder) params.sortOrder = filters.sortOrder;
        
        // Filtros específicos
        if (filters.interests && filters.interests.length > 0) {
            params.interests = filters.interests.join(',');
        }
        if (filters.platforms && filters.platforms.length > 0) {
            params.platforms = filters.platforms.join(',');
        }
        if (filters.nationality) params.nationality = filters.nationality;
        if (filters.location) params.location = filters.location;
        if (filters.modality) params.modality = filters.modality;
        if (filters.ageMin) params.ageMin = filters.ageMin;
        if (filters.ageMax) params.ageMax = filters.ageMax;
        if (filters.brandId) params.brandId = filters.brandId;
        if (filters.hasAssignedBrand !== undefined) {
            params.hasAssignedBrand = filters.hasAssignedBrand;
        }
        
        // Filtros de fecha
        if (filters.createdAfter) params.createdAfter = filters.createdAfter;
        if (filters.createdBefore) params.createdBefore = filters.createdBefore;
        
        return params;
    }

    // Filtrar creators localmente (para uso offline o cache)
    filterCreators(creators, filters) {
        return creators.filter(creator => {
            // Búsqueda por texto
            if (filters.searchTerm) {
                const searchLower = filters.searchTerm.toLowerCase();
                const matchName = creator.full_name?.toLowerCase().includes(searchLower);
                const matchEmail = creator.email?.toLowerCase().includes(searchLower);
                if (!matchName && !matchEmail) return false;
            }

            // Filtro por intereses
            if (filters.interests && filters.interests.length > 0) {
                const hasInterest = creator.interests && 
                    filters.interests.some(interest => creator.interests.includes(interest));
                if (!hasInterest) return false;
            }

            // Filtro por plataforma
            if (filters.platforms && filters.platforms.length > 0) {
                const hasPlatform = creator.platforms && 
                    filters.platforms.some(platform => creator.platforms.includes(platform));
                if (!hasPlatform) return false;
            }

            // Filtro por edad
            if (filters.ageMin || filters.ageMax) {
                const age = parseInt(creator.age);
                if (isNaN(age)) return false;
                
                const minAge = filters.ageMin ? parseInt(filters.ageMin) : 0;
                const maxAge = filters.ageMax ? parseInt(filters.ageMax) : 200;
                if (age < minAge || age > maxAge) return false;
            }

            // Filtro por nacionalidad
            if (filters.nationality && creator.nationality !== filters.nationality) {
                return false;
            }

            // Filtro por ubicación
            if (filters.location && creator.location !== filters.location) {
                return false;
            }

            // Filtro por modalidad
            if (filters.modality && creator.modality !== filters.modality) {
                return false;
            }

            return true;
        });
    }

    // Validar datos de creator
    validateCreatorData(creatorData) {
        return validation.validateCreator(creatorData);
    }
}

// Instancia singleton
export const creatorsService = new CreatorsService();

export default creatorsService;