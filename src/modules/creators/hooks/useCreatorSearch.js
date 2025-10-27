/**
 * useCreatorSearch Hook
 * Hook para búsqueda de creators
 * NOTA: Este hook es para búsquedas específicas, el useCreators ya incluye búsqueda global
 */

import { useState, useCallback } from 'react';
import { creatorsService } from '../services/creatorsService.js';

/**
 * Hook para búsqueda de creators
 * Alternativa al sistema de búsqueda integrado en useCreators
 */
export const useCreatorSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Realizar búsqueda
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

    // Limpiar búsqueda
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