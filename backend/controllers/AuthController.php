<?php
class AuthController {
    private $userModel;

    public function __construct($userModel) {
        $this->userModel = $userModel;
    }

    public function register() {
        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(['message' => 'Username and password required']);
            return;
        }

        if ($this->userModel->findByUsername($username)) {
            http_response_code(409);
            echo json_encode(['message' => 'Username already taken']);
            return;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        $userId = $this->userModel->create($username, $passwordHash);

        $_SESSION['user_id'] = $userId;

        http_response_code(201);
        echo json_encode(['message' => 'User registered', 'user_id' => $userId]);
    }

    public function login() {
        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(['message' => 'Username and password required']);
            return;
        }

        $user = $this->userModel->findByUsername($username);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid credentials']);
            return;
        }

        $_SESSION['user_id'] = $user['id'];

        echo json_encode([
            'id'    => $user['id'],
            'username' => $user['username']
        ]);
    }

    public function logout() {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        echo json_encode(['message' => 'Logged out']);
    }

    public function getUser() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['message' => 'Not authenticated']);
            return;
        }
        $user = $this->userModel->findById($_SESSION['user_id']);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['message' => 'User not found']);
            return;
        }
        echo json_encode($user);
    }
}