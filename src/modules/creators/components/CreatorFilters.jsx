import React from 'react';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';
import { useCreatorExport } from '../hooks/index.js';

export const CreatorFilters = ({ filters }) => {
    const {
        selectedInterests,
        selectedPlatforms,
        ageRange,
        selectedNationality,
        selectedLocation,
        selectedModality,
        handleInterestToggle,
        handlePlatformToggle,
        setAgeRange,
        setSelectedNationality,
        setSelectedLocation,
        setSelectedModality,
        clearFilters,
        filterOptions,
        totalCreators,
        filteredCount,
        hasActiveFilters,
    } = filters;

    const { exporting, exportCreators } = useCreatorExport();

    const handleExport = async () => {
        const exportFilters = {
            interests: selectedInterests,
            platforms: selectedPlatforms,
            ageMin: ageRange.min,
            ageMax: ageRange.max,
            nationality: selectedNationality,
            location: selectedLocation,
            modality: selectedModality,
        };
        
        await exportCreators(exportFilters, 'csv');
    };

    return (
        <UI.Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
                {/* Intereses */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intereses
                    </label>
                    <UI.Select
                        value=""
                        onChange={(e) => {
                            if (e.target.value) {
                                handleInterestToggle(e.target.value);
                            }
                        }}
                    >
                        <option value="">
                            {selectedInterests.length > 0 
                                ? `${selectedInterests.length} seleccionados`
                                : 'Seleccionar intereses...'
                            }
                        </option>
                        {filterOptions.interests.map(interest => (
                            <option
                                key={interest}
                                value={interest}
                                disabled={selectedInterests.includes(interest)}
                            >
                                {formatters.formatInterests([interest])}
                            </option>
                        ))}
                    </UI.Select>
                    
                    {/* Mostrar intereses seleccionados */}
                    {selectedInterests.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {selectedInterests.map(interest => (
                                <UI.Badge
                                    key={interest}
                                    variant="purple"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => handleInterestToggle(interest)}
                                >
                                    {formatters.formatInterests([interest]).substring(0, 15)}
                                    <span className="ml-1">×</span>
                                </UI.Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Plataformas */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plataformas
                    </label>
                    <UI.Select
                        value=""
                        onChange={(e) => {
                            if (e.target.value) {
                                handlePlatformToggle(e.target.value);
                            }
                        }}
                    >
                        <option value="">
                            {selectedPlatforms.length > 0 
                                ? `${selectedPlatforms.length} seleccionadas`
                                : 'Seleccionar plataformas...'
                            }
                        </option>
                        {filterOptions.platforms.map(platform => (
                            <option
                                key={platform}
                                value={platform}
                                disabled={selectedPlatforms.includes(platform)}
                            >
                                {formatters.formatPlatform(platform)}
                            </option>
                        ))}
                    </UI.Select>
                    
                    {selectedPlatforms.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {selectedPlatforms.map(platform => (
                                <UI.Badge
                                    key={platform}
                                    variant="blue"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => handlePlatformToggle(platform)}
                                >
                                    {formatters.formatPlatform(platform)}
                                    <span className="ml-1">×</span>
                                </UI.Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edad */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rango de edad
                    </label>
                    <div className="flex space-x-2">
                        <UI.Input
                            type="number"
                            placeholder="Min"
                            value={ageRange.min}
                            onChange={(e) => setAgeRange(prev => ({ ...prev, min: e.target.value }))}
                            min="18"
                            max="80"
                        />
                        <UI.Input
                            type="number"
                            placeholder="Max"
                            value={ageRange.max}
                            onChange={(e) => setAgeRange(prev => ({ ...prev, max: e.target.value }))}
                            min="18"
                            max="80"
                        />
                    </div>
                </div>

                {/* Nacionalidad */}
                <UI.Select
                    label="Nacionalidad"
                    value={selectedNationality}
                    onChange={(e) => setSelectedNationality(e.target.value)}
                >
                    <option value="">Todas las nacionalidades</option>
                    {filterOptions.nationalities.map(nationality => (
                        <option key={nationality} value={nationality}>
                            {formatters.formatNationality(nationality)}
                        </option>
                    ))}
                </UI.Select>

                {/* Ubicación */}
                <UI.Select
                    label="Ubicación"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                >
                    <option value="">Todas las ubicaciones</option>
                    {filterOptions.locations.map(location => (
                        <option key={location} value={location}>
                            {formatters.formatLocation(location)}
                        </option>
                    ))}
                </UI.Select>
            </div>

            {/* Información y acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-600">
                        Mostrando {filteredCount} de {totalCreators} creators
                    </p>
                    {hasActiveFilters && (
                        <UI.Badge variant="purple">
                            Filtrado
                        </UI.Badge>
                    )}
                </div>
                
                <div className="flex items-center space-x-3">
                    {hasActiveFilters && (
                        <UI.Button
                            variant="secondary"
                            size="sm"
                            onClick={clearFilters}
                        >
                            Limpiar filtros
                        </UI.Button>
                    )}
                    <UI.Button
                        variant="primary"
                        size="sm"
                        onClick={handleExport}
                        loading={exporting}
                    >
                        Exportar
                    </UI.Button>
                </div>
            </div>
        </UI.Card>
    );
};