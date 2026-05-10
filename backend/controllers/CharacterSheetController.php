<?php

class CharacterSheetController {
    private $pdo;
    private $userModel;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        require_once __DIR__ . '/../models/User.php';
        $this->userModel = new User($pdo);
    }

    private function getUserId() {
        return $_SESSION['user_id'] ?? null;
    }

    public function list() {
        $userId = $this->getUserId();
        $stmt = $this->pdo->prepare("SELECT id, name, updated_at FROM character_sheets WHERE user_id = ? ORDER BY updated_at DESC");
        $stmt->execute([$userId]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function create() {
        $userId = $this->getUserId();
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? 'Untitled Sheet';

        $blankPdfPath = __DIR__ . '/../data/5E_CharacterSheet_Fillable.pdf';
        if (!file_exists($blankPdfPath) || filesize($blankPdfPath) < 100) {
            http_response_code(500);
            echo json_encode(['message'=>'Template PDF not found or empty.']);
            exit;
        }
        $pdfData = file_get_contents($blankPdfPath);


        $stmt = $this->pdo->prepare("INSERT INTO character_sheets (user_id, name, pdf_data) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $name, $pdfData]);
        $id = $this->pdo->lastInsertId();
        http_response_code(201);
        echo json_encode(['id' => $id, 'name' => $name]);
    }

    public function get($id) {
        $userId = $this->getUserId();
        $stmt = $this->pdo->prepare("SELECT id, name, updated_at FROM character_sheets WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
        $sheet = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$sheet) {
            http_response_code(404);
            echo json_encode(['message'=>'Sheet not found']);
            return;
        }
        echo json_encode($sheet);
    }

    public function getPdf($id) {
        $userId = $this->getUserId();
        if (!$userId) {
            http_response_code(401);
            echo 'Unauthorized';
            exit;
        }

        error_reporting(0);
        ini_set('display_errors', 0);

        $stmt = $this->pdo->prepare("SELECT pdf_data FROM character_sheets WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
        $pdf = $stmt->fetchColumn();

        if ($pdf === false || $pdf === null) {
            http_response_code(404);
            echo 'Not found';
            exit;
        }

        if (ob_get_level()) ob_end_clean();

        header('Content-Type: application/pdf');
        header('Content-Length: ' . strlen($pdf));
        header('Cache-Control: no-store, no-cache, must-revalidate');
        header('Pragma: no-cache');
        echo $pdf;
        exit;
    }


    public function updatePdf($id) {
        $userId = $this->getUserId();
        $pdfData = file_get_contents('php://input');
        if (!$pdfData) {
            http_response_code(400);
            echo json_encode(['message'=>'No PDF data received']);
            return;
        }
        $stmt = $this->pdo->prepare("UPDATE character_sheets SET pdf_data = ?, updated_at = NOW() WHERE id = ? AND user_id = ?");
        $stmt->execute([$pdfData, $id, $userId]);
        echo json_encode(['message'=>'Saved']);
    }

    public function delete($id) {
        $userId = $this->getUserId();
        $stmt = $this->pdo->prepare("DELETE FROM character_sheets WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
        echo json_encode(['message'=>'Deleted']);
    }
}