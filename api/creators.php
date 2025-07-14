<?php
/**
 * API REST para UGC Creators
 * Endpoint: /api/creators.php
 */

require_once '../config.php';

// Validar API Key (opcional)
// validateApiKey();

class CreatorAPI {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
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
                    jsonResponse(null, 405, 'Método no permitido');
            }
        } catch (Exception $e) {
            logError("API Exception: " . $e->getMessage());
            jsonResponse(null, 500, 'Error interno del servidor');
        }
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
    
    private function getCreators() {
        // Parámetros de consulta
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(10, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        
        // Filtros
        $filters = [];
        $params = [];
        
        if (!empty($_GET['nationality'])) {
            $filters[] = "c.nationality = ?";
            $params[] = $_GET['nationality'];
        }
        
        if (!empty($_GET['location'])) {
            $filters[] = "c.location = ?";
            $params[] = $_GET['location'];
        }
        
        if (!empty($_GET['platform'])) {
            $filters[] = "EXISTS (SELECT 1 FROM creator_social_networks csn WHERE csn.creator_id = c.id AND csn.platform = ?)";
            $params[] = $_GET['platform'];
        }
        
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
        
        // Consulta principal
        $sql = "SELECT c.*, 
                       (YEAR(CURDATE()) - c.birth_year) as age,
                       GROUP_CONCAT(DISTINCT csn.platform) as platforms,
                       GROUP_CONCAT(DISTINCT ci.interest) as interests
                FROM creators c
                LEFT JOIN creator_social_networks csn ON c.id = csn.creator_id
                LEFT JOIN creator_interests ci ON c.id = ci.creator_id
                $whereClause
                GROUP BY c.id
                ORDER BY c.created_at DESC
                LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $creators = $stmt->fetchAll();
        
        // Contar total para paginación
        $countSql = "SELECT COUNT(DISTINCT c.id) FROM creators c 
                     LEFT JOIN creator_social_networks csn ON c.id = csn.creator_id
                     LEFT JOIN creator_interests ci ON c.id = ci.creator_id
                     $whereClause";
        
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute(array_slice($params, 0, -2)); // Excluir limit y offset
        $total = $countStmt->fetchColumn();
        
        // Procesar datos
        foreach ($creators as &$creator) {
            $creator['platforms'] = $creator['platforms'] ? explode(',', $creator['platforms']) : [];
            $creator['interests'] = $creator['interests'] ? explode(',', $creator['interests']) : [];
        }
        
        jsonResponse([
            'creators' => $creators,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }
    
    private function sendNotificationEmail($personalInfo) {
        // Implementar envío de email si es necesario
        // Usar PHPMailer o mail() función
        
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
}

// Ejecutar API
$api = new CreatorAPI($db);
$api->handleRequest();
?>