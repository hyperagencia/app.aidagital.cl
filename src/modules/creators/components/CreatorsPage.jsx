/**
 * Página de Creators
 * MODIFICADA para usar hooks separados con búsqueda global
 */

import React from 'react';
import { useCreators } from '../hooks/index.js';
import { SearchBar } from './SearchBar.jsx';
import { CreatorFilters } from './CreatorFilters.jsx';
import { CreatorsList } from './CreatorsList.jsx';
import { EmptyState } from './EmptyState.jsx';

export const CreatorsPage = () => {
    // ✅ Hook principal con búsqueda global
    const { 
        creators, 
        loading, 
        loadingMore, 
        error, 
        hasMore, 
        refresh, 
        loadMore,
        searchTerm,     // ✅ Término de búsqueda del hook
        updateSearch    // ✅ Función para actualizar búsqueda
    } = useCreators();

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

                {/* ✅ MODIFICADO: Búsqueda conectada con el backend */}
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={updateSearch}
                    placeholder="Buscar por nombre o email en toda la base de datos..."
                />

                {/* ✅ NUEVO: Indicador visual de búsqueda activa */}
                {searchTerm && (
                    <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-purple-700 font-medium">
                                    🔍 Buscando: "{searchTerm}"
                                </span>
                                <span className="text-purple-600 text-sm">
                                    {loading ? 'Buscando...' : `${creators.length} resultado(s)`}
                                </span>
                            </div>
                            <button
                                onClick={handleClearSearch}
                                className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                            >
                                Limpiar búsqueda ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de creators */}
                {creators.length === 0 && !loading ? (
                    <EmptyState 
                        hasFilters={!!searchTerm}
                        onClearFilters={handleClearSearch}
                    />
                ) : (
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
                )}
            </div>
        </div>
    );
};