# Implementación de Filtros en Backend - Guía Completa

## Resumen de Cambios

Se ha implementado un sistema completo de filtrado en el backend que permite filtrar sobre **toda la base de datos** de creators, mostrando solo 20 resultados a la vez mediante paginación.

---

## Arquitectura del Sistema

### Frontend → Backend Flow

```
Usuario aplica filtros en UI
    ↓
useCreatorFilters detecta cambios
    ↓
updateFilters() envía nuevos filtros a useCreators
    ↓
useCreators hace petición HTTP con query params
    ↓
GET /api/creators.php?search=maria&interests=moda,belleza&page=1&limit=20
    ↓
Backend filtra en base de datos MySQL
    ↓
Retorna 20 resultados filtrados + paginación
```

---

## Filtros Implementados en Backend

### 1. **Búsqueda por Texto** (`search`)

**Parámetro**: `?search=maria`

**Código PHP**:
```php
if (!empty($_GET['search'])) {
    $searchTerm = '%' . $_GET['search'] . '%';
    $filters[] = "(c.full_name LIKE ? OR c.email LIKE ?)";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}
```

**Busca en**:
- Nombre completo del creator
- Email del creator

**Ejemplo**:
```
GET /api/creators.php?search=maria
→ Retorna creators con "maria" en nombre o email
```

---

### 2. **Filtro por Intereses** (`interests`)

**Parámetro**: `?interests=moda,belleza,lifestyle`

**Código PHP**:
```php
if (!empty($_GET['interests'])) {
    $interestsList = explode(',', $_GET['interests']);
    $interestPlaceholders = implode(',', array_fill(0, count($interestsList), '?'));
    $filters[] = "EXISTS (SELECT 1 FROM creator_interests ci2
                  WHERE ci2.creator_id = c.id
                  AND ci2.interest IN ($interestPlaceholders))";
    foreach ($interestsList as $interest) {
        $params[] = trim($interest);
    }
}
```

**Características**:
- Acepta múltiples intereses separados por comas
- Busca creators que tengan **al menos uno** de los intereses
- Query optimizado con EXISTS para mejor performance

**Ejemplo**:
```
GET /api/creators.php?interests=moda,tecnologia
→ Retorna creators interesados en moda O tecnología
```

---

### 3. **Filtro por Plataformas** (`platforms`)

**Parámetro**: `?platforms=instagram,tiktok,youtube`

**Código PHP**:
```php
if (!empty($_GET['platforms'])) {
    $platformsList = explode(',', $_GET['platforms']);
    $platformPlaceholders = implode(',', array_fill(0, count($platformsList), '?'));
    $filters[] = "EXISTS (SELECT 1 FROM creator_social_networks csn
                  WHERE csn.creator_id = c.id
                  AND csn.platform IN ($platformPlaceholders))";
    foreach ($platformsList as $platform) {
        $params[] = trim($platform);
    }
}
```

**Características**:
- Acepta múltiples plataformas separadas por comas
- Busca creators activos en **al menos una** de las plataformas
- Usa JOIN con tabla `creator_social_networks`

**Ejemplo**:
```
GET /api/creators.php?platforms=instagram,youtube
→ Retorna creators con cuenta de Instagram O YouTube
```

---

### 4. **Filtro por Nacionalidad** (`nationality`)

**Parámetro**: `?nationality=chilena`

**Código PHP**:
```php
if (!empty($_GET['nationality'])) {
    $filters[] = "c.nationality = ?";
    $params[] = $_GET['nationality'];
}
```

**Valores posibles**:
- `chilena`
- `extranjera`

**Ejemplo**:
```
GET /api/creators.php?nationality=chilena
→ Retorna solo creators chilenos
```

---

### 5. **Filtro por Ubicación** (`location`)

**Parámetro**: `?location=santiago`

**Código PHP**:
```php
if (!empty($_GET['location'])) {
    $filters[] = "c.location = ?";
    $params[] = $_GET['location'];
}
```

**Valores posibles**:
- `santiago`
- `valparaiso`
- `concepcion`
- `antofagasta`
- `la-serena`
- `temuco`

**Ejemplo**:
```
GET /api/creators.php?location=santiago
→ Retorna creators ubicados en Santiago
```

---

### 6. **Filtro por Modalidad** (`modality`)

**Parámetro**: `?modality=remoto`

**Código PHP**:
```php
if (!empty($_GET['modality'])) {
    $filters[] = "c.modality = ?";
    $params[] = $_GET['modality'];
}
```

**Valores posibles**:
- `presencial`
- `remoto`
- `hibrido`

**Ejemplo**:
```
GET /api/creators.php?modality=remoto
→ Retorna creators que trabajan remoto
```

---

### 7. **Filtro por Rango de Edad** (`ageMin`, `ageMax`)

**Parámetros**: `?ageMin=18&ageMax=30`

**Código PHP**:
```php
if (!empty($_GET['ageMin']) || !empty($_GET['ageMax'])) {
    $currentYear = date('Y');
    if (!empty($_GET['ageMin'])) {
        $maxBirthYear = $currentYear - (int)$_GET['ageMin'];
        $filters[] = "c.birth_year <= ?";
        $params[] = $maxBirthYear;
    }
    if (!empty($_GET['ageMax'])) {
        $minBirthYear = $currentYear - (int)$_GET['ageMax'];
        $filters[] = "c.birth_year >= ?";
        $params[] = $minBirthYear;
    }
}
```

**Características**:
- Convierte edad a año de nacimiento para filtrar
- Permite rango parcial (solo min o solo max)
- Calcula dinámicamente basado en año actual

**Ejemplo**:
```
GET /api/creators.php?ageMin=18&ageMax=30
→ Retorna creators entre 18 y 30 años

Si año actual es 2025:
- ageMin=18 → birth_year <= 2007
- ageMax=30 → birth_year >= 1995
```

---

### 8. **Filtro de Favoritos** (`favorites`)

**Parámetro**: `?favorites=true`

**Código PHP**:
```php
if ($onlyFavorites) {
    $filters[] = "EXISTS (SELECT 1 FROM creator_favorites cf
                  WHERE cf.creator_id = c.id AND cf.user_id = ?)";
    $params[] = $userId;
}
```

**Características**:
- Muestra solo creators marcados como favoritos
- Filtrado por usuario actual
- Usa tabla `creator_favorites`

**Ejemplo**:
```
GET /api/creators.php?favorites=true
→ Retorna solo creators marcados como favoritos
```

---

## Paginación

### Parámetros

- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 20, max: 100)

### Ejemplo de uso

```
GET /api/creators.php?page=1&limit=20&interests=moda
```

### Respuesta

```json
{
  "success": true,
  "status": 200,
  "data": {
    "creators": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8,
      "filters_applied": {
        "search": null,
        "favorites_only": false,
        "nationality": null,
        "location": null,
        "modality": null,
        "platforms": null,
        "interests": "moda",
        "ageMin": null,
        "ageMax": null
      }
    }
  },
  "message": "Creators obtenidos exitosamente"
}
```

---

## Ejemplos de Queries Combinadas

### Ejemplo 1: Búsqueda compleja
```
GET /api/creators.php?search=maria&interests=moda,belleza&platforms=instagram&nationality=chilena&ageMin=18&ageMax=35&page=1&limit=20
```

**Retorna**: Creators que:
- Tengan "maria" en nombre o email
- Estén interesados en moda O belleza
- Tengan cuenta de Instagram
- Sean chilenos
- Tengan entre 18 y 35 años
- Página 1, 20 resultados

### Ejemplo 2: Solo favoritos de Santiago
```
GET /api/creators.php?favorites=true&location=santiago&page=1
```

**Retorna**: Creators favoritos del usuario ubicados en Santiago

### Ejemplo 3: Influencers jóvenes de TikTok
```
GET /api/creators.php?platforms=tiktok&ageMax=25&modality=remoto
```

**Retorna**: Creators de TikTok menores de 25 años que trabajan remoto

---

## Optimización de Base de Datos

### Índices Recomendados

Para mejorar el rendimiento, crear estos índices:

```sql
-- Índice para búsqueda de texto
CREATE INDEX idx_creators_fulltext ON creators(full_name, email);

-- Índice para filtros comunes
CREATE INDEX idx_creators_filters ON creators(nationality, location, modality);

-- Índice para edad
CREATE INDEX idx_creators_birth_year ON creators(birth_year);

-- Índice para favoritos
CREATE INDEX idx_favorites_user_creator ON creator_favorites(user_id, creator_id);

-- Índice para plataformas
CREATE INDEX idx_social_platform ON creator_social_networks(creator_id, platform);

-- Índice para intereses
CREATE INDEX idx_interests_creator ON creator_interests(creator_id, interest);
```

### Explicación de Query Principal

```sql
SELECT c.*,
       (YEAR(CURDATE()) - c.birth_year) as age,
       GROUP_CONCAT(DISTINCT ci.interest SEPARATOR ',') as interests,
       CASE WHEN cf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
FROM creators c
LEFT JOIN creator_interests ci ON c.id = ci.creator_id
LEFT JOIN creator_favorites cf ON c.id = cf.creator_id AND cf.user_id = ?
WHERE [filtros dinámicos]
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT ? OFFSET ?
```

**Por qué es eficiente**:
1. `LEFT JOIN` trae intereses y favoritos en una sola query
2. `GROUP_CONCAT` agrupa intereses en string separado por comas
3. `GROUP BY c.id` previene duplicados
4. `LIMIT/OFFSET` implementa paginación eficiente
5. Filtros usan prepared statements para seguridad

---

## Testing

### Test 1: Sin filtros
```bash
curl "https://aidadigital.cl/wp-content/themes/salient/api/creators.php?page=1&limit=20"
```

### Test 2: Búsqueda por texto
```bash
curl "https://aidadigital.cl/wp-content/themes/salient/api/creators.php?search=maria"
```

### Test 3: Filtros múltiples
```bash
curl "https://aidadigital.cl/wp-content/themes/salient/api/creators.php?interests=moda,belleza&platforms=instagram&nationality=chilena"
```

### Test 4: Paginación con filtros
```bash
curl "https://aidadigital.cl/wp-content/themes/salient/api/creators.php?interests=moda&page=2&limit=10"
```

---

## Resumen de Archivos Modificados

### Frontend

1. **[src/modules/creators/hooks/index.js](src/modules/creators/hooks/index.js)**
   - Hook `useCreators` envía filtros al servidor
   - Hook `useCreatorFilters` actualizado para trabajar con servidor

2. **[src/modules/creators/components/CreatorsPage.jsx](src/modules/creators/components/CreatorsPage.jsx)**
   - Conecta hooks correctamente
   - Usa creators directos del servidor (ya filtrados)

3. **[src/modules/creators/services/creatorsService.js](src/modules/creators/services/creatorsService.js)**
   - Método `buildQueryParams` incluye todos los filtros

### Backend

1. **[api/creators.php](api/creators.php)**
   - Implementados 8 filtros completos
   - Paginación optimizada
   - Query SQL con JOINs eficientes
   - Respuesta con metadata de filtros aplicados

---

## Próximos Pasos (Opcional)

### Mejoras Futuras

1. **Full-text search** en MySQL para búsqueda más rápida
2. **Caché de filtros** para opciones dinámicas
3. **Ordenamiento configurable** (sortBy, sortOrder)
4. **Exportación filtrada** (CSV/JSON con filtros aplicados)
5. **Filtros guardados** (permitir guardar combinaciones frecuentes)

### Estadísticas de filtros

Crear endpoint para obtener opciones disponibles:

```php
GET /api/creators.php?action=filter-options
```

Retornaría:
```json
{
  "interests": ["moda", "belleza", "tecnologia", ...],
  "platforms": ["instagram", "tiktok", "youtube", ...],
  "nationalities": ["chilena", "extranjera"],
  "locations": ["santiago", "valparaiso", ...],
  "modalities": ["presencial", "remoto", "hibrido"],
  "age_ranges": {
    "min": 18,
    "max": 65
  }
}
```

---

## Soporte

Si tienes preguntas o encuentras algún problema:

1. Revisa los logs en `api/error_log`
2. Verifica que todos los índices de BD estén creados
3. Confirma que los datos de prueba existan en todas las tablas
4. Usa herramientas de debugging como Postman o curl

**Archivo creado**: `IMPLEMENTACION_FILTROS_BACKEND.md`
**Fecha**: 2025-10-24
