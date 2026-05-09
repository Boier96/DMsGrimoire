<?php
session_start();

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/controllers/AuthController.php';

$database = new Database();
$pdo = $database->pdo;

$userModel = new User($pdo);
$authController = new AuthController($userModel);

$url = $_GET['url'] ?? '';

if (str_starts_with($url, 'api/')) {
    $url = substr($url, 4);
}

$urlParts = explode('/', trim($url, '/'));
$resource = $urlParts[0] ?? '';

$id = $urlParts[1] ?? null;

header('Content-Type: application/json');

switch ($resource) {
    case 'register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $authController->register();
        } else {
            http_response_code(405);
            echo json_encode(['message' => 'Method not allowed']);
        }
        break;

    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $authController->login();
        } else {
            http_response_code(405);
            echo json_encode(['message' => 'Method not allowed']);
        }
        break;

    case 'logout':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $authController->logout();
        } else {
            http_response_code(405);
            echo json_encode(['message' => 'Method not allowed']);
        }
        break;

    case 'user':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $authController->getUser();
        } else {
            http_response_code(405);
            echo json_encode(['message' => 'Method not allowed']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['message' => 'Not found']);
}