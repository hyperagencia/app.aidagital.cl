# UGC Creators Dashboard - AIDA Digital

Dashboard modular para gestión de creators UGC desarrollado con React y arquitectura escalable.

## 🏗️ Arquitectura Modular

El proyecto está estructurado en módulos independientes para facilitar el mantenimiento y escalabilidad:

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes base (Button, Input, etc.)
│   ├── layout/          # Componentes de layout (Sidebar, Header)
│   └── common/          # Componentes comunes
├── modules/             # Módulos principales de la aplicación
│   ├── auth/           # Autenticación y autorización
│   ├── dashboard/      # Dashboard principal y estadísticas
│   ├── creators/       # Gestión de creators
│   ├── brands/         # Gestión de marcas (futuro)
│   └── users/          # Gestión de usuarios (futuro)
├── services/           # Servicios globales
│   ├── api.js         # Cliente API base
│   ├── config.js      # Configuración global
│   └── storage.js     # Manejo de localStorage
├── utils/              # Utilidades globales
│   ├── formatters.js  # Funciones de formato
│   ├── validators.js  # Validaciones
│   └── helpers.js     # Funciones auxiliares
├── hooks/              # Hooks globales
├── styles/             # Estilos globales
└── types/              # Tipos TypeScript (opcional)
```

## 🚀 Tecnologías

- **React 18** - Framework principal
- **Vite** - Build tool y desarrollo
- **Tailwind CSS** - Framework de estilos
- **JavaScript ES6+** - Lenguaje principal
- **Fetch API** - Cliente HTTP

## 📦 Instalación

```bash
# Clonar repositorio
git clone [URL_DEL_REPO]
cd ugc-dashboard

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar desarrollo
npm run dev
```

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run dev:host         # Servidor con acceso de red

# Build
npm run build            # Build de producción
npm run preview          # Preview del build

# Deployment
npm run deploy           # Build y deploy

# Linting y formato
npm run lint             # Linter
npm run lint:fix         # Fix automático
npm run format           # Formatear código
```

## 🏛️ Estructura de Módulos

### Módulo de Autenticación (`auth/`)

```
auth/
├── components/
│   ├── LoginForm.jsx        # Formulario de login
│   ├── ProtectedRoute.jsx   # Rutas protegidas
│   └── UserInfo.jsx         # Info del usuario
├── hooks/
│   ├── useAuth.js           # Hook principal de auth
│   └── usePermissions.js    # Hook de permisos
├── context/
│   └── AuthContext.jsx      # Context de autenticación
├── services/
│   └── authService.js       # Servicio de auth
└── index.js                 # Exportaciones del módulo
```

### Módulo de Creators (`creators/`)

```
creators/
├── components/
│   ├── CreatorsList.jsx     # Lista de creators
│   ├── CreatorCard.jsx      # Card individual
│   ├── CreatorFilters.jsx   # Filtros
│   └── SearchBar.jsx        # Barra de búsqueda
├── hooks/
│   ├── useCreators.js       # Hook principal
│   └── useCreatorFilters.js # Hook de filtros
├── services/
│   └── creatorsService.js   # Servicio CRUD
└── index.js
```

### Módulo de Dashboard (`dashboard/`)

```
dashboard/
├── components/
│   ├── DashboardPage.jsx    # Página principal
│   ├── StatsCard.jsx        # Tarjetas de estadísticas
│   └── PlatformStats.jsx    # Stats por plataforma
├── hooks/
│   └── useDashboardStats.js # Hook de estadísticas
├── services/
│   └── dashboardService.js  # Servicio de datos
└── index.js
```

## 🔧 Servicios Base

### API Client (`services/api.js`)

Cliente HTTP centralizado con:
- Manejo automático de tokens
- Interceptores de error
- Configuración base de headers

```javascript
import { api } from '../services/api.js';

// GET request
const data = await api.get('/creators');

// POST request
const result = await api.post('/creators', creatorData);
```

### Storage Service (`services/storage.js`)

Manejo de localStorage con:
- Prefijos automáticos
- Serialización JSON
- Manejo de errores

```javascript
import { storage } from '../services/storage.js';

// Guardar datos
storage.set('key', { data: 'value' });

// Obtener datos
const data = storage.get('key', defaultValue);
```

### Configuration (`services/config.js`)

Configuración centralizada:
- Variables de entorno
- Endpoints API
- Feature flags
- Constantes globales

## 🎨 Componentes UI

### Componentes Base

```javascript
import { UI } from '../components/ui/index.js';

// Button
<UI.Button variant="primary" size="md" loading={false}>
  Click me
</UI.Button>

// Input
<UI.Input 
  label="Email"
  type="email"
  error="Error message"
  required
/>

// Card
<UI.Card hover className="p-6">
  Content here
</UI.Card>
```

### Sistema de Design

- **Colores**: Purple como primario, sistema de grises
- **Tipografía**: System fonts con Tailwind
- **Espaciado**: Sistema consistente con Tailwind
- **Componentes**: Reutilizables y configurables

## 📡 API Integration

### Endpoints Base

```javascript
// Configuración en services/config.js
const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth.php?action=login',
    LOGOUT: '/auth.php?action=logout',
    VERIFY: '/auth.php?action=verify',
  },
  CREATORS: {
    LIST: '/creators.php',
    CREATE: '/creators.php',
    // ...
  }
};
```

### Uso en Servicios

```javascript
// En cualquier servicio
const response = await api.get(config.ENDPOINTS.CREATORS.LIST);
```

## 🔐 Autenticación y Permisos

### Sistema de Permisos

```javascript
import { usePermissions } from '../modules/auth/hooks/index.js';

const Component = () => {
  const permissions = usePermissions();
  
  if (!permissions.canViewCreators) {
    return <AccessDenied />;
  }
  
  return <CreatorsPage />;
};
```

### Rutas Protegidas

```javascript
<ProtectedRoute requireAdmin={true}>
  <AdminPage />
</ProtectedRoute>
```

## 🗂️ Gestión de Estado

### Context + Hooks Pattern

- **Context**: Para estado global (Auth)
- **Hooks personalizados**: Para lógica específica
- **Local state**: Para componentes individuales

```javascript
// Hook personalizado
const useCreators = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lógica del hook...
  
  return { creators, loading, fetchCreators };
};
```

## 🎯 Validaciones

### Sistema de Validación

```javascript
import { validation } from '../utils/validators.js';

// Validar creator
const result = validation.validateCreator(creatorData);
if (!result.isValid) {
  console.log(result.errors);
}

// Validar email
if (!validation.isValidEmail(email)) {
  // Handle error
}
```

## 🎨 Formateo de Datos

### Utilidades de Formato

```javascript
import { formatters } from '../utils/formatters.js';

// Formatear intereses
const formatted = formatters.formatInterests(['moda', 'belleza']);

// Formatear fecha
const date = formatters.formatTimeAgo('2024-01-01');

// Formatear plataforma
const platform = formatters.formatPlatform('instagram');
```

## 🔄 Routing

### Sistema de Rutas

```javascript
// En cualquier componente
const { navigate } = useAppRouter();

// Navegar programáticamente
navigate('creators');

// Obtener ruta actual
const { currentRoute } = useAppRouter();
```

## 🚀 Deployment

### Build de Producción

```bash
# Build
npm run build

# Los archivos se generan en dist/
dist/
├── index.html
├── assets/
│   ├── index.[hash].js
│   └── index.[hash].css
└── ...
```

### Variables de Entorno

```bash
# .env
VITE_API_BASE=https://aidadigital.cl/wp-content/themes/salient/api
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
```

## 🧪 Testing (Futuro)

```bash
# Cuando se implemente testing
npm run test              # Tests unitarios
npm run test:watch        # Tests en modo watch
npm run test:coverage     # Coverage report
npm run test:e2e          # Tests E2E
```

## 📝 Convenciones de Código

### Nomenclatura

- **Componentes**: PascalCase (`CreatorCard.jsx`)
- **Hooks**: camelCase con prefijo `use` (`useCreators.js`)
- **Servicios**: camelCase con sufijo `Service` (`creatorsService.js`)
- **Utilidades**: camelCase (`formatters.js`)

### Estructura de Archivos

```javascript
// Orden de imports
import React from 'react';                    // Libs externas
import { useAuth } from '../hooks/index.js';  // Hooks internos
import { UI } from '../components/ui.js';     // Componentes
import { formatters } from '../utils.js';     // Utils
import { config } from '../services.js';      // Servicios

// Orden en componentes
const Component = () => {
  // 1. Hooks
  // 2. State
  // 3. Effects
  // 4. Handlers
  // 5. Render
};
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Commits Semánticos

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato de código
refactor: refactoring
test: tests
chore: mantenimiento
```

## 📚 Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/)
- [Guías de Arquitectura](./docs/architecture.md)

## 📄 Licencia

Proyecto privado - AIDA Digital © 2024

## 🆘 Soporte

Para dudas o problemas:
- 📧 Email: dev@aidadigital.cl
- 💬 Slack: #desarrollo
- 📱 WhatsApp: [Número de contacto]

---

**Desarrollado con ❤️ por el equipo de AIDA Digital**