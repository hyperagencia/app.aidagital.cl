/**
 * Componente de tarjeta de estadísticas
 */

import React from 'react';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';

const StatsCard = ({ 
    title, 
    value, 
    change,
    changeType = 'neutral',
    icon,
    bgColor = 'bg-white',
    textColor = 'text-gray-900',
    onClick,
    loading = false 
}) => {
    const changeColors = {
        positive: 'text-green-600',
        negative: 'text-red-600',
        neutral: 'text-gray-500',
    };

    const changeColor = changeColors[changeType] || changeColors.neutral;

    return (
        <UI.Card 
            className={`${bgColor} ${onClick ? 'cursor-pointer' : ''} hover:shadow-lg transition-all duration-300`}
            onClick={onClick}
            padding="p-6"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className={`text-sm font-medium ${textColor} opacity-75 mb-1`}>
                        {title}
                    </p>
                    <div className="flex items-baseline space-x-2">
                        {loading ? (
                            <UI.Skeleton width="w-16" height="h-8" />
                        ) : (
                            <p className={`text-3xl font-bold ${textColor}`}>
                                {typeof value === 'number' ? formatters.formatNumber(value) : value}
                            </p>
                        )}
                        {change && !loading && (
                            <span className={`text-sm font-medium ${changeColor}`}>
                                {change > 0 ? '+' : ''}{change}%
                            </span>
                        )}
                    </div>
                </div>
                {icon && (
                    <div className={`text-2xl ${textColor} opacity-75`}>
                        {icon}
                    </div>
                )}
            </div>
        </UI.Card>
    );
};

export default StatsCard;