/**
 * Módulo Creators
 * Maneja listado, filtros, búsqueda y gestión de creators
 */

const { useState, useEffect, useMemo } = React;

// Hook personalizado para gestión de filtros
function useCreatorFilters(creators) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [ageRange, setAgeRange] = useState({ min: '', max: '' });
    const [selectedNationality, setSelectedNationality] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    // Generar opciones de filtros dinámicamente
    const filterOptions = useMemo(() => {
        const interests = new Set();
        const platforms = new Set();
        const nationalities = new Set();
        const locations = new Set();

        creators.forEach(creator => {
            if (creator.interests) {
                creator.interests.forEach(interest => interests.add(interest));
            }
            if (creator.platforms) {
                creator.platforms.forEach(platform => platforms.add(platform));
            }
            if (creator.nationality) {
                nationalities.add(creator.nationality);
            }
            if (creator.location) {
                locations.add(creator.location);
            }
        });

        return {
            interests: Array.from(interests).sort(),
            platforms: Array.from(platforms).sort(),
            nationalities: Array.from(nationalities).sort(),
            locations: Array.from(locations).sort()
        };
    }, [creators]);

    // Aplicar filtros
    const filteredCreators = useMemo(() => {
        return UGCUtils.filterCreators(creators, {
            searchTerm,
            interests: selectedInterests,
            platform: selectedPlatform,
            ageMin: ageRange.min,
            ageMax: ageRange.max,
            nationality: selectedNationality,
            location: selectedLocation
        });
    }, [creators, searchTerm, selectedInterests, selectedPlatform, ageRange, selectedNationality, selectedLocation]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedInterests([]);
        setSelectedPlatform('');
        setAgeRange({ min: '', max: '' });
        setSelectedNationality('');
        setSelectedLocation('');
    };

    const handleInterestToggle = (interest) => {
        setSelectedInterests(prev => 
            prev.includes(interest) 
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    return {
        // Estados
        searchTerm,
        selectedInterests,
        selectedPlatform,
        ageRange,
        selectedNationality,
        selectedLocation,
        
        // Setters
        setSearchTerm,
        setSelectedPlatform,
        setAgeRange,
        setSelectedNationality,
        setSelectedLocation,
        handleInterestToggle,
        clearFilters,
        
        // Datos
        filterOptions,
        filteredCreators,
        
        // Stats
        totalCreators: creators.length,
        filteredCount: filteredCreators.length
    };
}

// Componente de búsqueda
function SearchBar({ searchTerm, setSearchTerm }) {
    const debouncedSearch = UGCUtils.debounce(setSearchTerm, 300);

    return React.createElement('div', {
        className: 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6'
    },
        React.createElement('div', {
            className: 'relative'
        },
            React.createElement('input', {
                type: 'text',
                placeholder: 'Buscar por nombre o email...',
                defaultValue: searchTerm,
                onChange: (e) => debouncedSearch(e.target.value),
                className: 'w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-600 focus:ring-opacity-30 focus:border-purple-600 transition-all duration-200 text-lg'
            }),
            React.createElement('div', {
                className: 'absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl'
            }, '🔍')
        )
    );
}

// Componente de filtros
function FiltersPanel({ filters }) {
    const {
        selectedInterests,
        selectedPlatform,
        ageRange,
        selectedNationality,
        selectedLocation,
        handleInterestToggle,
        setSelectedPlatform,
        setAgeRange,
        setSelectedNationality,
        setSelectedLocation,
        clearFilters,
        filterOptions,
        totalCreators,
        filteredCount
    } = filters;

    return React.createElement('div', {
        className: 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6'
    },
        React.createElement('div', {
            className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4'
        },
            // Filtro Intereses (Multi-select mejorado)
            React.createElement('div', {},
                React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Intereses'),
                React.createElement('div', {
                    className: 'relative'
                },
                    React.createElement('select', {
                        value: '',
                        onChange: (e) => {
                            if (e.target.value) {
                                handleInterestToggle(e.target.value);
                                e.target.value = '';
                            }
                        },
                        className: 'input-base'
                    },
                        React.createElement('option', { value: '' }, 
                            selectedInterests.length > 0 
                                ? `${selectedInterests.length} seleccionados`
                                : 'Seleccionar intereses...'
                        ),
                        filterOptions.interests.map(interest =>
                            React.createElement('option', {
                                key: interest,
                                value: interest,
                                disabled: selectedInterests.includes(interest)
                            }, UGCUtils.formatInterests([interest]))
                        )
                    )
                ),
                // Mostrar intereses seleccionados
                selectedInterests.length > 0 && React.createElement('div', {
                    className: 'mt-2 flex flex-wrap gap-1'
                },
                    selectedInterests.map(interest =>
                        React.createElement('span', {
                            key: interest,
                            className: 'inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700'
                        },
                            UGCUtils.formatInterests([interest]).substring(0, 15),
                            React.createElement('button', {
                                onClick: () => handleInterestToggle(interest),
                                className: 'ml-1 text-purple-500 hover:text-purple-700'
                            }, '×')
                        )
                    )
                )
            ),

            // Filtro Plataforma
            React.createElement('div', {},
                React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Plataforma'),
                React.createElement('select', {
                    value: selectedPlatform,
                    onChange: (e) => setSelectedPlatform(e.target.value),
                    className: 'input-base'
                },
                    React.createElement('option', { value: '' }, 'Todas las plataformas'),
                    filterOptions.platforms.map(platform =>
                        React.createElement('option', {
                            key: platform,
                            value: platform
                        }, UGCUtils.formatPlatform(platform))
                    )
                )
            ),

            // Filtro Edad
            React.createElement('div', {},
                React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Rango de edad'),
                React.createElement('div', {
                    className: 'flex space-x-2'
                },
                    React.createElement('input', {
                        type: 'number',
                        placeholder: 'Min',
                        value: ageRange.min,
                        onChange: (e) => setAgeRange(prev => ({ ...prev, min: e.target.value })),
                        className: 'input-base w-1/2',
                        min: 18,
                        max: 80
                    }),
                    React.createElement('input', {
                        type: 'number',
                        placeholder: 'Max',
                        value: ageRange.max,
                        onChange: (e) => setAgeRange(prev => ({ ...prev, max: e.target.value })),
                        className: 'input-base w-1/2',
                        min: 18,
                        max: 80
                    })
                )
            ),

            // Filtro Nacionalidad
            React.createElement('div', {},
                React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Nacionalidad'),
                React.createElement('select', {
                    value: selectedNationality,
                    onChange: (e) => setSelectedNationality(e.target.value),
                    className: 'input-base'
                },
                    React.createElement('option', { value: '' }, 'Todas las nacionalidades'),
                    filterOptions.nationalities.map(nationality =>
                        React.createElement('option', {
                            key: nationality,
                            value: nationality
                        }, UGCUtils.formatNationality(nationality))
                    )
                )
            ),

            // Filtro Ubicación
            React.createElement('div', {},
                React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Ubicación'),
                React.createElement('select', {
                    value: selectedLocation,
                    onChange: (e) => setSelectedLocation(e.target.value),
                    className: 'input-base'
                },
                    React.createElement('option', { value: '' }, 'Todas las ubicaciones'),
                    filterOptions.locations.map(location =>
                        React.createElement('option', {
                            key: location,
                            value: location
                        }, UGCUtils.formatLocation(location))
                    )
                )
            )
        ),

        // Información y acciones
        React.createElement('div', {
            className: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'
        },
            React.createElement('div', {
                className: 'flex items-center space-x-4'
            },
                React.createElement('p', {
                    className: 'text-sm text-gray-600'
                }, `Mostrando ${filteredCount} de ${totalCreators} creators`),
                filteredCount !== totalCreators && React.createElement('span', {
                    className: 'badge badge-purple'
                }, 'Filtrado')
            ),
            React.createElement('div', {
                className: 'flex items-center space-x-3'
            },
                React.createElement('button', {
                    onClick: clearFilters,
                    className: 'btn-base btn-secondary text-sm'
                }, 'Limpiar filtros'),
                React.createElement('button', {
                    onClick: () => {
                        const filteredData = filters.filteredCreators;
                        UGCUtils.exportToCSV(filteredData, `creators-${new Date().toISOString().split('T')[0]}.csv`);
                    },
                    className: 'btn-base btn-primary text-sm'
                }, 
                    React.createElement('span', { className: 'mr-1' }, '📊'),
                    'Exportar'
                )
            )
        )
    );
}

// Componente de card de creator
function CreatorCard({ creator }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return React.createElement('div', {
        className: 'card-base p-6 hover-shadow transition-all-200'
    },
        React.createElement('div', {
            className: 'grid grid-cols-1 md:grid-cols-4 gap-6'
        },
            // Columna 1: Info básica
            React.createElement('div', {},
                React.createElement('div', {
                    className: 'flex items-start space-x-3 mb-3'
                },
                    // Avatar
                    React.createElement('div', {
                        className: `w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${UGCUtils.getAvatarColor(creator.full_name)}`
                    }, UGCUtils.getInitials(creator.full_name)),
                    
                    // Info principal
                    React.createElement('div', {
                        className: 'flex-1'
                    },
                        React.createElement('h3', {
                            className: 'text-lg font-semibold text-gray-900 mb-1'
                        }, creator.full_name),
                        React.createElement('p', {
                            className: 'text-gray-600 text-sm'
                        }, `${creator.age} años, ${UGCUtils.formatNationality(creator.nationality)}`)
                    )
                ),
                
                React.createElement('div', {
                    className: 'text-sm space-y-1'
                },
                    React.createElement('p', {
                        className: 'font-medium text-gray-700'
                    }, 'Contacto'),
                    React.createElement('p', {
                        className: 'text-gray-600'
                    }, creator.email),
                    React.createElement('p', {
                        className: 'text-gray-600'
                    }, creator.phone)
                )
            ),

            // Columna 2: Intereses
            React.createElement('div', {},
                React.createElement('h4', {
                    className: 'font-medium text-gray-900 mb-2'
                }, 'Intereses'),
                React.createElement('p', {
                    className: 'text-gray-600 text-sm leading-relaxed'
                }, UGCUtils.formatInterests(creator.interests))
            ),

            // Columna 3: Plataformas
            React.createElement('div', {},
                React.createElement('h4', {
                    className: 'font-medium text-gray-900 mb-2'
                }, 'Plataformas'),
                creator.platforms && creator.platforms.length > 0 ?
                    React.createElement('div', {
                        className: 'space-y-2'
                    },
                        creator.platforms.map((platform, index) =>
                            React.createElement('div', {
                                key: `${platform}-${index}`,
                                className: 'flex items-center justify-between'
                            },
                                React.createElement('span', {
                                    className: 'text-sm text-gray-600'
                                }, UGCUtils.formatPlatform(platform)),
                                React.createElement('a', {
                                    href: '#', // Aquí iría el link real del creator
                                    target: '_blank',
                                    rel: 'noopener noreferrer',
                                    className: 'text-purple-600 hover:text-purple-700 text-sm font-medium'
                                }, '🔗 Ver')
                            )
                        )
                    ) :
                    React.createElement('p', {
                        className: 'text-gray-500 text-sm'
                    }, 'Sin plataformas registradas')
            ),

            // Columna 4: Marca asignada
            React.createElement('div', {},
                React.createElement('h4', {
                    className: 'font-medium text-gray-900 mb-2'
                }, 'Marca asignada'),
                React.createElement('div', {
                    className: 'flex items-center justify-between'
                },
                    React.createElement('span', {
                        className: 'text-gray-500 text-sm'
                    }, 'Ninguna asignada'),
                    React.createElement('button', {
                        className: 'text-gray-400 hover:text-gray-600 text-sm',
                        onClick: () => setIsExpanded(!isExpanded)
                    }, isExpanded ? '▲' : '▼')
                )
            )
        ),
        
        // Información expandida
        isExpanded && React.createElement('div', {
            className: 'mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 fade-in'
        },
            React.createElement('div', {},
                React.createElement('span', {
                    className: 'font-medium text-gray-700 text-sm'
                }, 'Ubicación'),
                React.createElement('p', {
                    className: 'text-gray-600 text-sm mt-1'
                }, UGCUtils.formatLocation(creator.location))
            ),
            React.createElement('div', {},
                React.createElement('span', {
                    className: 'font-medium text-gray-700 text-sm'
                }, 'Modalidad'),
                React.createElement('p', {
                    className: 'text-gray-600 text-sm mt-1'
                }, UGCUtils.capitalize(creator.modality))
            ),
            React.createElement('div', {},
                React.createElement('span', {
                    className: 'font-medium text-gray-700 text-sm'
                }, 'Registrado'),
                React.createElement('p', {
                    className: 'text-gray-600 text-sm mt-1'
                }, UGCUtils.timeAgo(creator.created_at))
            ),
            React.createElement('div', {},
                React.createElement('span', {
                    className: 'font-medium text-gray-700 text-sm'
                }, 'Estado'),
                React.createElement('span', {
                    className: 'badge badge-green text-xs mt-1 inline-block'
                }, 'Activo')
            )
        )
    );
}

// Estado vacío cuando no hay resultados
function EmptyState({ hasFilters }) {
    return React.createElement('div', {
        className: 'card-base p-12 text-center'
    },
        React.createElement('div', {
            className: 'text-6xl mb-4'
        }, hasFilters ? '🔍' : '👥'),
        React.createElement('h3', {
            className: 'text-xl font-semibold text-gray-900 mb-2'
        }, hasFilters ? 'No se encontraron creators' : 'No hay creators registrados'),
        React.createElement('p', {
            className: 'text-gray-600 mb-6'
        }, hasFilters 
            ? 'Intenta ajustar los filtros o la búsqueda'
            : 'Los creators que se registren aparecerán aquí'
        ),
        hasFilters && React.createElement('button', {
            onClick: () => window.location.reload(),
            className: 'btn-base btn-primary'
        }, 'Limpiar todos los filtros')
    );
}

// Componente principal de creators
function CreatorsPage() {
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const filters = useCreatorFilters(creators);

    useEffect(() => {
        fetchCreators();
    }, []);

    const fetchCreators = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await UGCUtils.apiRequest(`${window.UGCConfig.API_BASE}/creators.php`);
            
            if (data.success) {
                setCreators(data.data.creators);
                UGCUtils.log('Creators loaded:', data.data.creators.length);
            } else {
                throw new Error(data.message || 'Error loading creators');
            }
        } catch (error) {
            const errorResult = UGCUtils.handleError(error, 'Fetching creators');
            setError(errorResult.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return React.createElement('div', {
            className: 'flex-1 bg-gray-50 overflow-auto p-8'
        },
            React.createElement('div', {
                className: 'flex justify-center items-center min-h-96'
            },
                React.createElement('div', {
                    className: 'text-center'
                },
                    React.createElement('div', {
                        className: 'loading-spinner mx-auto mb-4'
                    }),
                    React.createElement('p', {
                        className: 'text-gray-600'
                    }, 'Cargando creators...')
                )
            )
        );
    }

    if (error) {
        return React.createElement('div', {
            className: 'flex-1 bg-gray-50 overflow-auto p-8'
        },
            React.createElement('div', {
                className: 'card-base p-8 text-center max-w-md mx-auto'
            },
                React.createElement('div', {
                    className: 'text-4xl mb-4'
                }, '⚠️'),
                React.createElement('h3', {
                    className: 'text-lg font-semibold text-gray-900 mb-2'
                }, 'Error al cargar creators'),
                React.createElement('p', {
                    className: 'text-gray-600 mb-4'
                }, error),
                React.createElement('button', {
                    onClick: fetchCreators,
                    className: 'btn-base btn-primary'
                }, 'Reintentar')
            )
        );
    }

    const hasFilters = filters.searchTerm || filters.selectedInterests.length > 0 || 
                      filters.selectedPlatform || filters.ageRange.min || filters.ageRange.max ||
                      filters.selectedNationality || filters.selectedLocation;

    return React.createElement('div', {
        className: 'flex-1 bg-gray-50 overflow-auto'
    },
        React.createElement('div', {
            className: 'p-8 max-w-7xl'
        },
            // Header
            React.createElement('div', {
                className: 'mb-8'
            },
                React.createElement('h1', {
                    className: 'text-3xl font-bold text-gray-900 mb-2'
                }, 'Creators'),
                React.createElement('p', {
                    className: 'text-gray-600'
                }, 'Gestiona y filtra tu base de creators registrados')
            ),

            // Búsqueda
            React.createElement(SearchBar, {
                searchTerm: filters.searchTerm,
                setSearchTerm: filters.setSearchTerm
            }),

            // Filtros
            React.createElement(FiltersPanel, { filters }),

            // Lista de creators
            React.createElement('div', {
                className: 'space-y-4'
            },
                filters.filteredCreators.length === 0 ? 
                    React.createElement(EmptyState, { hasFilters }) :
                    filters.filteredCreators.map(creator => 
                        React.createElement(CreatorCard, {
                            key: creator.id,
                            creator
                        })
                    )
            )
        )
    );
}

// Exportar componentes
window.CreatorsComponents = {
    CreatorsPage,
    CreatorCard,
    SearchBar,
    FiltersPanel,
    EmptyState
};

UGCUtils.log('Creators module loaded successfully');