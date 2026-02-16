/**
 * useCreators Hook
 * Hook principal para obtener creators con paginación y búsqueda global
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { creatorsService } from '../services/creatorsService.js';
import { config, log } from '../../../services/config.js';

/**
 * Hook para obtener y gestionar creators
 * ✅ INCLUYE: Búsqueda global en backend con debounce
 */
export const useCreators = (initialFilters = {}) => {
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    // ✅ NUEVO: Estado para término de búsqueda con debounce
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const debounceTimeout = useRef(null);
    const fetchCreatorsRef = useRef(null);

    // ✅ NUEVO: Efecto para implementar debounce en la búsqueda
    useEffect(() => {
        // Limpiar timeout anterior
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Establecer nuevo timeout de 500ms
        debounceTimeout.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            log('Search term debounced:', searchTerm);
        }, 500);

        // Cleanup
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [searchTerm]);

    // Función para cargar creators (inicial o nueva búsqueda)
    const fetchCreators = useCallback(async (reset = true, pageOverride = null) => {
        try {
            if (reset) {
                setLoading(true);
                setCurrentPage(1);
            } else {
                setLoadingMore(true);
            }
            setError(null);

            // ✅ MODIFICADO: Usar pageOverride si se proporciona, sino usar currentPage
            const pageToFetch = pageOverride !== null ? pageOverride : (reset ? 1 : currentPage);

            // ✅ MODIFICADO: Incluir término de búsqueda en los filtros
            const queryFilters = {
                ...filters,
                page: pageToFetch,
                limit: config.PAGINATION_SIZE, // ✅ Usar configuración centralizada (50 creators por página)
                search: debouncedSearch.trim() || undefined // ✅ Agregar búsqueda
            };

            // Limpiar valores undefined
            const cleanFilters = Object.fromEntries(
                Object.entries(queryFilters).filter(([_, value]) => value !== undefined)
            );

            log('Fetching creators with filters:', cleanFilters);

            const result = await creatorsService.getCreators(cleanFilters);

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
                    setHasMore(false);
                }

                log(`Loaded ${result.creators.length} creators (page ${cleanFilters.page})`);
            }
        } catch (error) {
            setError(error.message);
            log('Error loading creators:', error.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, debouncedSearch]);

    // Mantener referencia actualizada de fetchCreators para loadMore
    useEffect(() => {
        fetchCreatorsRef.current = fetchCreators;
    }, [fetchCreators]);

    // Función para cargar más creators
    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore) return;

        try {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);

            // ✅ FIX: Usar ref para siempre tener la versión más reciente de fetchCreators
            await fetchCreatorsRef.current(false, nextPage);
        } catch (error) {
            setError(error.message);
            log('Error loading more creators:', error.message);
        }
    }, [currentPage, hasMore, loadingMore]);

    // ✅ MODIFICADO: Cargar creators cuando cambie búsqueda debounced o filtros
    // Usar un efecto separado que se ejecute cuando cambien los filtros o la búsqueda
    useEffect(() => {
        log('Filters or search changed, fetching creators...', { filters, debouncedSearch });
        fetchCreators(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, debouncedSearch]);

    // Función para actualizar filtros
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPage(1);
        setHasMore(true);
    }, []);

    // ✅ NUEVO: Función para actualizar término de búsqueda
    const updateSearch = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(1);
        setHasMore(true);
    }, []);

    // Función para limpiar filtros
    const clearFilters = useCallback(() => {
        setFilters({});
        setSearchTerm(''); // ✅ También limpiar búsqueda
        setCurrentPage(1);
        setHasMore(true);
    }, []);

    // Función para refrescar datos
    const refresh = useCallback(() => {
        fetchCreators(true);
    }, [fetchCreators]);

    return {
        creators,
        loading,
        loadingMore,
        error,
        pagination,
        filters,
        hasMore,
        currentPage,
        searchTerm,         // ✅ Exportar searchTerm
        debouncedSearch,    // ✅ Exportar debouncedSearch
        updateFilters,
        updateSearch,       // ✅ Exportar función para actualizar búsqueda
        clearFilters,
        refresh,
        fetchCreators,
        loadMore,
    };
};