/**
 * Servicio de Favoritos
 * Maneja las operaciones de favoritos de creators
 */

import { api } from '../../../services/api.js';
import { config, log, logError } from '../../../services/config.js';

class FavoritesService {
    constructor() {
        this.baseEndpoint = '/favorites.php';
    }

    // Obtener lista de favoritos del usuario
    async getFavorites() {
        try {
            log('Fetching user favorites');
            
            const response = await api.get(this.baseEndpoint);

            if (response.success) {
                log(`Fetched ${response.data.favorites.length} favorites`);
                return {
                    success: true,
                    favorites: response.data.favorites,
                    total: response.data.total || response.data.favorites.length,
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, 'Get favorites');
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Toggle favorito (agregar/quitar)
    async toggleFavorite(creatorId) {
        try {
            log(`Toggling favorite for creator ${creatorId}`);
            
            const response = await api.post(this.baseEndpoint, {
                creator_id: creatorId
            });

            if (response.success) {
                const action = response.data.action; // 'added' or 'removed'
                const isFavorite = response.data.is_favorite;
                
                log(`Creator ${creatorId} ${action} ${isFavorite ? 'to' : 'from'} favorites`);
                
                return {
                    success: true,
                    creatorId,
                    isFavorite,
                    action,
                    message: response.message
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, `Toggle favorite for creator ${creatorId}`);
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Remover favorito específicamente
    async removeFavorite(creatorId) {
        try {
            log(`Removing favorite for creator ${creatorId}`);
            
            const response = await api.delete(`${this.baseEndpoint}?creator_id=${creatorId}`);

            if (response.success) {
                log(`Creator ${creatorId} removed from favorites`);
                return {
                    success: true,
                    creatorId,
                    isFavorite: false,
                    message: response.message
                };
            } else {
                throw new Error(response.message || config.ERRORS.UNKNOWN);
            }
        } catch (error) {
            logError(error, `Remove favorite for creator ${creatorId}`);
            throw new Error(error.message || config.ERRORS.NETWORK);
        }
    }

    // Agregar favorito específicamente
    async addFavorite(creatorId) {
        // Usar toggleFavorite ya que la API maneja ambos casos
        return await this.toggleFavorite(creatorId);
    }

    // Verificar si un creator es favorito
    async isFavorite(creatorId) {
        try {
            const favoritesResult = await this.getFavorites();
            if (favoritesResult.success) {
                return favoritesResult.favorites.some(fav => fav.id === creatorId);
            }
            return false;
        } catch (error) {
            logError(error, `Check if creator ${creatorId} is favorite`);
            return false;
        }
    }
}

// Instancia singleton
export const favoritesService = new FavoritesService();

export default favoritesService;