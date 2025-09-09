import React from 'react';
import { UI } from '../../../components/ui/index.js';

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