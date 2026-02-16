/**
 * Modal con información completa del creator
 * Muestra todos los detalles en un formato organizado
 */

import React from 'react';
import { UI } from '../../../components/ui/index.js';
import { formatters } from '../../../utils/formatters.js';

/**
 * CreatorDetailsModal Component
 * Props:
 *  - creator: objeto con todos los datos del creator
 *  - isOpen: boolean (estado del modal)
 *  - onClose: () => void (callback para cerrar modal)
 */
export const CreatorDetailsModal = ({ creator, isOpen, onClose }) => {
    if (!creator) return null;

    return (
        <UI.Modal
            isOpen={isOpen}
            onClose={onClose}
            title={creator.full_name}
            size="lg"
        >
            <div className="space-y-6">
                {/* Sección 1: Info Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                            Información Personal
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-start">
                                <span className="font-medium text-gray-700 w-28">Edad:</span>
                                <span className="text-gray-600">
                                    {creator.age ? `${creator.age} años` : 'No especificada'}
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="font-medium text-gray-700 w-28">Nacionalidad:</span>
                                <span className="text-gray-600">
                                    {formatters.formatNationality(creator.nationality)}
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="font-medium text-gray-700 w-28">Ubicación:</span>
                                <span className="text-gray-600">
                                    {formatters.formatLocation(creator.location)}
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="font-medium text-gray-700 w-28">Modalidad:</span>
                                <span className="text-gray-600">
                                    {formatters.formatModality(creator.modality)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                            Contacto
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-start">
                                <span className="font-medium text-gray-700 w-20">Email:</span>
                                <a
                                    href={`mailto:${creator.email}`}
                                    className="text-purple-600 hover:underline break-all"
                                >
                                    {creator.email}
                                </a>
                            </div>
                            <div className="flex items-start">
                                <span className="font-medium text-gray-700 w-20">Teléfono:</span>
                                <a
                                    href={`tel:${creator.phone}`}
                                    className="text-purple-600 hover:underline"
                                >
                                    {formatters.formatPhone(creator.phone)}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <UI.Divider />

                {/* Sección 2: Intereses */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                        Intereses
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {formatters.formatInterests(creator.interests)}
                    </p>
                </div>

                {/* Divider */}
                <UI.Divider />

                {/* Sección 3: Plataformas y Redes */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                        Plataformas y Redes Sociales
                    </h4>
                    {creator.social_networks && creator.social_networks.length > 0 ? (
                        <div className="space-y-2">
                            {creator.social_networks.map((network, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-lg"
                                >
                                    <span className="font-medium text-gray-700">
                                        {formatters.formatPlatform(network.platform)}
                                    </span>
                                    {network.profile_link ? (
                                        <a
                                            href={network.profile_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                                        >
                                            Ver perfil <span className="text-xs">↗</span>
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Sin enlace</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">
                            Sin plataformas registradas
                        </p>
                    )}
                </div>

                {/* Divider */}
                <UI.Divider />

                {/* Sección 4: Metadata */}
                <div className="pt-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700 block mb-1">
                                Registrado
                            </span>
                            <p className="text-gray-600">
                                {formatters.formatTimeAgo(creator.created_at)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatters.formatDate(creator.created_at)}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700 block mb-1">
                                Estado
                            </span>
                            <UI.Badge variant="green" size="sm">
                                Activo
                            </UI.Badge>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <UI.Divider />

                {/* Sección 5: Acciones */}
                <div className="flex gap-3 pt-2">
                    <UI.Button
                        variant="primary"
                        size="md"
                        className="flex-1"
                        onClick={() => console.log('Editar creator:', creator.id)}
                    >
                        ✏️ Editar Creator
                    </UI.Button>
                    <UI.Button
                        variant="secondary"
                        size="md"
                        className="flex-1"
                        onClick={() => console.log('Asignar marca:', creator.id)}
                    >
                        🏷️ Asignar Marca
                    </UI.Button>
                </div>
            </div>
        </UI.Modal>
    );
};

export default CreatorDetailsModal;
