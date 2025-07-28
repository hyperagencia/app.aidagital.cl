/**
 * Componentes de Brands
 */

import React, { useState } from 'react';
import { useBrands, useBrandActions } from '../hooks/index.js';
import { usePermissions } from '../../auth/hooks/index.js';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';

// Componente placeholder "Coming Soon"
export const ComingSoon = ({ module = 'Marcas', icon = '🏪' }) => {
    return (
        <div className="flex-1 bg-gray-50 overflow-auto">
            <div className="p-8 flex items-center justify-center min-h-96">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">{icon}</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Módulo {module}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Próximamente...
                    </p>
                    
                    <UI.Card className="p-6 text-left">
                        <h3 className="font-semibold text-gray-900 mb-3">
                            Funcionalidades planeadas:
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            {module === 'Marcas' ? (
                                <>
                                    <li className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Gestión completa de marcas cliente
                                    </li>
                                    <li className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Asignación automática de creators
                                    </li>
                                    <li className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Seguimiento de campañas activas
                                    </li>
                                    <li className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Métricas y analytics por marca
                                    </li>
                                    <li className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Panel de reportes personalizado
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Gestión de usuarios del sistema
                                    </li>
                                    <li className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Control de permisos y roles
                                    </li>
                                    <li className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Configuración del sistema
                                    </li>
                                    <li className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Logs de actividad
                                    </li>
                                    <li className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Respaldos y mantenimiento
                                    </li>
                                </>
                            )}
                        </ul>
                    </UI.Card>
                    
                    <div className="mt-6">
                        <p className="text-xs text-gray-500">
                            ¿Necesitas alguna funcionalidad específica?
                        </p>
                        <p className="text-xs text-gray-500">
                            Contacta al equipo de desarrollo
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente de tarjeta de marca
export const BrandCard = ({ brand, onEdit, onDelete, onViewCreators }) => {
    const [showActions, setShowActions] = useState(false);

    return (
        <UI.Card 
            hover 
            className="transition-all duration-200"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    {/* Logo placeholder */}
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                        {brand.logo ? (
                            <img 
                                src={brand.logo} 
                                alt={brand.name}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <span className="text-2xl text-purple-600">🏪</span>
                        )}
                    </div>
                    
                    {/* Info principal */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {brand.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                            {brand.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{brand.industry}</span>
                            {brand.website && (
                                <a 
                                    href={brand.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-700"
                                >
                                    🔗 Sitio web
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Estado */}
                <div className="text-right">
                    <UI.Badge 
                        variant={brand.status === 'active' ? 'green' : 'gray'}
                        size="sm"
                    >
                        {brand.status === 'active' ? 'Activa' : 'Inactiva'}
                    </UI.Badge>
                </div>
            </div>
            
            {/* Estadísticas */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-lg font-semibold text-gray-900">
                            {brand.assignedCreators}
                        </p>
                        <p className="text-xs text-gray-500">Creators</p>
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-900">
                            {brand.campaigns}
                        </p>
                        <p className="text-xs text-gray-500">Campañas</p>
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-900">
                            {formatters.formatDateShort(brand.created_at)}
                        </p>
                        <p className="text-xs text-gray-500">Creada</p>
                    </div>
                </div>
            </div>
            
            {/* Acciones */}
            {showActions && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                    <UI.Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewCreators?.(brand)}
                    >
                        👥 Ver Creators
                    </UI.Button>
                    <UI.Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(brand)}
                    >
                        ✏️ Editar
                    </UI.Button>
                    <UI.Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(brand)}
                        className="text-red-600 hover:text-red-700"
                    >
                        🗑️ Eliminar
                    </UI.Button>
                </div>
            )}
        </UI.Card>
    );
};

// Componente de formulario de marca
export const BrandForm = ({ brand, onSave, onCancel, loading = false }) => {
    const [formData, setFormData] = useState({
        name: brand?.name || '',
        description: brand?.description || '',
        website: brand?.website || '',
        industry: brand?.industry || '',
        status: brand?.status || 'active',
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validación básica
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.industry.trim()) newErrors.industry = 'La industria es requerida';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setErrors({});
        onSave?.(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <UI.Input
                label="Nombre de la marca"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                required
                disabled={loading}
            />
            
            <UI.Textarea
                label="Descripción"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={errors.description}
                rows={3}
                disabled={loading}
            />
            
            <UI.Input
                label="Sitio web"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                error={errors.website}
                placeholder="https://ejemplo.com"
                disabled={loading}
            />
            
            <UI.Select
                label="Industria"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                error={errors.industry}
                required
                disabled={loading}
            >
                <option value="">Seleccionar industria</option>
                <option value="Marketing Digital">Marketing Digital</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Retail">Retail</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Moda">Moda</option>
                <option value="Belleza">Belleza</option>
                <option value="Deportes">Deportes</option>
                <option value="Educación">Educación</option>
                <option value="Salud">Salud</option>
                <option value="Otro">Otro</option>
            </UI.Select>
            
            <UI.Select
                label="Estado"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={loading}
            >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
            </UI.Select>
            
            <div className="flex space-x-3">
                <UI.Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="flex-1"
                >
                    {brand ? 'Actualizar Marca' : 'Crear Marca'}
                </UI.Button>
                <UI.Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </UI.Button>
            </div>
        </form>
    );
};

// Página principal de brands
export const BrandsPage = () => {
    const permissions = usePermissions();
    
    // Verificar permisos
    if (!permissions.canViewBrands) {
        return (
            <div className="flex-1 bg-gray-50 overflow-auto p-8">
                <UI.Card className="p-8 text-center max-w-md mx-auto">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Sin permisos
                    </h3>
                    <p className="text-gray-600">
                        No tienes permisos para acceder al módulo de marcas
                    </p>
                </UI.Card>
            </div>
        );
    }

    // Por ahora mostrar el componente ComingSoon
    return <ComingSoon module="Marcas" icon="🏪" />;
    
    // Código para cuando esté implementado:
    /*
    const { brands, loading, error, refresh } = useBrands();
    const [showForm, setShowForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    
    const handleSave = async (brandData) => {
        // Lógica para guardar marca
        setShowForm(false);
        setEditingBrand(null);
        refresh();
    };

    return (
        <div className="flex-1 bg-gray-50 overflow-auto">
            <div className="p-8 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Marcas
                        </h1>
                        <p className="text-gray-600">
                            Gestiona las marcas cliente y sus campañas
                        </p>
                    </div>
                    {permissions.canCreateBrands && (
                        <UI.Button
                            variant="primary"
                            onClick={() => setShowForm(true)}
                            icon="+"
                        >
                            Nueva Marca
                        </UI.Button>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <UI.Card key={index} className="p-6">
                                <UI.Skeleton width="w-full" height="h-32" />
                            </UI.Card>
                        ))}
                    </div>
                ) : error ? (
                    <UI.Card className="p-8 text-center">
                        <UI.Alert type="error">
                            {error}
                        </UI.Alert>
                    </UI.Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {brands.map(brand => (
                            <BrandCard
                                key={brand.id}
                                brand={brand}
                                onEdit={setEditingBrand}
                                onDelete={(brand) => console.log('Delete:', brand)}
                                onViewCreators={(brand) => console.log('View creators:', brand)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
    */
};

// Exportar todos los componentes
export const brandsComponents = {
    BrandsPage,
    BrandCard,
    BrandForm,
    ComingSoon,
};

export default brandsComponents;