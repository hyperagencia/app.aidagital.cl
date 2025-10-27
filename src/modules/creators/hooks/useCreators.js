/**
 * useCreators Hook
 * Hook principal para obtener creators con paginación y búsqueda global
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { creatorsService } from '../services/creatorsService.js';
import { log } from '../../../services/config.js';

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
    const fetchCreators = useCallback(async (newFilters = filters, reset = true) => {
        try {
            if (reset) {
                setLoading(true);
                setCurrentPage(1);
            } else {
                setLoadingMore(true);
            }
            setError(null);

            // ✅ MODIFICADO: Incluir término de búsqueda en los filtros
            const queryFilters = {
                ...newFilters,
                page: reset ? 1 : currentPage,
                limit: 20,
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
    }, [filters, currentPage, debouncedSearch]);

    // Función para cargar más creators
    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore) return;

        try {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);

            // Usar fetchCreators con reset=false para agregar a la lista existente
            await fetchCreators(filters, false);
        } catch (error) {
            setError(error.message);
            log('Error loading more creators:', error.message);
        }
    }, [filters, currentPage, hasMore, loadingMore, fetchCreators]);

    // ✅ MODIFICADO: Cargar creators cuando cambie búsqueda debounced o filtros
    useEffect(() => {
        fetchCreators(filters, true);
    }, [debouncedSearch, JSON.stringify(filters)]);

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