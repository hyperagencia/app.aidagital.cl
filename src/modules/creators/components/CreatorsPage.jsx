import React from 'react';
import { useCreators, useCreatorFilters } from '../hooks/index.js';
import { SearchBar } from './SearchBar.jsx';
import { CreatorFilters } from './CreatorFilters.jsx';
import { CreatorsList } from './CreatorsList.jsx';
import { EmptyState } from './EmptyState.jsx';

export const CreatorsPage = () => {
    const { 
        creators, 
        loading, 
        loadingMore, 
        error, 
        hasMore, 
        refresh, 
        loadMore 
    } = useCreators();
    
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
                {filters.filteredCreators.length === 0 && !loading ? (
                    <EmptyState 
                        hasFilters={filters.hasActiveFilters}
                        onClearFilters={filters.clearFilters}
                    />
                ) : (
                    <CreatorsList
                        creators={filters.filteredCreators}
                        loading={loading}
                        loadingMore={loadingMore}
                        error={error}
                        hasMore={hasMore}
                        onRefresh={refresh}
                        onLoadMore={loadMore}
                    />
                )}
            </div>
        </div>
    );
};