import React from 'react';

export const Divider = ({
    orientation = 'horizontal',
    className = '',
    ...props
}) => {
    const orientationClass = orientation === 'vertical' 
        ? 'w-px h-full' 
        : 'h-px w-full';
    
    return (
        <div
            className={`bg-gray-200 ${orientationClass} ${className}`}
            {...props}
        />
    );
};