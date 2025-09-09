import React from 'react';
import { UI } from '../../../components/ui/index.js';

export const SearchBar = ({ searchTerm, onSearchChange, placeholder = "Buscar por nombre o email..." }) => {
    return (
        <UI.Card className="mb-6">
            <div className="relative">
                <UI.Input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-12 text-lg py-4"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                    
                </div>
            </div>
        </UI.Card>
    );
};