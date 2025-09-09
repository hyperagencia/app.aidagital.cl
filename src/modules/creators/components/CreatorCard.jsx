import React, { useState } from 'react';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';
import { useFavorites } from '../hooks/useFavorites.js';

export const CreatorCard = ({ creator, onEdit, onDelete, onAssignBrand, onFavoriteChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(creator.is_favorite || false);
    const { toggleFavorite, loading: favoriteLoading } = useFavorites();

    const handleToggleFavorite = async () => {
        const result = await toggleFavorite(creator.id, isFavorite);
        
        if (result.success) {
            setIsFavorite(result.isFavorite);
            // Notificar al componente padre si existe la función
            onFavoriteChange?.(creator.id, result.isFavorite);
        }
        // El error se maneja automáticamente por el hook useFavorites
    };

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
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {creator.full_name}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {creator.age} años, {formatters.formatNationality(creator.nationality)}
                                    </p>
                                </div>
                                
                                {/* Botón de favorito */}
                                <button
                                    onClick={handleToggleFavorite}
                                    disabled={favoriteLoading}
                                    className={`ml-2 p-2 rounded-full transition-colors ${
                                        isFavorite 
                                            ? 'text-red-500 hover:text-red-600 bg-red-50' 
                                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                    } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                >
                                    {favoriteLoading ? (
                                        <UI.Spinner size="sm" />
                                    ) : (
                                        <span className="text-xl">
                                            {isFavorite ? '❤️' : '🤍'}
                                        </span>
                                    )}
                                </button>
                            </div>
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
                    {creator.social_networks && creator.social_networks.length > 0 ? (
                        <div className="space-y-2">
                            {creator.social_networks.map((network, index) => (
                                <div key={`${network.platform}-${index}`} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        {formatters.formatPlatform(network.platform)}
                                    </span>
                                    {network.profile_link ? (
                                        <a
                                            href={network.profile_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                        >
                                            Ver
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Sin enlace</span>
                                    )}
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