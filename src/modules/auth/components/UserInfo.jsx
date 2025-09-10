/**
 * Componente de información del usuario
 */

import React from 'react';
import { useAuth } from '../hooks/index.js';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';

export const UserInfo = ({ 
    showEmail = false, 
    showRole = false,
    size = 'md',
    className = '' 
}) => {
    const { user } = useAuth();
    
    if (!user) return null;
    
    return (
        <div className={`flex items-center ${className}`}>
            <UI.Avatar 
                name={user.name} 
                src={user.avatar}
                size={size}
            />
            
            <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                    {user.name?.split(' ')[0] || 'Usuario'}
                </p>
                {showEmail && (
                    <p className="text-xs text-gray-500">
                        {user.email}
                    </p>
                )}
                {showRole && (
                    <UI.Badge variant={user.role === 'admin' ? 'purple' : 'gray'} size="sm">
                        {formatters.capitalize(user.role)}
                    </UI.Badge>
                )}
            </div>
        </div>
    );
};

export default UserInfo;