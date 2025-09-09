import React from 'react';

export const Skeleton = ({
    width = 'w-full',
    height = 'h-4',
    className = '',
    ...props
}) => {
    return (
        <div
            className={`bg-gray-200 rounded animate-pulse ${width} ${height} ${className}`}
            {...props}
        />
    );
};