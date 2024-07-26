<?php

require __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Set the default timezone
date_default_timezone_set("Asia/Manila");

// Set the maximum execution time for requests
set_time_limit(1000);

// Set the content type to JSON
header('Content-Type: application/json');

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

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

try {
    $key = 'your-secret-key';
    $decoded = JWT::decode($token, new Key($key, 'HS256'));
    $userId = $decoded->user_id;
} catch (Exception $e) {
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

switch ($method) {
    case 'GET':
        handleGet($connection, $userId);
        break;
    case 'POST':
        handlePost($connection, $userId);
        break;
    case 'PUT':
        handlePut($connection, $userId);
        break;
    case 'DELETE':
        handleDelete($connection, $userId);
        break;
}

function handleGet($connection, $userId) {
    $sql = 'SELECT * FROM tasks WHERE user_id = :user_id';
    $stmt = $connection->prepare($sql);
    $stmt->execute([':user_id' => $userId]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($tasks as &$task) {
        $task['due_date'] = date('c', strtotime($task['due_date']));
    }

    echo json_encode($tasks);
}

function handlePost($connection, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    $dueDate = date('Y-m-d H:i:s', strtotime($data['dueDate']));

    $sql = 'INSERT INTO tasks (title, description, due_date, status, priority, user_id) VALUES (:title, :description, :due_date, :status, :priority, :user_id)';
    $stmt = $connection->prepare($sql);
    $stmt->execute([
        ':title' => $data['title'],
        ':description' => $data['description'],
        ':due_date' => $dueDate,
        ':status' => $data['status'],
        ':priority' => $data['priority'],
        ':user_id' => $userId
    ]);
    echo json_encode(['message' => 'Task added successfully']);
}

function handlePut($connection, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    $dueDate = date('Y-m-d H:i:s', strtotime($data['dueDate']));

    $sql = 'UPDATE tasks SET title = :title, description = :description, due_date = :due_date, status = :status, priority = :priority WHERE id = :id AND user_id = :user_id';
    $stmt = $connection->prepare($sql);
    $stmt->execute([
        ':title' => $data['title'],
        ':description' => $data['description'],
        ':due_date' => $dueDate,
        ':status' => $data['status'],
        ':priority' => $data['priority'],
        ':id' => $data['id'],
        ':user_id' => $userId
    ]);
    echo json_encode(['message' => 'Task updated successfully']);
}

function handleDelete($connection, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);

    $sql = 'DELETE FROM tasks WHERE id = :id AND user_id = :user_id';
    $stmt = $connection->prepare($sql);
    $stmt->execute([
        ':id' => $data['id'],
        ':user_id' => $userId
    ]);
    echo json_encode(['message' => 'Task deleted successfully']);
}
?>
