/**
 * Módulo de Autenticación
 * Maneja login, logout, verificación de sesión y contexto de usuario
 */

const { createContext, useContext, useState, useEffect } = React;

// Context de autenticación
const AuthContext = createContext();

// Hook para usar autenticación
function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}

// Provider de autenticación
function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = UGCUtils.storage.get('authToken');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const data = await UGCUtils.apiRequest(`${window.UGCConfig.API_BASE}/auth.php?action=verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (data.success) {
                setUser(data.data.user);
                UGCUtils.log('User authenticated:', data.data.user);
            } else {
                UGCUtils.storage.remove('authToken');
                UGCUtils.log('Token invalid, removing from storage');
            }
        } catch (error) {
            UGCUtils.handleError(error, 'Auth verification');
            UGCUtils.storage.remove('authToken');
        }
        
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const data = await UGCUtils.apiRequest(`${window.UGCConfig.API_BASE}/auth.php?action=login`, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (data.success) {
                UGCUtils.storage.set('authToken', data.data.token);
                setUser(data.data.user);
                UGCUtils.log('Login successful:', data.data.user);
                return { success: true };
            } else {
                UGCUtils.log('Login failed:', data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            const errorResult = UGCUtils.handleError(error, 'Login');
            return { success: false, message: errorResult.message };
        }
    };

    const logout = async () => {
        const token = UGCUtils.storage.get('authToken');
        
        try {
            if (token) {
                await UGCUtils.apiRequest(`${window.UGCConfig.API_BASE}/auth.php?action=logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            UGCUtils.log('Logout API error (non-critical):', error);
        }
        
        UGCUtils.storage.remove('authToken');
        setUser(null);
        UGCUtils.log('User logged out');
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return React.createElement(AuthContext.Provider, { value }, children);
}

// Componente de Login
function LoginPage() {
    const [email, setEmail] = useState('admin@aidadigital.cl');
    const [password, setPassword] = useState('password123');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validaciones básicas
        if (!UGCUtils.isValidEmail(email)) {
            setError('Por favor ingresa un email válido');
            setIsLoading(false);
            return;
        }

        if (password.length < 3) {
            setError('La contraseña es muy corta');
            setIsLoading(false);
            return;
        }

        const result = await login(email, password);
        
        if (!result.success) {
            setError(result.message);
        }
        
        setIsLoading(false);
    };

    return React.createElement('div', {
        className: 'min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4'
    }, 
        React.createElement('div', {
            className: 'bg-white rounded-2xl shadow-xl p-8 w-full max-w-md fade-in'
        },
            // Header
            React.createElement('div', {
                className: 'text-center mb-8'
            },
                React.createElement('div', {
                    className: 'w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'
                },
                    React.createElement('span', {
                        className: 'text-2xl'
                    }, '👥')
                ),
                React.createElement('h1', {
                    className: 'text-3xl font-bold text-gray-900 mb-2'
                }, 'UGC Creators AIDA'),
                React.createElement('p', {
                    className: 'text-gray-600'
                }, 'AIDA Digital Marketing')
            ),
            
            // Formulario
            React.createElement('form', {
                onSubmit: handleSubmit,
                className: 'space-y-6'
            },
                // Email
                React.createElement('div', {},
                    React.createElement('label', {
                        htmlFor: 'email',
                        className: 'block text-sm font-medium text-gray-700 mb-2'
                    }, 'Email'),
                    React.createElement('input', {
                        id: 'email',
                        type: 'email',
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        className: 'input-base',
                        placeholder: 'tu@email.com',
                        required: true,
                        disabled: isLoading
                    })
                ),
                
                // Password
                React.createElement('div', {},
                    React.createElement('label', {
                        htmlFor: 'password',
                        className: 'block text-sm font-medium text-gray-700 mb-2'
                    }, 'Contraseña'),
                    React.createElement('input', {
                        id: 'password',
                        type: 'password',
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        className: 'input-base',
                        placeholder: '••••••••',
                        required: true,
                        disabled: isLoading
                    })
                ),
                
                // Error
                error && React.createElement('div', {
                    className: 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm'
                }, 
                    React.createElement('div', {
                        className: 'flex items-center'
                    },
                        React.createElement('span', {
                            className: 'mr-2'
                        }, '⚠️'),
                        error
                    )
                ),
                
                // Submit button
                React.createElement('button', {
                    type: 'submit',
                    disabled: isLoading,
                    className: `btn-base btn-primary w-full ${isLoading ? 'loading-state' : ''}`
                }, 
                    isLoading ? 
                        React.createElement('div', {
                            className: 'flex items-center justify-center'
                        },
                            React.createElement('div', {
                                className: 'loading-spinner mr-2',
                                style: { width: '20px', height: '20px' }
                            }),
                            'Iniciando sesión...'
                        ) : 
                        React.createElement('div', {
                            className: 'flex items-center justify-center'
                        },
                            React.createElement('span', {
                                className: 'mr-2'
                            }, '🔐'),
                            'Iniciar Sesión'
                        )
                )
            ),
            
            // Footer
            React.createElement('div', {
                className: 'mt-6 text-center'
            },
                React.createElement('p', {
                    className: 'text-xs text-gray-500'
                }, `v${window.UGCConfig.APP_VERSION} • Desarrollado por AIDA Digital`)
            )
        )
    );
}

// Componente de carga para verificación de auth
function AuthLoader() {
    return React.createElement('div', {
        className: 'min-h-screen bg-gray-50 flex items-center justify-center'
    },
        React.createElement('div', {
            className: 'text-center'
        },
            React.createElement('div', {
                className: 'loading-spinner mx-auto mb-4'
            }),
            React.createElement('p', {
                className: 'text-gray-600 mb-2'
            }, 'Verificando sesión...'),
            React.createElement('p', {
                className: 'text-xs text-gray-500'
            }, 'UGC Creators Dashboard')
        )
    );
}

// Componente de ruta protegida
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    
    if (loading) {
        return React.createElement(AuthLoader);
    }
    
    return user ? children : React.createElement(LoginPage);
}

// Verificar si el usuario tiene permisos específicos
function usePermissions() {
    const { user } = useAuth();
    
    return {
        canCreateUsers: user?.role === 'admin',
        canEditCreators: user?.role === 'admin',
        canDeleteCreators: user?.role === 'admin',
        canExportData: true, // Todos pueden exportar
        canViewAnalytics: true, // Todos pueden ver analytics
        canManageBrands: user?.role === 'admin'
    };
}

// Componente para mostrar información del usuario
function UserInfo({ showEmail = false, className = '' }) {
    const { user } = useAuth();
    
    if (!user) return null;
    
    return React.createElement('div', {
        className: `flex items-center ${className}`
    },
        // Avatar
        React.createElement('div', {
            className: `w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${UGCUtils.getAvatarColor(user.name)}`
        }, UGCUtils.getInitials(user.name)),
        
        // Info
        React.createElement('div', {
            className: 'ml-3'
        },
            React.createElement('p', {
                className: 'text-sm font-medium text-gray-900'
            }, user.name?.split(' ')[0] || 'Usuario'),
            showEmail && React.createElement('p', {
                className: 'text-xs text-gray-500'
            }, user.email)
        )
    );
}

// Exportar componentes y hooks
window.AuthComponents = {
    AuthProvider,
    LoginPage,
    AuthLoader,
    ProtectedRoute,
    UserInfo
};

window.AuthHooks = {
    useAuth,
    usePermissions
};

UGCUtils.log('Auth module loaded successfully');