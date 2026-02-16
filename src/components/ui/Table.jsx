/**
 * Componente Table reutilizable
 * Componente base para renderizar tablas con estilos Tailwind
 */

import React from 'react';
import { Skeleton } from './Skeleton.jsx';

/**
 * Table - Wrapper principal de la tabla
 * Props: children, loading, className
 */
export const Table = ({ children, loading, className = '' }) => {
    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
                {children}
            </table>
        </div>
    );
};

/**
 * TableHeader - Header de la tabla
 */
export const TableHeader = ({ children }) => (
    <thead className="bg-gray-50">
        <tr>{children}</tr>
    </thead>
);

/**
 * TableBody - Cuerpo de la tabla
 */
export const TableBody = ({ children }) => (
    <tbody className="bg-white divide-y divide-gray-200">
        {children}
    </tbody>
);

/**
 * TableCell - Celda de la tabla (th o td)
 * Props: children, header (boolean), className
 */
export const TableCell = ({ children, header, className = '' }) => {
    const Tag = header ? 'th' : 'td';
    const baseClass = header
        ? 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        : 'px-4 py-4 whitespace-nowrap text-sm text-gray-900';

    return <Tag className={`${baseClass} ${className}`}>{children}</Tag>;
};

/**
 * TableSkeleton - Loading skeleton para tabla
 * Props: rows (número de filas a mostrar)
 */
export const TableSkeleton = ({ rows = 5 }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <div className="p-4 space-y-3">
                {/* Header skeleton */}
                <div className="grid grid-cols-6 gap-4 pb-3 border-b border-gray-200">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={`header-${i}`} width="w-full" height="h-4" />
                    ))}
                </div>

                {/* Rows skeleton */}
                {[...Array(rows)].map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="grid grid-cols-6 gap-4 py-2">
                        {[...Array(6)].map((_, colIndex) => (
                            <Skeleton key={`cell-${rowIndex}-${colIndex}`} width="w-full" height="h-8" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Table;
