<?php
/**
 * Configuración de la API UGC Creators
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'aidakarf_ugc_creators');  // Tu base de datos UGC
define('DB_USER', 'aidakarf_wp717');         // Tu usuario de cPanel
define('DB_PASS', '0@S]O8]1(]a44pJ1');      // Tu password de la base de datos

// Configuración de CORS
define('ALLOWED_ORIGINS', [
    'https://aidadigital.cl',
    'https://app.aidadigital.cl',
    'http://localhost:3000', // Para desarrollo
]);

// Configuración de la API
define('API_VERSION', 'v1');
define('API_BASE_URL', '/api/v1/');

// Configuración de seguridad
define('JWT_SECRET', 'aida_ugc_secret_2024_secure_key'); // Cambiado por una clave específica
define('API_KEY', 'aida_api_key_2024'); // Para autenticación adicional

// Configuración de logs
define('LOG_ERRORS', true);
define('LOG_FILE', __DIR__ . '/logs/api.log');

// Configuración de email (para notificaciones)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_USER', 'tu_email@gmail.com');
define('SMTP_PASS', 'tu_app_password');
define('ADMIN_EMAIL', 'admin@aidadigital.cl');

// Zona horaria
date_default_timezone_set('America/Santiago');

// Headers de respuesta por defecto
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Función para manejar CORS
function handleCORS() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: https://aidadigital.cl");
    }
    
    header('Access-Control-Allow-Credentials: true');
}

// Llamar función CORS
handleCORS();

// Función para logging
function logError($message, $context = []) {
    if (!LOG_ERRORS) return;
    
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message";
    
    if (!empty($context)) {
        $logMessage .= ' | Context: ' . json_encode($context);
    }
    
    $logMessage .= PHP_EOL;
    
    // Crear directorio de logs si no existe
    $logDir = dirname(LOG_FILE);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    file_put_contents(LOG_FILE, $logMessage, FILE_APPEND | LOCK_EX);
}

// Función para respuestas JSON estándar
function jsonResponse($data, $status = 200, $message = '') {
    http_response_code($status);
    
    $response = [
        'success' => $status >= 200 && $status < 300,
        'status' => $status,
        'data' => $data
    ];
    
    if ($message) {
        $response['message'] = $message;
    }
    
    if ($status >= 400) {
        $response['error'] = true;
        logError("API Error: $message", ['status' => $status, 'data' => $data]);
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// Función para validar API Key (opcional)
function validateApiKey() {
    $headers = getallheaders();
    $apiKey = $headers['X-API-Key'] ?? $_GET['api_key'] ?? '';
    
    if (API_KEY && $apiKey !== API_KEY) {
        jsonResponse(null, 401, 'API Key inválida');
    }
}

// Clase para conexión a la base de datos
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            logError("Database connection failed: " . $e->getMessage());
            jsonResponse(null, 500, 'Error de conexión a la base de datos');
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
}

// Inicializar conexión
$db = Database::getInstance()->getConnection();
?>
