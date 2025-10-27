/**
 * useCreatorExport Hook
 * Hook para exportar creators a CSV o JSON
 */

import { useState, useCallback } from 'react';
import { creatorsService } from '../services/creatorsService.js';
import { log } from '../../../services/config.js';

/**
 * Hook para exportar creators
 * Soporta formatos: CSV, JSON
 */
export const useCreatorExport = () => {
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState(null);

    // Exportar creators
    const exportCreators = useCallback(async (filters = {}, format = 'csv') => {
        try {
            setExporting(true);
            setExportError(null);
            
            const result = await creatorsService.exportCreators(filters, format);
            
            if (result.success) {
                // Si hay URL de descarga, usarla
                if (result.downloadUrl) {
                    window.open(result.downloadUrl, '_blank');
                } else if (result.data) {
                    // Crear archivo localmente
                    const blob = new Blob([result.data], { 
                        type: format === 'csv' ? 'text/csv' : 'application/json' 
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = result.filename || `creators.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
                
                log('Export completed successfully');
                return { success: true };
            }
        } catch (error) {
            setExportError(error.message);
            return { success: false, message: error.message };
        } finally {
            setExporting(false);
        }
    }, []);

    return {
        exporting,
        exportError,
        exportCreators,
    };
};