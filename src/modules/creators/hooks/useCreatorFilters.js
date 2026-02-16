/**
 * useCreatorFilters Hook
 * Hook para manejar filtros de creators
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Hook para filtros de creators
 * NOTA: Este hook trabaja con updateFilters del hook useCreators
 * para enviar los filtros al servidor
 */
export const useCreatorFilters = (updateFilters, clearFiltersCallback) => {
    // ✅ Removido searchTerm - se maneja directamente en useCreators
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [ageRange, setAgeRange] = useState({ min: '', max: '' });
    const [selectedNationality, setSelectedNationality] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedModality, setSelectedModality] = useState('');

    // Opciones de filtros estáticas (se pueden cargar dinámicamente desde el servidor en el futuro)
    const filterOptions = useMemo(() => ({
        interests: ['moda', 'belleza', 'lifestyle', 'tecnologia', 'gaming', 'educacion',
                   'baile', 'musica', 'entretenimiento', 'deporte', 'fitness', 'nutricion',
                   'gastronomia', 'cocina', 'recetas', 'comedia', 'viral'],
        platforms: ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'twitch'],
        nationalities: ['chilena', 'extranjera'],
        locations: ['santiago', 'valparaiso', 'concepcion', 'antofagasta', 'la-serena', 'temuco'],
        modalities: ['presencial', 'remoto', 'hibrido'],
    }), []);

    // Actualizar filtros en el servidor cuando cambian los valores
    useEffect(() => {
        const filters = {
            // ✅ searchTerm removido - se maneja en useCreators directamente
            interests: selectedInterests.length > 0 ? selectedInterests : undefined,
            platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
            ageMin: ageRange.min || undefined,
            ageMax: ageRange.max || undefined,
            nationality: selectedNationality || undefined,
            location: selectedLocation || undefined,
            modality: selectedModality || undefined,
        };

        // Limpiar valores undefined para no enviarlos al servidor
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
        );

        updateFilters(cleanFilters);
    }, [
        // ✅ searchTerm removido de las dependencias
        selectedInterests,
        selectedPlatforms,
        ageRange,
        selectedNationality,
        selectedLocation,
        selectedModality,
        updateFilters
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
        // ✅ searchTerm removido - se maneja en useCreators
        setSelectedInterests([]);
        setSelectedPlatforms([]);
        setAgeRange({ min: '', max: '' });
        setSelectedNationality('');
        setSelectedLocation('');
        setSelectedModality('');

        // También limpiar filtros en el servidor
        if (clearFiltersCallback) {
            clearFiltersCallback();
        }
    }, [clearFiltersCallback]);

    // Verificar si hay filtros activos
    const hasActiveFilters = useMemo(() => {
        return selectedInterests.length > 0 ||
               selectedPlatforms.length > 0 ||
               ageRange.min ||
               ageRange.max ||
               selectedNationality ||
               selectedLocation ||
               selectedModality;
    }, [
        // ✅ searchTerm removido de las dependencias
        selectedInterests,
        selectedPlatforms,
        ageRange,
        selectedNationality,
        selectedLocation,
        selectedModality
    ]);

    return {
        // Estados (searchTerm removido)
        selectedInterests,
        selectedPlatforms,
        ageRange,
        selectedNationality,
        selectedLocation,
        selectedModality,

        // Setters (setSearchTerm removido)
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
        hasActiveFilters,
    };
};