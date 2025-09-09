import React from 'react';

export const Card = ({
    children,
    className = '',
    hover = false,
    padding = 'p-6',
    ...props
}) => {
    const cardClasses = `card-base ${padding} ${hover ? 'hover-shadow cursor-pointer' : ''} ${className}`;
    
    return (
        <div className={cardClasses} {...props}>
            {children}
        </div>
    );
};