/**
 * Hooks de Creators
 * Hooks personalizados para manejo de creators
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { creatorsService } from '../services/creatorsService.js';
import { config, log } from '../../../services/config.js';

// Hook principal para obtener creators
// Hook principal para obtener creators con paginación
export const useCreators = (initialFilters = {}) => {
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Función para cargar creators (inicial o nueva búsqueda)
    const fetchCreators = useCallback(async (newFilters = filters, reset = true) => {
        try {
            if (reset) {
                setLoading(true);
                setCurrentPage(1);
            }
            setError(null);
            
            const queryFilters = {
                ...newFilters,
                page: reset ? 1 : currentPage,
                limit: 20
            };
            
            const result = await creatorsService.getCreators(queryFilters);
            
            if (result.success) {
                if (reset) {
                    setCreators(result.creators);
                } else {
                    setCreators(prev => [...prev, ...result.creators]);
                }
                
                setPagination(result.pagination);
                
                // Determinar si hay más páginas
                if (result.pagination) {
                    setHasMore(result.pagination.page < result.pagination.pages);
                } else {
                    // Si no hay paginación, asumir que no hay más
                    setHasMore(false);
                }
                
                log(`Loaded ${result.creators.length} creators (page ${queryFilters.page})`);
            }
        } catch (error) {
            setError(error.message);
            log('Error loading creators:', error.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, currentPage]);

    // Función para cargar más creators
    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore) return;
        
        try {
            setLoadingMore(true);
            setError(null);
            
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            
            const queryFilters = {
                ...filters,
                page: nextPage,
                limit: 20
            };
            
            const result = await creatorsService.getCreators(queryFilters);
            
            if (result.success) {
                setCreators(prev => [...prev, ...result.creators]);
                setPagination(result.pagination);
                
                // Verificar si hay más páginas
                if (result.pagination) {
                    setHasMore(nextPage < result.pagination.pages);
                } else {
                    setHasMore(false);
                }
                
                log(`Loaded ${result.creators.length} more creators (page ${nextPage})`);
            }
        } catch (error) {
            setError(error.message);
            log('Error loading more creators:', error.message);
        } finally {
            setLoadingMore(false);
        }
    }, [filters, currentPage, hasMore, loadingMore]);

    // Cargar creators al montar o cambiar filtros
    useEffect(() => {
        fetchCreators(filters, true);
    }, [JSON.stringify(filters)]); // Usar JSON.stringify para comparación profunda

    // Función para actualizar filtros
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPage(1);
        setHasMore(true);
    }, []);

    // Función para limpiar filtros
    const clearFilters = useCallback(() => {
        setFilters({});
        setCurrentPage(1);
        setHasMore(true);
    }, []);

    // Función para refrescar datos
    const refresh = useCallback(() => {
        fetchCreators(filters, true);
    }, [fetchCreators, filters]);

    return {
        creators,
        loading,
        loadingMore,
        error,
        pagination,
        filters,
        hasMore,
        currentPage,
        updateFilters,
        clearFilters,
        refresh,
        fetchCreators,
        loadMore,
    };
};

// Hook para filtros de creators
export const useCreatorFilters = (creators = []) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [ageRange, setAgeRange] = useState({ min: '', max: '' });
    const [selectedNationality, setSelectedNationality] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedModality, setSelectedModality] = useState('');

    // Generar opciones de filtros dinámicamente
    const filterOptions = useMemo(() => {
        const interests = new Set();
        const platforms = new Set();
        const nationalities = new Set();
        const locations = new Set();
        const modalities = new Set();

        creators.forEach(creator => {
            if (creator.interests) {
                creator.interests.forEach(interest => interests.add(interest));
            }
            if (creator.platforms) {
                creator.platforms.forEach(platform => platforms.add(platform));
            }
            if (creator.nationality) {
                nationalities.add(creator.nationality);
            }
            if (creator.location) {
                locations.add(creator.location);
            }
            if (creator.modality) {
                modalities.add(creator.modality);
            }
        });

        return {
            interests: Array.from(interests).sort(),
            platforms: Array.from(platforms).sort(),
            nationalities: Array.from(nationalities).sort(),
            locations: Array.from(locations).sort(),
            modalities: Array.from(modalities).sort(),
        };
    }, [creators]);

    // Aplicar filtros
    const filteredCreators = useMemo(() => {
        const filters = {
            searchTerm,
            interests: selectedInterests,
            platforms: selectedPlatforms,
            ageMin: ageRange.min,
            ageMax: ageRange.max,
            nationality: selectedNationality,
            location: selectedLocation,
            modality: selectedModality,
        };

        return creatorsService.filterCreators(creators, filters);
    }, [
        creators, 
        searchTerm, 
        selectedInterests, 
        selectedPlatforms, 
        ageRange, 
        selectedNationality, 
        selectedLocation,
        selectedModality
    ]);

    // Funciones para manejar filtros
    const handleInterestToggle = useCallback((interest) => {
        setSelectedInterests(prev => 
            prev.includes(interest) 
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    }, []);

    const handlePlatformToggle = useCallback((platform) => {
        setSelectedPlatforms(prev => 
            prev.includes(platform) 
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    }, []);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedInterests([]);
        setSelectedPlatforms([]);
        setAgeRange({ min: '', max: '' });
        setSelectedNationality('');
        setSelectedLocation('');
        setSelectedModality('');
    }, []);

    // Verificar si hay filtros activos
    const hasActiveFilters = useMemo(() => {
        return searchTerm || 
               selectedInterests.length > 0 || 
               selectedPlatforms.length > 0 ||
               ageRange.min || 
               ageRange.max ||
               selectedNationality || 
               selectedLocation ||
               selectedModality;
    }, [
        searchTerm, 
        selectedInterests, 
        selectedPlatforms, 
        ageRange, 
        selectedNationality, 
        selectedLocation,
        selectedModality
    ]);

    return {
        // Estados
        searchTerm,
        selectedInterests,
        selectedPlatforms,
        ageRange,
        selectedNationality,
        selectedLocation,
        selectedModality,
        
        // Setters
        setSearchTerm,
        setSelectedInterests,
        setSelectedPlatforms,
        setAgeRange,
        setSelectedNationality,
        setSelectedLocation,
        setSelectedModality,
        
        // Handlers
        handleInterestToggle,
        handlePlatformToggle,
        clearFilters,
        
        // Datos
        filterOptions,
        filteredCreators,
        hasActiveFilters,
        
        // Stats
        totalCreators: creators.length,
        filteredCount: filteredCreators.length,
    };
};

// Hook para acciones de creators
export const useCreatorActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Crear creator
    const createCreator = useCallback(async (creatorData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.createCreator(creatorData);
            
            if (result.success) {
                setSuccess(true);
                log('Creator created successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar creator
    const updateCreator = useCallback(async (id, creatorData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.updateCreator(id, creatorData);
            
            if (result.success) {
                setSuccess(true);
                log('Creator updated successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar creator
    const deleteCreator = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.deleteCreator(id);
            
            if (result.success) {
                setSuccess(true);
                log('Creator deleted successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar múltiples creators
    const deleteMultipleCreators = useCallback(async (ids) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.deleteMultipleCreators(ids);
            
            if (result.success) {
                setSuccess(true);
                log(`${ids.length} creators deleted successfully`);
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Asignar marca
    const assignBrand = useCallback(async (creatorId, brandId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.assignBrand(creatorId, brandId);
            
            if (result.success) {
                setSuccess(true);
                log('Brand assigned successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Desasignar marca
    const unassignBrand = useCallback(async (creatorId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.unassignBrand(creatorId);
            
            if (result.success) {
                setSuccess(true);
                log('Brand unassigned successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Limpiar mensajes
    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return {
        // Estados
        loading,
        error,
        success,
        
        // Acciones
        createCreator,
        updateCreator,
        deleteCreator,
        deleteMultipleCreators,
        assignBrand,
        unassignBrand,
        
        // Utilidades
        clearMessages,
    };
};

// Hook para búsqueda de creators
export const useCreatorSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const search = useCallback(async (term, filters = {}) => {
        if (!term.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            setSearchError(null);
            
            const result = await creatorsService.searchCreators(term, filters);
            
            if (result.success) {
                setSearchResults(result.creators);
                setSearchTerm(term);
            }
        } catch (error) {
            setSearchError(error.message);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setSearchResults([]);
        setSearchError(null);
    }, []);

    return {
        searchTerm,
        searchResults,
        searching,
        searchError,
        search,
        clearSearch,
    };
};

// Hook para exportar creators
export const useCreatorExport = () => {
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState(null);

    const exportCreators = useCallback(async (filters = {}, format = 'csv') => {
        try {
            setExporting(true);
            setExportError(null);
            
            const result = await creatorsService.exportCreators(filters, format);
            
            if (result.success) {
                // Si hay URL de descarga, usarla
                if (result.downloadUrl) {
                    window.open(result.downloadUrl, '_blank');
                } else if (result.data) {
                    // Crear archivo localmente
                    const blob = new Blob([result.data], { 
                        type: format === 'csv' ? 'text/csv' : 'application/json' 
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = result.filename || `creators.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
                
                log('Export completed successfully');
                return { success: true };
            }
        } catch (error) {
            setExportError(error.message);
            return { success: false, message: error.message };
        } finally {
            setExporting(false);
        }
    }, []);

    return {
        exporting,
        exportError,
        exportCreators,
    };
};

// Exportar todos los hooks
export const creatorsHooks = {
    useCreators,
    useCreatorFilters,
    useCreatorActions,
    useCreatorSearch,
    useCreatorExport,
};

export default creatorsHooks;