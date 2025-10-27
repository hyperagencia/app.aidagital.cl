<?php
/**
 * API de Autenticación para Dashboard UGC
 * Endpoint: /api/auth.php
 */

require_once '../config.php';

class AuthAPI {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';
        
        try {
            switch ($method) {
                case 'POST':
                    if ($action === 'login') {
                        $this->login();
                    } elseif ($action === 'logout') {
                        $this->logout();
                    } elseif ($action === 'register') {
                        $this->registerUser();
                    } else {
                        jsonResponse(null, 400, 'Acción no válida');
                    }
                    break;
                case 'GET':
                    if ($action === 'verify') {
                        $this->verifySession();
                    } elseif ($action === 'profile') {
                        $this->getUserProfile();
                    } else {
                        jsonResponse(null, 400, 'Acción no válida');
                    }
                    break;
                default:
                    jsonResponse(null, 405, 'Método no permitido');
            }
        } catch (Exception $e) {
            logError("Auth API Exception: " . $e->getMessage());
            jsonResponse(null, 500, 'Error interno del servidor');
        }
    }
    
    private function login() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['email']) || !isset($input['password'])) {
            jsonResponse(null, 400, 'Email y contraseña requeridos');
        }
        
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        $password = $input['password'];
        
        if (!$email) {
            jsonResponse(null, 400, 'Email inválido');
        }
        
        // Buscar usuario
        $stmt = $this->db->prepare("SELECT id, email, password_hash, name, role, is_active FROM dashboard_users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(null, 401, 'Credenciales inválidas');
        }
        
        if (!$user['is_active']) {
            jsonResponse(null, 403, 'Usuario desactivado');
        }
        
        // Verificar contraseña
        if (!password_verify($password, $user['password_hash'])) {
            jsonResponse(null, 401, 'Credenciales inválidas');
        }
        
        // Crear sesión
        $sessionToken = $this->createSession($user['id']);
        
        // Actualizar último login
        $this->updateLastLogin($user['id']);
        
        jsonResponse([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role']
            ],
            'token' => $sessionToken
        ], 200, 'Login exitoso');
    }
    
    private function logout() {
        $token = $this->getAuthToken();
        
        if ($token) {
            // Eliminar sesión de la base de datos
            $stmt = $this->db->prepare("DELETE FROM user_sessions WHERE session_token = ?");
            $stmt->execute([$token]);
        }
        
        jsonResponse(['message' => 'Logout exitoso'], 200);
    }
    
    private function verifySession() {
        $token = $this->getAuthToken();
        
        if (!$token) {
            jsonResponse(null, 401, 'Token no proporcionado');
        }
        
        $user = $this->getUserByToken($token);
        
        if (!$user) {
            jsonResponse(null, 401, 'Sesión inválida o expirada');
        }
        
        jsonResponse([
            'valid' => true,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role']
            ]
        ]);
    }
    
    private function getUserProfile() {
        $user = $this->requireAuth();
        
        jsonResponse([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role'],
                'last_login' => $user['last_login'],
                'created_at' => $user['created_at']
            ]
        ]);
    }
    
    private function registerUser() {
        // Solo admins pueden crear usuarios
        $currentUser = $this->requireAuth();
        
        if ($currentUser['role'] !== 'admin') {
            jsonResponse(null, 403, 'Sin permisos para crear usuarios');
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['email']) || !isset($input['name']) || !isset($input['password'])) {
            jsonResponse(null, 400, 'Email, nombre y contraseña requeridos');
        }
        
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        $name = trim($input['name']);
        $password = $input['password'];
        $role = $input['role'] ?? 'viewer';
        
        if (!$email) {
            jsonResponse(null, 400, 'Email inválido');
        }
        
        if (strlen($password) < 6) {
            jsonResponse(null, 400, 'La contraseña debe tener al menos 6 caracteres');
        }
        
        // Verificar si el email ya existe
        $stmt = $this->db->prepare("SELECT id FROM dashboard_users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            jsonResponse(null, 409, 'El email ya está registrado');
        }
        
        // Crear usuario
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $this->db->prepare("INSERT INTO dashboard_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$email, $passwordHash, $name, $role]);
        
        $userId = $this->db->lastInsertId();
        
        jsonResponse([
            'id' => $userId,
            'email' => $email,
            'name' => $name,
            'role' => $role
        ], 201, 'Usuario creado exitosamente');
    }
    
    private function createSession($userId) {
        // Generar token único
        $token = bin2hex(random_bytes(32));
        
        // Expiración en 30 días
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
        
        // Obtener info del cliente
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
        
        // Limpiar sesiones expiradas del usuario
        $this->cleanExpiredSessions($userId);
        
        // Crear nueva sesión
        $stmt = $this->db->prepare("INSERT INTO user_sessions (user_id, session_token, expires_at, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $token, $expiresAt, $userAgent, $ipAddress]);
        
        return $token;
    }
    
    private function getUserByToken($token) {
        $stmt = $this->db->prepare("
            SELECT u.*, s.expires_at 
            FROM dashboard_users u 
            JOIN user_sessions s ON u.id = s.user_id 
            WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$token]);
        return $stmt->fetch();
    }
    
    private function getAuthToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        
        return $_GET['token'] ?? '';
    }
    
    private function requireAuth() {
        $token = $this->getAuthToken();
        
        if (!$token) {
            jsonResponse(null, 401, 'Token de autenticación requerido');
        }
        
        $user = $this->getUserByToken($token);
        
        if (!$user) {
            jsonResponse(null, 401, 'Sesión inválida o expirada');
        }
        
        return $user;
    }
    
    private function updateLastLogin($userId) {
        $stmt = $this->db->prepare("UPDATE dashboard_users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$userId]);
    }
    
    private function cleanExpiredSessions($userId = null) {
        if ($userId) {
            $stmt = $this->db->prepare("DELETE FROM user_sessions WHERE user_id = ? AND expires_at <= NOW()");
            $stmt->execute([$userId]);
        } else {
            $stmt = $this->db->prepare("DELETE FROM user_sessions WHERE expires_at <= NOW()");
            $stmt->execute();
        }
    }
}

// Ejecutar API
$api = new AuthAPI($db);
$api->handleRequest();
?>