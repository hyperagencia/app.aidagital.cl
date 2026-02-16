/**
 * Tabla específica para listar creators
 * Vista compacta alternativa a CreatorsList
 */

import React, { useState } from 'react';
import { UI, Table, TableHeader, TableBody, TableCell, TableSkeleton } from '../../../components/ui/index.js';
import { CreatorTableRow } from './CreatorTableRow.jsx';
import { CreatorDetailsModal } from './CreatorDetailsModal.jsx';

/**
 * CreatorsTable Component
 * Props:
 *  - creators: array de creators
 *  - loading: boolean (primera carga)
 *  - loadingMore: boolean (cargando más datos)
 *  - error: string | null (mensaje de error)
 *  - hasMore: boolean (hay más datos para cargar)
 *  - onRefresh: () => void (callback para refrescar)
 *  - onLoadMore: () => void (callback para cargar más)
 *  - onFavoriteChange: (creatorId, isFavorite) => void (callback cuando cambia favorito)
 */
export const CreatorsTable = ({
    creators,
    loading,
    loadingMore,
    error,
    hasMore,
    onRefresh,
    onLoadMore,
    onFavoriteChange
}) => {
    const [selectedCreator, setSelectedCreator] = useState(null);

    // Estado de loading inicial
    if (loading) {
        return <TableSkeleton rows={10} />;
    }

    // Estado de error
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
        <>
            {/* Tabla de creators */}
            <Table>
                <TableHeader>
                    <TableCell header>Avatar</TableCell>
                    <TableCell header>Nombre</TableCell>
                    <TableCell header>Edad</TableCell>
                    <TableCell header>Favorito</TableCell>
                    <TableCell header>Redes Sociales</TableCell>
                    <TableCell header>Acciones</TableCell>
                </TableHeader>

                <TableBody>
                    {creators.map(creator => (
                        <CreatorTableRow
                            key={creator.id}
                            creator={creator}
                            onViewDetails={setSelectedCreator}
                            onFavoriteChange={onFavoriteChange}
                        />
                    ))}
                </TableBody>
            </Table>

            {/* Loading more skeleton */}
            {loadingMore && (
                <div className="mt-4">
                    <TableSkeleton rows={5} />
                </div>
            )}

            {/* Botón cargar más */}
            {hasMore && !loadingMore && (
                <div className="flex justify-center pt-6">
                    <UI.Button
                        variant="secondary"
                        size="lg"
                        onClick={onLoadMore}
                        className="px-8 py-3"
                    >
                        Cargar más creators
                    </UI.Button>
                </div>
            )}

            {/* Mensaje de final */}
            {!hasMore && creators.length > 0 && (
                <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">
                        Has visto todos los creators disponibles ({creators.length} total)
                    </p>
                </div>
            )}

            {/* Modal de detalles */}
            {selectedCreator && (
                <CreatorDetailsModal
                    creator={selectedCreator}
                    isOpen={!!selectedCreator}
                    onClose={() => setSelectedCreator(null)}
                />
            )}
        </>
    );
};

export default CreatorsTable;
