/**
 * Página de Creators
 * MODIFICADA para usar hooks separados con búsqueda global
 * Incluye toggle entre vista Grid (Cards) y Tabla
 */

import React, { useState } from 'react';
import { useCreators, useCreatorFilters } from '../hooks/index.js';
import { SearchBar } from './SearchBar.jsx';
import { CreatorFilters } from './CreatorFilters.jsx';
import { CreatorsList } from './CreatorsList.jsx';
import { CreatorsTable } from './CreatorsTable.jsx';
import { ViewToggle } from './ViewToggle.jsx';
import { EmptyState } from './EmptyState.jsx';

export const CreatorsPage = () => {
    // ✅ Estado de vista (grid o table) - Siempre empieza en 'grid'
    const [viewType, setViewType] = useState('grid');

    // ✅ Hook principal con búsqueda global
    const {
        creators,
        loading,
        loadingMore,
        error,
        pagination,     // ✅ Datos de paginación (total, page, pages)
        hasMore,
        refresh,
        loadMore,
        searchTerm,     // ✅ Término de búsqueda del hook
        updateSearch,   // ✅ Función para actualizar búsqueda
        updateFilters,  // ✅ Función para actualizar filtros
        clearFilters: clearAllFilters // ✅ Función para limpiar filtros
    } = useCreators();

    // ✅ Hook para manejar filtros avanzados
    const filters = useCreatorFilters(updateFilters, clearAllFilters);

    // Manejar cambios de favoritos
    const handleFavoriteChange = (creatorId, isFavorite) => {
        console.log(`Creator ${creatorId} favorite status changed to:`, isFavorite);
        // Opcional: refresh() para recargar la lista
    };

    // ✅ Función para limpiar búsqueda
    const handleClearSearch = () => {
        updateSearch('');
    };

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

                {/* ✅ MODIFICADO: Búsqueda conectada con el backend + Toggle de vistas */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                        <SearchBar
                            searchTerm={searchTerm}
                            onSearchChange={updateSearch}
                            placeholder="Buscar por nombre o email en toda la base de datos..."
                        />
                    </div>
                    <ViewToggle viewType={viewType} onViewChange={setViewType} />
                </div>

                {/* ✅ Filtros avanzados: edad, intereses, plataforma, nacionalidad */}
                <CreatorFilters
                    filters={{
                        ...filters,
                        totalCreators: creators.length,
                        filteredCount: creators.length
                    }}
                />

                {/* ✅ Indicador visual de búsqueda/filtros activos */}
                {(searchTerm || filters.hasActiveFilters) && (
                    <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {searchTerm && (
                                    <span className="text-purple-700 font-medium">
                                        🔍 Buscando: "{searchTerm}"
                                    </span>
                                )}
                                {filters.hasActiveFilters && (
                                    <span className="text-purple-700 font-medium">
                                        {searchTerm ? '|' : '🎯'} Filtros aplicados
                                    </span>
                                )}
                                <span className="text-purple-600 text-sm">
                                    {loading ? 'Buscando...' :
                                     pagination?.total
                                        ? `${pagination.total} resultado(s) total, mostrando ${creators.length}`
                                        : `${creators.length} resultado(s)`
                                    }
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    handleClearSearch();
                                    filters.clearFilters();
                                }}
                                className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                            >
                                Limpiar todo ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* ✅ MODIFICADO: Renderizar condicionalmente según viewType */}
                {creators.length === 0 && !loading ? (
                    <EmptyState
                        hasFilters={!!searchTerm || filters.hasActiveFilters}
                        onClearFilters={() => {
                            handleClearSearch();
                            filters.clearFilters();
                        }}
                    />
                ) : (
                    viewType === 'grid' ? (
                        <CreatorsList
                            creators={creators}
                            loading={loading}
                            loadingMore={loadingMore}
                            error={error}
                            hasMore={hasMore}
                            onRefresh={refresh}
                            onLoadMore={loadMore}
                            onFavoriteChange={handleFavoriteChange}
                        />
                    ) : (
                        <CreatorsTable
                            creators={creators}
                            loading={loading}
                            loadingMore={loadingMore}
                            error={error}
                            hasMore={hasMore}
                            onRefresh={refresh}
                            onLoadMore={loadMore}
                            onFavoriteChange={handleFavoriteChange}
                        />
                    )
                )}
            </div>
        </div>
    );
};