<?php
class FolderController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    private function getUserId() {
        return $_SESSION['user_id'] ?? null;
    }

    public function listForCampaign($campaignId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        // Verify campaign ownership
        $stmt = $this->pdo->prepare("SELECT id FROM campaigns WHERE id = ? AND user_id = ?");
        $stmt->execute([$campaignId, $userId]);
        if (!$stmt->fetch()) { http_response_code(404); echo json_encode(['message'=>'Campaign not found']); return; }

        $stmt = $this->pdo->prepare("SELECT * FROM folders WHERE campaign_id = ? ORDER BY order_index, id");
        $stmt->execute([$campaignId]);
        echo json_encode($stmt->fetchAll());
    }

    public function create($campaignId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');
        if (!$name) { http_response_code(400); echo json_encode(['message'=>'Folder name required']); return; }

        // Check campaign ownership
        $stmt = $this->pdo->prepare("SELECT id FROM campaigns WHERE id = ? AND user_id = ?");
        $stmt->execute([$campaignId, $userId]);
        if (!$stmt->fetch()) { http_response_code(404); echo json_encode(['message'=>'Campaign not found']); return; }

        $stmt = $this->pdo->prepare("INSERT INTO folders (campaign_id, name) VALUES (:cid, :name)");
        $stmt->execute(['cid'=>$campaignId, 'name'=>$name]);
        $id = $this->pdo->lastInsertId();
        $folder = $this->pdo->prepare("SELECT * FROM folders WHERE id = ?");
        $folder->execute([$id]);
        echo json_encode($folder->fetch());
    }

    public function update($folderId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');
        if (!$name) { http_response_code(400); echo json_encode(['message'=>'Folder name required']); return; }

        // Verify ownership via campaign
        $stmt = $this->pdo->prepare("SELECT c.user_id FROM folders f JOIN campaigns c ON f.campaign_id = c.id WHERE f.id = ?");
        $stmt->execute([$folderId]);
        $row = $stmt->fetch();
        if (!$row || $row['user_id'] != $userId) { http_response_code(404); echo json_encode(['message'=>'Folder not found']); return; }

        $stmt = $this->pdo->prepare("UPDATE folders SET name = :name WHERE id = :id");
        $stmt->execute(['name'=>$name, 'id'=>$folderId]);
        $folder = $this->pdo->prepare("SELECT * FROM folders WHERE id = ?");
        $folder->execute([$folderId]);
        echo json_encode($folder->fetch());
    }

    public function delete($folderId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $stmt = $this->pdo->prepare("SELECT c.user_id FROM folders f JOIN campaigns c ON f.campaign_id = c.id WHERE f.id = ?");
        $stmt->execute([$folderId]);
        $row = $stmt->fetch();
        if (!$row || $row['user_id'] != $userId) { http_response_code(404); echo json_encode(['message'=>'Folder not found']); return; }

        $this->pdo->prepare("DELETE FROM folders WHERE id = ?")->execute([$folderId]);
        echo json_encode(['message'=>'Folder deleted']);
    }
}