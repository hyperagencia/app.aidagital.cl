/**
 * Componentes de Creators
 */

import React, { useState } from 'react';
import { useCreators, useCreatorFilters, useCreatorExport } from '../hooks/index.js';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';
import { config } from '../../../services/config.js';

// Componente de barra de búsqueda
export const SearchBar = ({ searchTerm, onSearchChange, placeholder = "Buscar por nombre o email..." }) => {
    return (
        <UI.Card className="mb-6">
            <div className="relative">
                <UI.Input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-12 text-lg py-4"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                    
                </div>
            </div>
        </UI.Card>
    );
};

// Componente de filtros
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
                        icon="📊"
                    >
                        Exportar
                    </UI.Button>
                </div>
            </div>
        </UI.Card>
    );
};

// Componente de card de creator
export const CreatorCard = ({ creator, onEdit, onDelete, onAssignBrand }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <UI.Card hover className="transition-all duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Columna 1: Info básica */}
                <div>
                    <div className="flex items-start space-x-3 mb-3">
                        <UI.Avatar 
                            name={creator.full_name} 
                            size="lg"
                        />
                        
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {creator.full_name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {creator.age} años, {formatters.formatNationality(creator.nationality)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-sm space-y-1">
                        <p className="font-medium text-gray-700">Contacto</p>
                        <p className="text-gray-600">{creator.email}</p>
                        <p className="text-gray-600">{formatters.formatPhone(creator.phone)}</p>
                    </div>
                </div>

                {/* Columna 2: Intereses */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-2">Intereses</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {formatters.formatInterests(creator.interests)}
                    </p>
                </div>

                {/* Columna 3: Plataformas */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-2">Plataformas</h4>
                    {creator.platforms && creator.platforms.length > 0 ? (
                        <div className="space-y-2">
                            {creator.platforms.map((platform, index) => (
                                <div key={`${platform}-${index}`} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        {formatters.formatPlatform(platform)}
                                    </span>
                                    <a
                                        href="#"
                                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                    >
                                        Ver
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Sin plataformas registradas</p>
                    )}
                </div>

                {/* Columna 4: Acciones */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-2">Acciones</h4>
                    <div className="space-y-2">
                        <UI.Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() => onEdit?.(creator)}
                        >
                            Editar
                        </UI.Button>
                        <UI.Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => onAssignBrand?.(creator)}
                        >
                            Asignar Marca
                        </UI.Button>
                        <button
                            className="text-gray-400 hover:text-gray-600 text-sm w-full text-right"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? '▲ Menos' : '▼ Más'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Información expandida */}
            {isExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <span className="font-medium text-gray-700 text-sm">Ubicación</span>
                        <p className="text-gray-600 text-sm mt-1">
                            {formatters.formatLocation(creator.location)}
                        </p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700 text-sm">Modalidad</span>
                        <p className="text-gray-600 text-sm mt-1">
                            {formatters.formatModality(creator.modality)}
                        </p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700 text-sm">Registrado</span>
                        <p className="text-gray-600 text-sm mt-1">
                            {formatters.formatTimeAgo(creator.created_at)}
                        </p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700 text-sm">Estado</span>
                        <UI.Badge variant="green" size="sm" className="mt-1">
                            Activo
                        </UI.Badge>
                    </div>
                </div>
            )}
        </UI.Card>
    );
};

// Componente de estado vacío
export const EmptyState = ({ hasFilters, onClearFilters }) => {
    return (
        <UI.Card className="p-12 text-center">
            <div className="text-6xl mb-4">
                {hasFilters ? '🔍' : '👥'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {hasFilters ? 'No se encontraron creators' : 'No hay creators registrados'}
            </h3>
            <p className="text-gray-600 mb-6">
                {hasFilters 
                    ? 'Intenta ajustar los filtros o la búsqueda'
                    : 'Los creators que se registren aparecerán aquí'
                }
            </p>
            {hasFilters && (
                <UI.Button
                    variant="primary"
                    onClick={onClearFilters}
                >
                    Limpiar todos los filtros
                </UI.Button>
            )}
        </UI.Card>
    );
};

// Componente de lista de creators
export const CreatorsList = ({ creators, loading, error, onRefresh }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <UI.Card key={index} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="flex items-start space-x-3">
                                <UI.Skeleton width="w-12" height="h-12" className="rounded-full" />
                                <div className="flex-1">
                                    <UI.Skeleton width="w-32" height="h-5" className="mb-2" />
                                    <UI.Skeleton width="w-24" height="h-4" />
                                </div>
                            </div>
                            <div>
                                <UI.Skeleton width="w-20" height="h-4" className="mb-2" />
                                <UI.Skeleton width="w-full" height="h-4" />
                            </div>
                            <div>
                                <UI.Skeleton width="w-24" height="h-4" className="mb-2" />
                                <UI.Skeleton width="w-full" height="h-4" />
                            </div>
                            <div>
                                <UI.Skeleton width="w-20" height="h-4" className="mb-2" />
                                <UI.Skeleton width="w-full" height="h-8" />
                            </div>
                        </div>
                    </UI.Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <UI.Card className="p-8 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Error al cargar creators
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <UI.Button
                    variant="primary"
                    onClick={onRefresh}
                >
                    Reintentar
                </UI.Button>
            </UI.Card>
        );
    }

    return (
        <div className="space-y-4">
            {creators.map(creator => (
                <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onEdit={(creator) => console.log('Edit creator:', creator)}
                    onDelete={(creator) => console.log('Delete creator:', creator)}
                    onAssignBrand={(creator) => console.log('Assign brand:', creator)}
                />
            ))}
        </div>
    );
};

// Página principal de creators
export const CreatorsPage = () => {
    const { creators, loading, error, refresh } = useCreators();
    const filters = useCreatorFilters(creators);

    return (
        <div className="flex-1 bg-gray-50 overflow-auto">
            <div className="p-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Creators
                    </h1>
                    <p className="text-gray-600">
                        Gestiona y filtra tu base de creators registrados
                    </p>
                </div>

                {/* Búsqueda */}
                <SearchBar
                    searchTerm={filters.searchTerm}
                    onSearchChange={filters.setSearchTerm}
                />

                {/* Filtros */}
                <CreatorFilters filters={filters} />

                {/* Lista de creators */}
                {filters.filteredCreators.length === 0 ? (
                    <EmptyState 
                        hasFilters={filters.hasActiveFilters}
                        onClearFilters={filters.clearFilters}
                    />
                ) : (
                    <CreatorsList
                        creators={filters.filteredCreators}
                        loading={loading}
                        error={error}
                        onRefresh={refresh}
                    />
                )}
            </div>
        </div>
    );
};

// Exportar todos los componentes
export const creatorsComponents = {
    SearchBar,
    CreatorFilters,
    CreatorCard,
    EmptyState,
    CreatorsList,
    CreatorsPage,
};

export default creatorsComponents;