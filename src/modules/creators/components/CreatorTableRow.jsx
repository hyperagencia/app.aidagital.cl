/**
 * Fila individual de creator en tabla
 * Muestra información compacta del creator con acciones
 */

import React, { useState } from 'react';
import { UI } from '../../../components/ui/index.js';
import { TableCell } from '../../../components/ui/Table.jsx';
import { formatters } from '../../../utils/formatters.js';
import { useFavorites } from '../hooks/useFavorites.js';

/**
 * CreatorTableRow Component
 * Props:
 *  - creator: objeto con datos del creator
 *  - onViewDetails: (creator) => void (callback para abrir modal)
 *  - onFavoriteChange: (creatorId, isFavorite) => void (callback cuando cambia favorito)
 */
export const CreatorTableRow = ({ creator, onViewDetails, onFavoriteChange }) => {
    const [isFavorite, setIsFavorite] = useState(creator.is_favorite || false);
    const { toggleFavorite, loading } = useFavorites();

    const handleToggleFavorite = async () => {
        const result = await toggleFavorite(creator.id, isFavorite);
        if (result.success) {
            setIsFavorite(result.isFavorite);
            onFavoriteChange?.(creator.id, result.isFavorite);
        }
    };

    // Mapeo de iconos de redes sociales
    const platformIcons = {
        instagram: '📷',
        tiktok: '🎵',
        youtube: '🎥',
        facebook: '👥',
        twitter: '𝕏'
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            {/* Avatar */}
            <TableCell>
                <UI.Avatar name={creator.full_name} size="md" />
            </TableCell>

            {/* Nombre y Nacionalidad */}
            <TableCell>
                <div className="font-medium text-gray-900">{creator.full_name}</div>
                <div className="text-xs text-gray-500">
                    {formatters.formatNationality(creator.nationality)}
                </div>
            </TableCell>

            {/* Edad */}
            <TableCell>
                {creator.age ? `${creator.age} años` : '-'}
            </TableCell>

            {/* Favorito */}
            <TableCell>
                <button
                    onClick={handleToggleFavorite}
                    disabled={loading}
                    className={`p-2 rounded-full transition-colors ${
                        isFavorite
                            ? 'text-red-500 hover:text-red-600 bg-red-50'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                    {loading ? (
                        <UI.Spinner size="sm" />
                    ) : (
                        <span className="text-xl">
                            {isFavorite ? '❤️' : '🤍'}
                        </span>
                    )}
                </button>
            </TableCell>

            {/* Redes Sociales */}
            <TableCell>
                <div className="flex gap-2">
                    {creator.social_networks?.length > 0 ? (
                        creator.social_networks.map((network, index) =>
                            network.profile_link ? (
                                <a
                                    key={`${network.platform}-${index}`}
                                    href={network.profile_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xl hover:scale-110 transition-transform"
                                    title={formatters.formatPlatform(network.platform)}
                                    onClick={(e) => e.stopPropagation()} // Evitar que active otras acciones
                                >
                                    {platformIcons[network.platform] || '🔗'}
                                </a>
                            ) : null
                        )
                    ) : (
                        <span className="text-gray-400 text-sm">-</span>
                    )}
                </div>
            </TableCell>

            {/* Acciones */}
            <TableCell>
                <UI.Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(creator)}
                >
                    Ver más
                </UI.Button>
            </TableCell>
        </tr>
    );
};

export default CreatorTableRow;
