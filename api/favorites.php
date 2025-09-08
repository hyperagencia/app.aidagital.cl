<?php
/**
 * API REST para Favoritos de Creators
 * Endpoint: /api/favorites.php
 */

require_once '../config.php';

class FavoritesAPI {
    private $db;
    private $userId = 1; // Por ahora usuario fijo, después puede ser dinámico desde JWT
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        try {
            switch ($method) {
                case 'GET':
                    $this->getFavorites();
                    break;
                case 'POST':
                    $this->toggleFavorite();
                    break;
                case 'DELETE':
                    $this->removeFavorite();
                    break;
                default:
                    jsonResponse(null, 405, 'Método no permitido');
            }
        } catch (Exception $e) {
            logError("Favorites API Exception: " . $e->getMessage());
            jsonResponse(null, 500, 'Error interno del servidor');
        }
    }
    
    /**
     * GET /api/favorites.php
     * Obtiene lista de creators favoritos del usuario
     */
    private function getFavorites() {
        $sql = "SELECT c.*, 
                       (YEAR(CURDATE()) - c.birth_year) as age,
                       GROUP_CONCAT(DISTINCT ci.interest SEPARATOR ',') as interests,
                       cf.created_at as favorited_at
                FROM creators c
                INNER JOIN creator_favorites cf ON c.id = cf.creator_id
                LEFT JOIN creator_interests ci ON c.id = ci.creator_id
                WHERE cf.user_id = ?
                GROUP BY c.id
                ORDER BY cf.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->userId]);
        $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Obtener redes sociales para cada favorito
        foreach ($favorites as &$creator) {
            $socialSql = "SELECT platform, followers_range, profile_link 
                         FROM creator_social_networks 
                         WHERE creator_id = ?";
            $socialStmt = $this->db->prepare($socialSql);
            $socialStmt->execute([$creator['id']]);
            $socialNetworks = $socialStmt->fetchAll(PDO::FETCH_ASSOC);
            
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
                
                if (!$creator['followers_range']) {
                    $creator['followers_range'] = $social['followers_range'];
                }
            }
            
            $creator['interests'] = $creator['interests'] ? explode(',', $creator['interests']) : [];
            $creator['is_favorite'] = true; // Por definición
        }
        
        jsonResponse([
            'favorites' => $favorites,
            'total' => count($favorites)
        ], 200, 'Favoritos obtenidos exitosamente');
    }
    
    /**
     * POST /api/favorites.php
     * Agrega/quita un creator de favoritos (toggle)
     * Body: {"creator_id": 123}
     */
    private function toggleFavorite() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['creator_id'])) {
            jsonResponse(null, 400, 'creator_id requerido');
        }
        
        $creatorId = (int)$input['creator_id'];
        
        // Verificar si el creator existe
        $creatorStmt = $this->db->prepare("SELECT id FROM creators WHERE id = ?");
        $creatorStmt->execute([$creatorId]);
        if (!$creatorStmt->fetchColumn()) {
            jsonResponse(null, 404, 'Creator no encontrado');
        }
        
        // Verificar si ya es favorito
        $checkStmt = $this->db->prepare("SELECT id FROM creator_favorites WHERE creator_id = ? AND user_id = ?");
        $checkStmt->execute([$creatorId, $this->userId]);
        $existingFavorite = $checkStmt->fetchColumn();
        
        if ($existingFavorite) {
            // Quitar de favoritos
            $deleteStmt = $this->db->prepare("DELETE FROM creator_favorites WHERE creator_id = ? AND user_id = ?");
            $deleteStmt->execute([$creatorId, $this->userId]);
            
            jsonResponse([
                'creator_id' => $creatorId,
                'is_favorite' => false,
                'action' => 'removed'
            ], 200, 'Creator removido de favoritos');
            
        } else {
            // Agregar a favoritos
            $insertStmt = $this->db->prepare("INSERT INTO creator_favorites (creator_id, user_id) VALUES (?, ?)");
            $insertStmt->execute([$creatorId, $this->userId]);
            
            jsonResponse([
                'creator_id' => $creatorId,
                'is_favorite' => true,
                'action' => 'added'
            ], 201, 'Creator agregado a favoritos');
        }
    }
    
    /**
     * DELETE /api/favorites.php?creator_id=123
     * Remueve específicamente un creator de favoritos
     */
    private function removeFavorite() {
        $creatorId = (int)($_GET['creator_id'] ?? 0);
        
        if (!$creatorId) {
            jsonResponse(null, 400, 'creator_id requerido en query params');
        }
        
        $deleteStmt = $this->db->prepare("DELETE FROM creator_favorites WHERE creator_id = ? AND user_id = ?");
        $deleteStmt->execute([$creatorId, $this->userId]);
        
        if ($deleteStmt->rowCount() > 0) {
            jsonResponse([
                'creator_id' => $creatorId,
                'is_favorite' => false
            ], 200, 'Creator removido de favoritos');
        } else {
            jsonResponse(null, 404, 'Favorito no encontrado');
        }
    }
}

// Ejecutar API
$api = new FavoritesAPI($db);
$api->handleRequest();
?>