/**
 * Hook para manejar favoritos
 */

import { useState, useCallback } from 'react';
import { favoritesService } from '../services/favoritesService.js';
import { log, logError } from '../../../services/config.js';

export const useFavorites = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Toggle favorito
    const toggleFavorite = useCallback(async (creatorId, currentIsFavorite = false) => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await favoritesService.toggleFavorite(creatorId);
            
            if (result.success) {
                log(`Favorite toggled: Creator ${creatorId} is now ${result.isFavorite ? 'favorited' : 'unfavorited'}`);
                return {
                    success: true,
                    creatorId: result.creatorId,
                    isFavorite: result.isFavorite,
                    action: result.action,
                    message: result.message
                };
            } else {
                throw new Error('Failed to toggle favorite');
            }
        } catch (error) {
            const errorMessage = error.message || 'Error al cambiar favorito';
            setError(errorMessage);
            logError(error, `Toggle favorite for creator ${creatorId}`);
            
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // Agregar a favoritos
    const addToFavorites = useCallback(async (creatorId) => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await favoritesService.addFavorite(creatorId);
            
            if (result.success) {
                log(`Creator ${creatorId} added to favorites`);
                return {
                    success: true,
                    creatorId: result.creatorId,
                    isFavorite: true,
                    message: result.message
                };
            } else {
                throw new Error('Failed to add to favorites');
            }
        } catch (error) {
            const errorMessage = error.message || 'Error al agregar a favoritos';
            setError(errorMessage);
            logError(error, `Add to favorites creator ${creatorId}`);
            
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // Remover de favoritos
    const removeFromFavorites = useCallback(async (creatorId) => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await favoritesService.removeFavorite(creatorId);
            
            if (result.success) {
                log(`Creator ${creatorId} removed from favorites`);
                return {
                    success: true,
                    creatorId: result.creatorId,
                    isFavorite: false,
                    message: result.message
                };
            } else {
                throw new Error('Failed to remove from favorites');
            }
        } catch (error) {
            const errorMessage = error.message || 'Error al quitar de favoritos';
            setError(errorMessage);
            logError(error, `Remove from favorites creator ${creatorId}`);
            
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // Limpiar error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // Estado
        loading,
        error,
        
        // Acciones
        toggleFavorite,
        addToFavorites,
        removeFromFavorites,
        
        // Utilidades
        clearError,
    };
};

export default useFavorites;