<?php
class User {
    private $db;

    public function __construct($pdo) {
        $this->db = $pdo;
    }

    public function findByUsername($username) {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE username = :username');
        $stmt->execute(['username' => $username]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function create($username, $passwordHash) {
        $stmt = $this->db->prepare('INSERT INTO users (username, password_hash) VALUES (:username, :password_hash)');
        $stmt->execute([
            'username' => $username,
            'password_hash' => $passwordHash
        ]);
        return $this->db->lastInsertId();
    }
}