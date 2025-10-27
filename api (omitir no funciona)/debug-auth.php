<?php
/**
 * Debug de Autenticación
 */

require_once '../config.php';

// Test de conexión a BD
try {
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM dashboard_users");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "✅ Conexión a BD exitosa. Usuarios totales: " . $result['total'] . "<br>";
} catch (Exception $e) {
    echo "❌ Error de BD: " . $e->getMessage() . "<br>";
    exit;
}

// Test de usuario específico
try {
    $stmt = $db->prepare("SELECT id, email, password_hash, name, role, is_active FROM dashboard_users WHERE email = ?");
    $stmt->execute(['admin@aidadigital.cl']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "✅ Usuario encontrado:<br>";
        echo "ID: " . $user['id'] . "<br>";
        echo "Email: " . $user['email'] . "<br>";
        echo "Nombre: " . $user['name'] . "<br>";
        echo "Rol: " . $user['role'] . "<br>";
        echo "Activo: " . ($user['is_active'] ? 'Sí' : 'No') . "<br>";
        echo "Hash (primeros 20 chars): " . substr($user['password_hash'], 0, 20) . "...<br>";
        
        // Test de verificación de contraseña
        $testPassword = 'password123';
        $isValid = password_verify($testPassword, $user['password_hash']);
        echo "✅ Test contraseña '$testPassword': " . ($isValid ? 'VÁLIDA' : 'INVÁLIDA') . "<br>";
        
        if (!$isValid) {
            echo "<br>🔧 Generando nuevo hash para 'password123':<br>";
            $newHash = password_hash($testPassword, PASSWORD_DEFAULT);
            echo "Nuevo hash: $newHash<br>";
            echo "<br>📝 Ejecuta este SQL para actualizar:<br>";
            echo "<code>UPDATE dashboard_users SET password_hash = '$newHash' WHERE email = 'admin@aidadigital.cl';</code><br>";
        }
        
    } else {
        echo "❌ Usuario NO encontrado<br>";
        echo "<br>📝 Ejecuta este SQL para crear el usuario:<br>";
        $hash = password_hash('password123', PASSWORD_DEFAULT);
        echo "<code>INSERT INTO dashboard_users (email, password_hash, name, role) VALUES ('admin@aidadigital.cl', '$hash', 'Administrador AIDA', 'admin');</code><br>";
    }
} catch (Exception $e) {
    echo "❌ Error consultando usuario: " . $e->getMessage() . "<br>";
}

// Test de procesamiento de POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<br>🔍 POST recibido:<br>";
    $input = file_get_contents('php://input');
    echo "Raw input: " . htmlspecialchars($input) . "<br>";
    
    $json = json_decode($input, true);
    if ($json) {
        echo "JSON parseado correctamente:<br>";
        echo "Email: " . ($json['email'] ?? 'NO DEFINIDO') . "<br>";
        echo "Password: " . (isset($json['password']) ? 'PRESENTE' : 'NO DEFINIDO') . "<br>";
    } else {
        echo "❌ Error parseando JSON<br>";
    }
}

// Formulario de test
?>
<html>
<head>
    <title>Debug Auth</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .test-form { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px; }
        input { padding: 10px; margin: 5px; width: 200px; }
        button { padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; }
        code { background: #ffffcc; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🐛 Debug Autenticación</h1>
    
    <div class="test-form">
        <h3>Test Login Directo</h3>
        <form method="POST">
            <input type="email" name="email" placeholder="Email" value="admin@aidadigital.cl"><br>
            <input type="password" name="password" placeholder="Password" value="password123"><br>
            <button type="submit">🧪 Test POST</button>
        </form>
    </div>
    
    <div class="test-form">
        <h3>Test AJAX Login</h3>
        <button onclick="testAjaxLogin()">🌐 Test AJAX</button>
        <div id="ajaxResult" style="margin-top: 10px; padding: 10px; background: white; border-radius: 4px;"></div>
    </div>
    
    <script>
        async function testAjaxLogin() {
            try {
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: 'admin@aidadigital.cl',
                        password: 'password123'
                    })
                });
                
                const text = await response.text();
                document.getElementById('ajaxResult').innerHTML = 
                    `Status: ${response.status}<br>Response: <pre>${text}</pre>`;
            } catch (error) {
                document.getElementById('ajaxResult').innerHTML = 
                    `Error: ${error.message}`;
            }
        }
    </script>
</body>
</html>