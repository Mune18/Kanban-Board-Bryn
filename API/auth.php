<?php
require __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

date_default_timezone_set("Asia/Manila");
// Allow access from http://localhost:4200 for all requests
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 3600");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

require_once 'database.php';

$connection = (new Connection())->connect();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handlePost($connection);
        break;
    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function handlePost($connection) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['action'])) {
        echo json_encode(['error' => 'No action specified']);
        return;
    }

    switch ($data['action']) {
        case 'register':
            register($connection, $data);
            break;
        case 'login':
            login($connection, $data);
            break;
        default:
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
}

function register($connection, $data) {
    if (!isset($data['fullName'], $data['email'], $data['password'])) {
        echo json_encode(['error' => 'Missing registration details']);
        return;
    }

    $sql = 'INSERT INTO users (full_name, email, password) VALUES (:full_name, :email, :password)';
    $stmt = $connection->prepare($sql);

    try {
        $stmt->execute([
            ':full_name' => $data['fullName'],
            ':email' => $data['email'],
            ':password' => password_hash($data['password'], PASSWORD_DEFAULT)
        ]);
        echo json_encode(['message' => 'User registered successfully']);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function login($connection, $data) {
    if (!isset($data['email'], $data['password'])) {
        echo json_encode(['error' => 'Missing login details']);
        return;
    }

    $sql = 'SELECT * FROM users WHERE email = :email';
    $stmt = $connection->prepare($sql);

    try {
        $stmt->execute([':email' => $data['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        $key = 'your-secret-key';
        $payload = [
            'iss' => 'your-issuer',
            'iat' => time(),
            'exp' => time() + 3600, // 1 hour expiration
            'user_id' => $user['id']
        ];
        $jwt = JWT::encode($payload, $key, 'HS256');

        echo json_encode(['token' => $jwt]);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
