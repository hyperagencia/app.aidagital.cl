/**
 * Componente de navegación breadcrumb
 */

import React from 'react';

export const Breadcrumb = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span className="text-gray-400">/</span>
                    )}
                    {item.href ? (
                        <button
                            onClick={() => item.onClick?.()}
                            className="hover:text-gray-900 transition-colors"
                        >
                            {item.label}
                        </button>
                    ) : (
                        <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;