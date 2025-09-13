/**
 * Componente de acciones rápidas
 */

import React from 'react';
import { UI } from '../../../components/ui/index.js';

const QuickActions = ({ onNavigate }) => {
    const actions = [
        {
            id: 'view-creators',
            title: 'Ver Creators',
            description: 'Gestionar base de creators',
            color: 'bg-blue-500',
            action: () => onNavigate?.('creators'),
        },
        {
            id: 'export-data',
            title: 'Exportar Datos',
            description: 'Descargar información',
            color: 'bg-green-500',
            action: () => console.log('Export data'),
        },
        {
            id: 'manage-brands',
            title: 'Gestionar Marcas',
            description: 'Administrar marcas cliente',
            color: 'bg-purple-500',
            action: () => onNavigate?.('brands'),
        },
        {
            id: 'view-analytics',
            title: 'Ver Analytics',
            description: 'Estadísticas detalladas',
            color: 'bg-orange-500',
            action: () => console.log('View analytics'),
        },
    ];

    return (
        <UI.Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={action.action}
                        className="p-4 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                                {/* Sin icono por ahora - placeholder para futuros iconos */}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {action.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </UI.Card>
    );
};

export default QuickActions;