/**
 * Hooks de Brands
 * Hooks para gestión de marcas
 */

import { useState, useEffect, useCallback } from 'react';
import { brandsService } from '../services/brandsService.js';
import { log } from '../../../services/config.js';

// Hook principal para obtener brands
export const useBrands = (initialFilters = {}) => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);

    // Función para cargar brands
    const fetchBrands = useCallback(async (newFilters = filters) => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await brandsService.getBrands(newFilters);
            
            if (result.success) {
                setBrands(result.brands);
                log(`Loaded ${result.brands.length} brands`);
            }
        } catch (error) {
            setError(error.message);
            log('Error loading brands:', error.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Cargar brands al montar o cambiar filtros
    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    // Función para actualizar filtros
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Función para limpiar filtros
    const clearFilters = useCallback(() => {
        setFilters({});
    }, []);

    // Función para refrescar datos
    const refresh = useCallback(() => {
        fetchBrands();
    }, [fetchBrands]);

    return {
        brands,
        loading,
        error,
        filters,
        updateFilters,
        clearFilters,
        refresh,
        fetchBrands,
    };
};

// Hook para acciones de brands
export const useBrandActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Crear brand
    const createBrand = useCallback(async (brandData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            // Validar datos
            const validation = brandsService.validateBrandData(brandData);
            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                throw new Error(firstError);
            }
            
            const result = await brandsService.createBrand(brandData);
            
            if (result.success) {
                setSuccess(true);
                log('Brand created successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar brand
    const updateBrand = useCallback(async (id, brandData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            // Validar datos
            const validation = brandsService.validateBrandData(brandData);
            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                throw new Error(firstError);
            }
            
            const result = await brandsService.updateBrand(id, brandData);
            
            if (result.success) {
                setSuccess(true);
                log('Brand updated successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar brand
    const deleteBrand = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await brandsService.deleteBrand(id);
            
            if (result.success) {
                setSuccess(true);
                log('Brand deleted successfully');
                return result;
            }
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Limpiar mensajes
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
        createBrand,
        updateBrand,
        deleteBrand,
        
        // Utilidades
        clearMessages,
    };
};

// Exportar todos los hooks
export const brandsHooks = {
    useBrands,
    useBrandActions,
};

export default brandsHooks;