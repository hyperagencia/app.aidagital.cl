/**
 * useCreatorActions Hook
 * Hook para acciones CRUD de creators (crear, actualizar, eliminar)
 */

import { useState, useCallback } from 'react';
import { creatorsService } from '../services/creatorsService.js';
import { log } from '../../../services/config.js';

/**
 * Hook para realizar acciones sobre creators
 * Incluye: crear, actualizar, eliminar, eliminar múltiples, asignar/desasignar marca
 */
export const useCreatorActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Crear nuevo creator
    const createCreator = useCallback(async (creatorData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.createCreator(creatorData);
            
            if (result.success) {
                setSuccess(true);
                log('Creator created successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar creator
    const updateCreator = useCallback(async (id, creatorData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.updateCreator(id, creatorData);
            
            if (result.success) {
                setSuccess(true);
                log('Creator updated successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar creator
    const deleteCreator = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.deleteCreator(id);
            
            if (result.success) {
                setSuccess(true);
                log('Creator deleted successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar múltiples creators
    const deleteMultipleCreators = useCallback(async (ids) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.deleteMultipleCreators(ids);
            
            if (result.success) {
                setSuccess(true);
                log(`${ids.length} creators deleted successfully`);
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Asignar marca a creator
    const assignBrand = useCallback(async (creatorId, brandId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.assignBrand(creatorId, brandId);
            
            if (result.success) {
                setSuccess(true);
                log('Brand assigned successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Desasignar marca de creator
    const unassignBrand = useCallback(async (creatorId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await creatorsService.unassignBrand(creatorId);
            
            if (result.success) {
                setSuccess(true);
                log('Brand unassigned successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Limpiar mensajes de error/éxito
    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return {
        // Estados
        loading,
        error,
        success,
        
        // Acciones
        createCreator,
        updateCreator,
        deleteCreator,
        deleteMultipleCreators,
        assignBrand,
        unassignBrand,
        
        // Utilidades
        clearMessages,
    };
};