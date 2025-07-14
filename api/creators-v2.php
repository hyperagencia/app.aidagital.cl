<?php
/**
 * API REST para UGC Creators - VERSION CON UTF-8 FIJO
 * Endpoint: /api/creators.php
 */

// ✅ AÑADIR AL INICIO: Headers UTF-8
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';

class CreatorAPI {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
        
        // ✅ FORZAR UTF-8 en la conexión MySQL
        $this->db->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
        $this->db->exec("SET CHARACTER SET utf8mb4");
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
                    $this->jsonResponse(null, 405, 'Método no permitido');
            }
        } catch (Exception $e) {
            error_log("API Exception: " . $e->getMessage());
            $this->jsonResponse(null, 500, 'Error interno del servidor');
        }
    }
    
    private function getCreators() {
        // Parámetros de consulta con soporte para "all"
        $page = max(1, (int)($_GET['page'] ?? 1));
        
        // Permitir obtener TODOS los registros
        if (isset($_GET['limit']) && $_GET['limit'] === 'all') {
            $limit = 9999; // Sin límite práctico
            $offset = 0;
            $page = 1;
        } else {
            $limit = min(100, max(10, (int)($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;
        }
        
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
        
        // Consulta principal que incluye redes sociales con URLs
        $sql = "SELECT c.*, 
                       (YEAR(CURDATE()) - c.birth_year) as age,
                       GROUP_CONCAT(DISTINCT ci.interest SEPARATOR ',') as interests
                FROM creators c
                LEFT JOIN creator_interests ci ON c.id = ci.creator_id
                $whereClause
                GROUP BY c.id
                ORDER BY c.created_at DESC";
        
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
            // ✅ ASEGURAR UTF-8 en cada campo
            $creator = array_map(function($value) {
                return is_string($value) ? mb_convert_encoding($value, 'UTF-8', 'auto') : $value;
            }, $creator);
            
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
        }
        
        // Contar total para paginación
        $countSql = "SELECT COUNT(DISTINCT c.id) FROM creators c 
                     LEFT JOIN creator_interests ci ON c.id = ci.creator_id
                     $whereClause";
        
        $countParams = array_slice($params, 0, count($params) - ((!isset($_GET['limit']) || $_GET['limit'] !== 'all') ? 2 : 0));
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($countParams);
        $total = $countStmt->fetchColumn();
        
        // Respuesta mejorada
        $this->jsonResponse([
            'creators' => $creators,
            'pagination' => [
                'page' => $page,
                'limit' => isset($_GET['limit']) && $_GET['limit'] === 'all' ? 'all' : $limit,
                'total' => (int)$total,
                'pages' => isset($_GET['limit']) && $_GET['limit'] === 'all' ? 1 : ceil($total / $limit)
            ]
        ]);
    }
    
    // ✅ Función JSON con UTF-8 forzado
    private function jsonResponse($data, $statusCode = 200, $message = 'Success') {
        http_response_code($statusCode);
        
        $response = [
            'success' => $statusCode < 400,
            'message' => $message,
            'data' => $data
        ];
        
        // ✅ JSON con UTF-8 forzado
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    private function createCreator() {
        // Obtener datos del formulario
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            $this->jsonResponse(null, 400, 'Datos JSON inválidos');
        }
        
        // Validar datos requeridos
        $requiredFields = ['personalInfo', 'socialNetworks', 'interests', 'finalInfo'];
        foreach ($requiredFields as $field) {
            if (!isset($input[$field])) {
                $this->jsonResponse(null, 400, "Campo requerido faltante: $field");
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
                $this->jsonResponse(null, 400, "Campo personal requerido: $field");
            }
        }
        
        // Validar email único
        if ($this->emailExists($personalInfo['email'])) {
            $this->jsonResponse(null, 409, 'Este email ya está registrado');
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
            
            $this->jsonResponse([
                'id' => $creatorId,
                'message' => 'Creator registrado exitosamente'
            ], 201, 'Registro completado');
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error creating creator: " . $e->getMessage());
            $this->jsonResponse(null, 500, 'Error al registrar creator');
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
        $to = ADMIN_EMAIL ?? 'admin@aidadigital.cl';
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