<?php
class CampaignController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    private function getUserId() {
        return $_SESSION['user_id'] ?? null;
    }

    public function list() {
        $userId = $this->getUserId();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            return;
        }
        $stmt = $this->pdo->prepare("SELECT * FROM campaigns WHERE user_id = :uid ORDER BY updated_at DESC");
        $stmt->execute(['uid' => $userId]);
        $campaigns = $stmt->fetchAll();
        echo json_encode($campaigns);
    }

    public function create() {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');
        if (!$name) {
            http_response_code(400);
            echo json_encode(['message' => 'Campaign name required']);
            return;
        }
        $stmt = $this->pdo->prepare("INSERT INTO campaigns (user_id, name) VALUES (:uid, :name)");
        $stmt->execute(['uid' => $userId, 'name' => $name]);
        $id = $this->pdo->lastInsertId();
        $campaign = $this->pdo->prepare("SELECT * FROM campaigns WHERE id = ?");
        $campaign->execute([$id]);
        echo json_encode($campaign->fetch());
    }

    public function update($id) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');
        if (!$name) {
            http_response_code(400);
            echo json_encode(['message' => 'Campaign name required']);
            return;
        }
        $stmt = $this->pdo->prepare("UPDATE campaigns SET name = :name WHERE id = :id AND user_id = :uid");
        $stmt->execute(['name' => $name, 'id' => $id, 'uid' => $userId]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['message' => 'Campaign not found or not owned']);
            return;
        }
        $campaign = $this->pdo->prepare("SELECT * FROM campaigns WHERE id = ?");
        $campaign->execute([$id]);
        echo json_encode($campaign->fetch());
    }

    public function delete($id) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $stmt = $this->pdo->prepare("DELETE FROM campaigns WHERE id = :id AND user_id = :uid");
        $stmt->execute(['id' => $id, 'uid' => $userId]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['message' => 'Campaign not found or not owned']);
            return;
        }
        echo json_encode(['message' => 'Campaign deleted']);
    }

    public function setLastCampaign() {
    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['message' => 'Unauthorized']);
        return;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    $campaignId = $input['campaign_id'] ?? null;
    if ($campaignId === null) {
        http_response_code(400);
        echo json_encode(['message' => 'campaign_id required']);
        return;
    }
    $sql = "INSERT INTO user_progress (user_id, last_campaign_id)
            VALUES (:uid, :cid)
            ON DUPLICATE KEY UPDATE last_campaign_id = VALUES(last_campaign_id)";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute(['uid' => $userId, 'cid' => $campaignId]);
    echo json_encode(['message' => 'Last campaign updated']);
    }

    public function getLastCampaign() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            return;
        }
        $stmt = $this->pdo->prepare("SELECT last_campaign_id FROM user_progress WHERE user_id = ?");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        echo json_encode(['last_campaign_id' => $row ? (int)$row['last_campaign_id'] : null]);
    }

}