import React from 'react';
import { UI } from '../../../components/ui/index.js';
import { CreatorCard } from './CreatorCard.jsx';

export const CreatorsList = ({ 
    creators, 
    loading, 
    loadingMore, 
    error, 
    hasMore, 
    onRefresh, 
    onLoadMore 
}) => {
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
            {/* Lista de creators */}
            {creators.map(creator => (
                <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onEdit={(creator) => console.log('Edit creator:', creator)}
                    onDelete={(creator) => console.log('Delete creator:', creator)}
                    onAssignBrand={(creator) => console.log('Assign brand:', creator)}
                />
            ))}
            
            {/* Skeleton loading para "cargar más" */}
            {loadingMore && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <UI.Card key={`loading-${index}`} className="p-6">
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
        </div>
    );
};