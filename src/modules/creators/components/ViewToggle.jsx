/**
 * Toggle entre vistas Grid (Cards) y Tabla
 * Permite al usuario cambiar entre dos formas de visualizar creators
 */

import React from 'react';

/**
 * ViewToggle Component
 * Props:
 *  - viewType: 'grid' | 'table' (vista actual seleccionada)
 *  - onViewChange: (viewType: string) => void (callback al cambiar de vista)
 */
export const ViewToggle = ({ viewType, onViewChange }) => {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => onViewChange('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewType === 'grid'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Vista de Cards"
                aria-label="Cambiar a vista de cards"
                aria-pressed={viewType === 'grid'}
            >
                📊 Grid
            </button>
            <button
                onClick={() => onViewChange('table')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewType === 'table'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Vista de Tabla"
                aria-label="Cambiar a vista de tabla"
                aria-pressed={viewType === 'table'}
            >
                📋 Tabla
            </button>
        </div>
    );
};

export default ViewToggle;
