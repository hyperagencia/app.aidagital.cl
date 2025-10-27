<?php
/**
 * API REST para UGC Creators - VERSION COMPATIBLE CON CONFIG.PHP
 * Endpoint: /api/creators.php
 */

require_once '../config.php';

class CreatorAPI {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
        
        // ✅ Ya no necesitamos esto porque config.php lo maneja
        // La conexión ya viene con UTF-8 desde config.php
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        try {
            switch ($method) {
                case 'POST':
                    $this->createCreator();
                    break;
                case 'GET':
                    $this->getCreators();
                    break;
                case 'PUT':
                    $this->updateCreator();
                    break;
                case 'DELETE':
                    $this->deleteCreator();
                    break;
                default:
                    jsonResponse(null, 405, 'Método no permitido'); // ✅ Usar función de config.php
            }
        } catch (Exception $e) {
            logError("API Exception: " . $e->getMessage()); // ✅ Usar función de config.php
            jsonResponse(null, 500, 'Error interno del servidor');
        }
    }
    
    private function getCreators() {
        // Parámetros de consulta con soporte para "all"
        $page = max(1, (int)($_GET['page'] ?? 1));
        $userId = 1; // Por ahora usuario fijo
        
        // Permitir obtener TODOS los registros
        if (isset($_GET['limit']) && $_GET['limit'] === 'all') {
            $limit = 9999; // Sin límite práctico
            $offset = 0;
            $page = 1;
        } else {
            $limit = min(100, max(10, (int)($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;
        }
        
        // ✅ NUEVO: Filtro de favoritos
        $onlyFavorites = isset($_GET['favorites']) && $_GET['favorites'] === 'true';

        // Filtros
        $filters = [];
        $params = [];

        // ✅ Filtro de búsqueda por texto (nombre o email)
        if (!empty($_GET['search'])) {
            $searchTerm = '%' . $_GET['search'] . '%';
            $filters[] = "(c.full_name LIKE ? OR c.email LIKE ?)";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // ✅ Filtro de solo favoritos
        if ($onlyFavorites) {
            $filters[] = "EXISTS (SELECT 1 FROM creator_favorites cf WHERE cf.creator_id = c.id AND cf.user_id = ?)";
            $params[] = $userId;
        }

        if (!empty($_GET['nationality'])) {
            $filters[] = "c.nationality = ?";
            $params[] = $_GET['nationality'];
        }

        if (!empty($_GET['location'])) {
            $filters[] = "c.location = ?";
            $params[] = $_GET['location'];
        }

        // ✅ Filtro por modalidad
        if (!empty($_GET['modality'])) {
            $filters[] = "c.modality = ?";
            $params[] = $_GET['modality'];
        }

        // ✅ Filtro por plataforma individual (compatibilidad)
        if (!empty($_GET['platform'])) {
            $filters[] = "EXISTS (SELECT 1 FROM creator_social_networks csn WHERE csn.creator_id = c.id AND csn.platform = ?)";
            $params[] = $_GET['platform'];
        }

        // ✅ Filtro por múltiples plataformas (nuevo)
        if (!empty($_GET['platforms'])) {
            $platformsList = explode(',', $_GET['platforms']);
            $platformPlaceholders = implode(',', array_fill(0, count($platformsList), '?'));
            $filters[] = "EXISTS (SELECT 1 FROM creator_social_networks csn WHERE csn.creator_id = c.id AND csn.platform IN ($platformPlaceholders))";
            foreach ($platformsList as $platform) {
                $params[] = trim($platform);
            }
        }

        // ✅ Filtro por múltiples intereses (nuevo)
        if (!empty($_GET['interests'])) {
            $interestsList = explode(',', $_GET['interests']);
            $interestPlaceholders = implode(',', array_fill(0, count($interestsList), '?'));
            $filters[] = "EXISTS (SELECT 1 FROM creator_interests ci2 WHERE ci2.creator_id = c.id AND ci2.interest IN ($interestPlaceholders))";
            foreach ($interestsList as $interest) {
                $params[] = trim($interest);
            }
        }

        // ✅ Filtro por rango de edad (actualizado para usar ageMin y ageMax)
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

        // Compatibilidad con nombres antiguos de filtros de edad
        if (!empty($_GET['min_age']) || !empty($_GET['max_age'])) {
            $currentYear = date('Y');
            if (!empty($_GET['min_age'])) {
                $maxBirthYear = $currentYear - (int)$_GET['min_age'];
                $filters[] = "c.birth_year <= ?";
                $params[] = $maxBirthYear;
            }
            if (!empty($_GET['max_age'])) {
                $minBirthYear = $currentYear - (int)$_GET['max_age'];
                $filters[] = "c.birth_year >= ?";
                $params[] = $minBirthYear;
            }
        }
        
        // Construir consulta
        $whereClause = !empty($filters) ? "WHERE " . implode(" AND ", $filters) : "";
        
        // ✅ Consulta principal que incluye información de favoritos
        $sql = "SELECT c.*, 
                       (YEAR(CURDATE()) - c.birth_year) as age,
                       GROUP_CONCAT(DISTINCT ci.interest SEPARATOR ',') as interests,
                       CASE WHEN cf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
                FROM creators c
                LEFT JOIN creator_interests ci ON c.id = ci.creator_id
                LEFT JOIN creator_favorites cf ON c.id = cf.creator_id AND cf.user_id = ?
                $whereClause
                GROUP BY c.id
                ORDER BY c.created_at DESC";
        
        // ✅ Agregar userId al principio de params para el JOIN de favoritos
        array_unshift($params, $userId);
        
        // Solo agregar límite si no es "all"
        if (!isset($_GET['limit']) || $_GET['limit'] !== 'all') {
            $sql .= " LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $creators = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Obtener redes sociales por separado para cada creator
        foreach ($creators as &$creator) {
            // Obtener redes sociales con URLs
            $socialSql = "SELECT platform, followers_range, profile_link 
                         FROM creator_social_networks 
                         WHERE creator_id = ?";
            $socialStmt = $this->db->prepare($socialSql);
            $socialStmt->execute([$creator['id']]);
            $socialNetworks = $socialStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Procesar redes sociales
            $creator['platforms'] = [];
            $creator['social_networks'] = [];
            $creator['followers_range'] = null;
            
            foreach ($socialNetworks as $social) {
                $creator['platforms'][] = $social['platform'];
                $creator['social_networks'][] = [
                    'platform' => $social['platform'],
                    'followers_range' => $social['followers_range'],
                    'profile_link' => $social['profile_link']
                ];
                
                // Usar el primer rango de seguidores como principal
                if (!$creator['followers_range']) {
                    $creator['followers_range'] = $social['followers_range'];
                }
            }
            
            // Procesar intereses
            $creator['interests'] = $creator['interests'] ? explode(',', $creator['interests']) : [];
            
            // ✅ Convertir is_favorite a boolean
            $creator['is_favorite'] = (bool)$creator['is_favorite'];
        }
        
        // Contar total para paginación
        $countSql = "SELECT COUNT(DISTINCT c.id) FROM creators c 
                     LEFT JOIN creator_interests ci ON c.id = ci.creator_id
                     LEFT JOIN creator_favorites cf ON c.id = cf.creator_id AND cf.user_id = ?
                     $whereClause";
        
        // Para el conteo, usar los mismos parámetros pero sin limit/offset
        $countParams = array_slice($params, 0, count($params) - ((!isset($_GET['limit']) || $_GET['limit'] !== 'all') ? 2 : 0));
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($countParams);
        $total = $countStmt->fetchColumn();
        
        // ✅ Usar función jsonResponse de config.php
        jsonResponse([
            'creators' => $creators,
            'pagination' => [
                'page' => $page,
                'limit' => isset($_GET['limit']) && $_GET['limit'] === 'all' ? 'all' : $limit,
                'total' => (int)$total,
                'pages' => isset($_GET['limit']) && $_GET['limit'] === 'all' ? 1 : ceil($total / $limit),
                'filters_applied' => [
                    'search' => $_GET['search'] ?? null,
                    'favorites_only' => $onlyFavorites,
                    'nationality' => $_GET['nationality'] ?? null,
                    'location' => $_GET['location'] ?? null,
                    'modality' => $_GET['modality'] ?? null,
                    'platforms' => $_GET['platforms'] ?? null,
                    'interests' => $_GET['interests'] ?? null,
                    'ageMin' => $_GET['ageMin'] ?? null,
                    'ageMax' => $_GET['ageMax'] ?? null,
                ]
            ]
        ], 200, 'Creators obtenidos exitosamente');
    }
    
    private function createCreator() {
        // Obtener datos del formulario
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            jsonResponse(null, 400, 'Datos JSON inválidos');
        }
        
        // Validar datos requeridos
        $requiredFields = ['personalInfo', 'socialNetworks', 'interests', 'finalInfo'];
        foreach ($requiredFields as $field) {
            if (!isset($input[$field])) {
                jsonResponse(null, 400, "Campo requerido faltante: $field");
            }
        }
        
        $personalInfo = $input['personalInfo'];
        $socialNetworks = $input['socialNetworks'];
        $interests = $input['interests'];
        $finalInfo = $input['finalInfo'];
        
        // Validar campos de información personal
        $requiredPersonal = ['fullName', 'email', 'phone', 'gender', 'birthYear', 'nationality'];
        foreach ($requiredPersonal as $field) {
            if (empty($personalInfo[$field])) {
                jsonResponse(null, 400, "Campo personal requerido: $field");
            }
        }
        
        // Validar email único
        if ($this->emailExists($personalInfo['email'])) {
            jsonResponse(null, 409, 'Este email ya está registrado');
        }
        
        // Iniciar transacción
        $this->db->beginTransaction();
        
        try {
            // Insertar creator principal
            $creatorId = $this->insertCreator($personalInfo, $finalInfo);
            
            // Insertar redes sociales
            $this->insertSocialNetworks($creatorId, $socialNetworks);
            
            // Insertar intereses
            $this->insertInterests($creatorId, $interests);
            
            // Confirmar transacción
            $this->db->commit();
            
            // Enviar email de notificación (opcional)
            $this->sendNotificationEmail($personalInfo);
            
            jsonResponse([
                'id' => $creatorId,
                'message' => 'Creator registrado exitosamente'
            ], 201, 'Registro completado');
            
        } catch (Exception $e) {
            $this->db->rollback();
            logError("Error creating creator: " . $e->getMessage());
            jsonResponse(null, 500, 'Error al registrar creator');
        }
    }
    
    private function emailExists($email) {
        $stmt = $this->db->prepare("SELECT id FROM creators WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetchColumn() !== false;
    }
    
    private function insertCreator($personalInfo, $finalInfo) {
        $sql = "INSERT INTO creators (full_name, email, phone, gender, birth_year, nationality, location, modality) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $personalInfo['fullName'],
            $personalInfo['email'],
            $personalInfo['phone'],
            $personalInfo['gender'],
            $personalInfo['birthYear'],
            $personalInfo['nationality'],
            $finalInfo['location'],
            $finalInfo['modality']
        ]);
        
        return $this->db->lastInsertId();
    }
    
    private function insertSocialNetworks($creatorId, $socialNetworks) {
        $sql = "INSERT INTO creator_social_networks (creator_id, platform, followers_range, profile_link) 
                VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        
        foreach ($socialNetworks as $network) {
            if (!empty($network['platform']) && !empty($network['followers']) && !empty($network['profileLink'])) {
                $stmt->execute([
                    $creatorId,
                    $network['platform'],
                    $network['followers'],
                    $network['profileLink']
                ]);
            }
        }
    }
    
    private function insertInterests($creatorId, $interests) {
        $sql = "INSERT INTO creator_interests (creator_id, interest) VALUES (?, ?)";
        $stmt = $this->db->prepare($sql);
        
        foreach ($interests as $interest) {
            if (!empty($interest)) {
                $stmt->execute([$creatorId, $interest]);
            }
        }
    }
    
    private function sendNotificationEmail($personalInfo) {
        $to = ADMIN_EMAIL;
        $subject = "Nuevo Creator Registrado: " . $personalInfo['fullName'];
        $message = "Se ha registrado un nuevo creator:\n\n";
        $message .= "Nombre: " . $personalInfo['fullName'] . "\n";
        $message .= "Email: " . $personalInfo['email'] . "\n";
        $message .= "Teléfono: " . $personalInfo['phone'] . "\n";
        $message .= "Fecha: " . date('Y-m-d H:i:s') . "\n";
        
        $headers = "From: noreply@aidadigital.cl\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        @mail($to, $subject, $message, $headers);
    }
    
    // ✅ Métodos placeholder para completar la API
    private function updateCreator() {
        jsonResponse(null, 501, 'Función updateCreator no implementada aún');
    }
    
    private function deleteCreator() {
        jsonResponse(null, 501, 'Función deleteCreator no implementada aún');
    }
}

// Ejecutar API
$api = new CreatorAPI($db);
$api->handleRequest();
?>