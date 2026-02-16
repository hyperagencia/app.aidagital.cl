/**
 * Servicio de Creators
 * Versión con datos mock para desarrollo
 */

import { api } from '../../../services/api.js';
import { config, log, logError } from '../../../services/config.js';
import { validation } from '../../../utils/validators.js';

class CreatorsService {
    constructor() {
        this.baseEndpoint = config.ENDPOINTS.CREATORS.LIST;
        this.isDevelopment = config.IS_DEVELOPMENT || config.DEBUG;
    }

    // Obtener lista de creators
    async getCreators(filters = {}) {
        try {
            log('Fetching creators with filters:', filters);

            // MODO DESARROLLO: Usar datos mock
            // Solo usar mock si está específicamente habilitado
if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    return await this.getMockCreators(filters);
}

            // MODO PRODUCCIÓN: Usar API real
            const params = this.buildQueryParams(filters);

            // ✅ DEBUGGING: Log detallado de parámetros
            log('🔍 API Request Details:');
            log('  - Endpoint:', this.baseEndpoint);
            log('  - Params object:', params);
            log('  - URL completa:', `${config.API_BASE}${this.baseEndpoint}?${new URLSearchParams(params).toString()}`);

            const response = await api.get(this.baseEndpoint, params);

            // ✅ DEBUGGING: Log detallado de respuesta
            log('📥 API Response:');
            log('  - Success:', response.success);
            log('  - Total creators en respuesta:', response.data?.creators?.length || 0);
            log('  - Total en BD:', response.data?.total);
            log('  - Pagination:', response.data?.pagination);

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
            
            // Fallback a datos mock en caso de error
            if (!this.isDevelopment) {
                log('Falling back to mock data due to API error');
                return await this.getMockCreators(filters);
            }
            
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Datos mock para desarrollo
    async getMockCreators(filters = {}) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockCreators = [
            {
                id: 1,
                full_name: 'María González',
                email: 'maria.gonzalez@email.com',
                phone: '+56912345678',
                age: 25,
                nationality: 'chilena',
                location: 'santiago',
                modality: 'presencial',
                platforms: ['instagram', 'tiktok'],
                interests: ['moda', 'belleza', 'lifestyle'],
                followers_range: '10000-24999',
                created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 días atrás
                status: 'active',
                assigned_brand: null,
            },
            {
                id: 2,
                full_name: 'Carlos Pérez',
                email: 'carlos.perez@email.com',
                phone: '+56987654321',
                age: 28,
                nationality: 'chilena',
                location: 'valparaiso',
                modality: 'remoto',
                platforms: ['youtube', 'instagram'],
                interests: ['tecnologia', 'gaming', 'educacion'],
                followers_range: '25000-49999',
                created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 días atrás
                status: 'active',
                assigned_brand: null,
            },
            {
                id: 3,
                full_name: 'Ana Martín',
                email: 'ana.martin@email.com',
                phone: '+56911111111',
                age: 23,
                nationality: 'extranjera',
                location: 'concepcion',
                modality: 'hibrido',
                platforms: ['tiktok'],
                interests: ['baile', 'musica', 'entretenimiento'],
                followers_range: '5000-9999',
                created_at: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 días atrás
                status: 'active',
                assigned_brand: null,
            },
            {
                id: 4,
                full_name: 'Luis Rodríguez',
                email: 'luis.rodriguez@email.com',
                phone: '+56922222222',
                age: 30,
                nationality: 'chilena',
                location: 'santiago',
                modality: 'presencial',
                platforms: ['instagram', 'youtube'],
                interests: ['deporte', 'fitness', 'nutricion'],
                followers_range: 'mas-50000',
                created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 días atrás
                status: 'active',
                assigned_brand: null,
            },
            {
                id: 5,
                full_name: 'Sofía Morales',
                email: 'sofia.morales@email.com',
                phone: '+56933333333',
                age: 26,
                nationality: 'chilena',
                location: 'antofagasta',
                modality: 'remoto',
                platforms: ['instagram'],
                interests: ['gastronomia', 'cocina', 'recetas'],
                followers_range: '1000-4999',
                created_at: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 día atrás
                status: 'active',
                assigned_brand: null,
            },
            {
                id: 6,
                full_name: 'Diego Silva',
                email: 'diego.silva@email.com',
                phone: '+56944444444',
                age: 24,
                nationality: 'chilena',
                location: 'valparaiso',
                modality: 'presencial',
                platforms: ['tiktok', 'youtube'],
                interests: ['comedia', 'entretenimiento', 'viral'],
                followers_range: '10000-24999',
                created_at: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 días atrás
                status: 'active',
                assigned_brand: null,
            }
        ];

        // Aplicar filtros localmente
        const filteredCreators = this.filterCreators(mockCreators, filters);

        log(`Mock creators loaded: ${filteredCreators.length} of ${mockCreators.length}`);

        return {
            success: true,
            creators: filteredCreators,
            total: filteredCreators.length,
            pagination: null,
        };
    }

    // Obtener estadísticas de creators
    async getCreatorsStats() {
        try {
            log('Fetching creators statistics');

            // En desarrollo, usar estadísticas mock
            if (this.isDevelopment) {
                return await this.getMockStats();
            }

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
            
            // Fallback a datos mock
            if (!this.isDevelopment) {
                return await this.getMockStats();
            }
            
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Estadísticas mock
    async getMockStats() {
        await new Promise(resolve => setTimeout(resolve, 500));

        const stats = {
            overview: {
                total: 6,
                thisMonth: 4,
                today: 1,
                monthlyGrowth: 25.5,
            },
            platforms: {
                instagram: 4,
                tiktok: 3,
                youtube: 3,
            },
            nationalities: {
                chilena: 5,
                extranjera: 1,
            },
            locations: {
                santiago: 2,
                valparaiso: 2,
                concepcion: 1,
                antofagasta: 1,
            },
            ageRanges: {
                '18-24': 2,
                '25-34': 4,
                '35-44': 0,
                '45+': 0,
            },
            topInterests: {
                moda: 1,
                belleza: 1,
                tecnologia: 1,
                deporte: 1,
                gastronomia: 1,
            },
            lastUpdated: new Date().toISOString(),
        };

        return {
            success: true,
            stats,
        };
    }

    // Resto de métodos (crear, actualizar, eliminar) - mock para desarrollo
    async createCreator(creatorData) {
        if (this.isDevelopment) {
            // Simular creación
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newCreator = {
                id: Date.now(),
                ...creatorData,
                created_at: new Date().toISOString(),
                status: 'active',
                assigned_brand: null,
            };

            log('Mock creator created:', newCreator);
            
            return {
                success: true,
                creator: newCreator,
                message: 'Creator creado exitosamente (simulado)',
            };
        }

        // Código real para producción...
        // (implementar cuando se conecte al backend real)
        throw new Error('Create creator not implemented in production mode');
    }

    // Construir parámetros de consulta
    buildQueryParams(filters) {
        const params = {};

        if (filters.page) params.page = filters.page;
        if (filters.limit) params.limit = filters.limit;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        if (filters.sortOrder) params.sortOrder = filters.sortOrder;

        // Término de búsqueda
        if (filters.search) params.search = filters.search;

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

        return params;
    }

    // Filtrar creators localmente
    filterCreators(creators, filters) {
        return creators.filter(creator => {
            // Búsqueda por texto
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
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