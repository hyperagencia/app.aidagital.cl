import React from 'react';
import { formatters } from '../../utils/formatters.js';

export const Avatar = ({
    name,
    src,
    size = 'md',
    className = '',
    ...props
}) => {
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-20 h-20 text-xl',
    };
    
    const sizeClass = sizes[size] || sizes.md;
    const colorClass = formatters.getAvatarColor(name || '');
    
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizeClass} rounded-full object-cover ${className}`}
                {...props}
            />
        );
    }
    
    return (
        <div
            className={`${sizeClass} rounded-full ${colorClass} flex items-center justify-center text-white font-semibold ${className}`}
            {...props}
        >
            {formatters.getInitials(name)}
        </div>
    );
};