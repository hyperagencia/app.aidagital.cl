<?php
/**
 * Configuración local para API UGC Creators
 * Este archivo va en: api/config.php
 */

// Configuración para MAMP local
define('DB_HOST', 'localhost');
define('DB_NAME', 'ugc_creators_dev');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_PORT', '8889'); // Puerto de MAMP

// Configuración de CORS para desarrollo
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
    'http://localhost:8888', // MAMP
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
];

// Manejar CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:3000");
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de desarrollo
define('DEBUG_MODE', true);
define('API_VERSION', 'v1');
define('JWT_SECRET', 'aida_ugc_secret_dev_2024');
define('API_KEY', 'aida_api_key_dev_2024');

// Configuración de logs
define('LOG_ERRORS', true);
define('LOG_FILE', __DIR__ . '/../logs/api_dev.log');

// Email para desarrollo
define('ADMIN_EMAIL', 'admin@aidadigital.cl');

// Zona horaria
date_default_timezone_set('America/Santiago');

// Función para logging
function logError($message, $context = []) {
    if (!LOG_ERRORS) return;
    
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[DEV] [$timestamp] $message";
    
    if (!empty($context)) {
        $logMessage .= ' | Context: ' . json_encode($context, JSON_UNESCAPED_UNICODE);
    }
    
    $logMessage .= PHP_EOL;
    
    $logDir = dirname(LOG_FILE);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    file_put_contents(LOG_FILE, $logMessage, FILE_APPEND | LOCK_EX);
    
    // También mostrar en consola para desarrollo
    if (DEBUG_MODE) {
        error_log($logMessage);
    }
}

// Función para respuestas JSON
function jsonResponse($data, $status = 200, $message = '') {
    http_response_code($status);
    
    $response = [
        'success' => $status >= 200 && $status < 300,
        'status' => $status,
        'data' => $data,
        'environment' => 'development'
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

// Clase Database para MAMP
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
            
            logError("Database connected successfully to " . DB_NAME . " (MAMP)");
        } catch (PDOException $e) {
            logError("Database connection failed: " . $e->getMessage());
            jsonResponse(null, 500, 'Error de conexión a la base de datos local');
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
try {
    $db = Database::getInstance()->getConnection();
    logError("API initialized successfully in development mode");
} catch (Exception $e) {
    logError("Failed to initialize database: " . $e->getMessage());
    jsonResponse(null, 500, 'Error del sistema');
}
?>