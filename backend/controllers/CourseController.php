<?php
class CourseController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getCourse() {
        $chapters = $this->pdo->query(
            "SELECT id, title, slug, content, order_index FROM chapters ORDER BY order_index"
        )->fetchAll();

        foreach ($chapters as &$chapter) {
            $stmt = $this->pdo->prepare(
                "SELECT id, title, slug, content, video_url, order_index 
                 FROM parts 
                 WHERE chapter_id = :chapter_id 
                 ORDER BY order_index"
            );
            $stmt->execute(['chapter_id' => $chapter['id']]);
            $chapter['parts'] = $stmt->fetchAll();
        }

        echo json_encode($chapters);
    }

    public function getProgress() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['message' => 'Not authenticated']);
            return;
        }

        $stmt = $this->pdo->prepare(
            "SELECT last_chapter_id, last_part_id FROM user_progress WHERE user_id = :uid"
        );
        $stmt->execute(['uid' => $userId]);
        $progress = $stmt->fetch();

        echo json_encode($progress ?: null);
    }

    public function updateProgress() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['message' => 'Not authenticated']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $chapterId = $input['chapter_id'] ?? null;
        $partId    = $input['part_id'] ?? null;   

        if (!$chapterId) {
            http_response_code(400);
            echo json_encode(['message' => 'chapter_id required']);
            return;
        }

        $sql = "INSERT INTO user_progress (user_id, last_chapter_id, last_part_id)
                VALUES (:uid, :cid, :pid)
                ON DUPLICATE KEY UPDATE
                  last_chapter_id = VALUES(last_chapter_id),
                  last_part_id    = VALUES(last_part_id)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'uid' => $userId,
            'cid' => $chapterId,
            'pid' => $partId
        ]);

        echo json_encode(['message' => 'Progress saved']);
    }

    public function visit() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $input = json_decode(file_get_contents('php://input'), true);
        $itemType = $input['item_type'] ?? null;
        $itemId   = $input['item_id']   ?? null;
        if (!$itemType || !$itemId || !in_array($itemType, ['chapter','part'])) {
            http_response_code(400);
            echo json_encode(['message'=>'item_type and item_id required']);
            return;
        }
        $sql = "INSERT INTO user_page_status (user_id, item_type, item_id, visited_at)
                VALUES (:uid, :type, :id, NOW())
                ON DUPLICATE KEY UPDATE visited_at = NOW()";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['uid'=>$userId, 'type'=>$itemType, 'id'=>$itemId]);
        echo json_encode(['message'=>'Visited']);
    }

    public function toggleComplete() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $input = json_decode(file_get_contents('php://input'), true);
        $itemType = $input['item_type'] ?? null;
        $itemId   = $input['item_id']   ?? null;
        if (!$itemType || !$itemId || !in_array($itemType, ['chapter','part'])) {
            http_response_code(400);
            echo json_encode(['message'=>'item_type and item_id required']);
            return;
        }
        $stmt = $this->pdo->prepare("SELECT completed FROM user_page_status WHERE user_id=? AND item_type=? AND item_id=?");
        $stmt->execute([$userId, $itemType, $itemId]);
        $row = $stmt->fetch();
        $newState = $row ? !$row['completed'] : true;
        
        $newStateInt = $newState ? 1 : 0;

        $sql = "INSERT INTO user_page_status (user_id, item_type, item_id, completed)
                VALUES (:uid, :type, :id, :state)
                ON DUPLICATE KEY UPDATE completed = :state2";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'uid'   => $userId,
            'type'  => $itemType,
            'id'    => $itemId,
            'state' => $newStateInt,
            'state2'=> $newStateInt
        ]);

        echo json_encode(['completed' => $newState]);
    }

    public function getStatuses() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['message'=>'Unauthorized']);
            return;
        }
        $stmt = $this->pdo->prepare(
            "SELECT item_type, item_id, completed,
                    visited_at IS NOT NULL AS visited
            FROM user_page_status
            WHERE user_id = ?"
        );
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        $status = ['chapters' => [], 'parts' => []];
        foreach ($rows as $r) {
            $key = ($r['item_type'] === 'part') ? 'parts' : 'chapters';
            $status[$key][$r['item_id']] = [
                'completed' => (bool)$r['completed'],
                'visited'   => (bool)$r['visited']
            ];
        }
        echo json_encode($status);
        }
    }