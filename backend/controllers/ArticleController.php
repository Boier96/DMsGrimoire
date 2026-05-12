<?php
class ArticleController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    private function getUserId() {
        return $_SESSION['user_id'] ?? null;
    }


    public function listForFolder($folderId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $stmt = $this->pdo->prepare("SELECT c.user_id FROM folders f JOIN campaigns c ON f.campaign_id = c.id WHERE f.id = ?");
        $stmt->execute([$folderId]);
        $row = $stmt->fetch();
        if (!$row || $row['user_id'] != $userId) { http_response_code(404); echo json_encode(['message'=>'Folder not found']); return; }

        $stmt = $this->pdo->prepare("SELECT * FROM articles WHERE folder_id = ? ORDER BY order_index, id");
        $stmt->execute([$folderId]);
        $articles = $stmt->fetchAll();
        echo json_encode($articles);
    }

    public function create($folderId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $input = json_decode(file_get_contents('php://input'), true);
        $title = trim($input['title'] ?? '');
        if (!$title) { http_response_code(400); echo json_encode(['message'=>'Title required']); return; }

        $stmt = $this->pdo->prepare("SELECT c.user_id FROM folders f JOIN campaigns c ON f.campaign_id = c.id WHERE f.id = ?");
        $stmt->execute([$folderId]);
        $row = $stmt->fetch();
        if (!$row || $row['user_id'] != $userId) { http_response_code(404); echo json_encode(['message'=>'Folder not found']); return; }

        $stmt = $this->pdo->prepare("INSERT INTO articles (folder_id, title) VALUES (:fid, :title)");
        $stmt->execute(['fid'=>$folderId, 'title'=>$title]);
        $id = $this->pdo->lastInsertId();
        $article = $this->pdo->prepare("SELECT * FROM articles WHERE id = ?");
        $article->execute([$id]);
        echo json_encode($article->fetch());
    }

    public function getArticle($articleId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }

        $stmt = $this->pdo->prepare("SELECT a.*, f.campaign_id FROM articles a
            JOIN folders f ON a.folder_id = f.id
            JOIN campaigns c ON f.campaign_id = c.id
            WHERE a.id = ? AND c.user_id = ?");
        $stmt->execute([$articleId, $userId]);
        $article = $stmt->fetch();
        if (!$article) { http_response_code(404); echo json_encode(['message'=>'Article not found']); return; }

        $secStmt = $this->pdo->prepare("SELECT * FROM article_sections WHERE article_id = ? ORDER BY order_index, id");
        $secStmt->execute([$articleId]);
        $article['sections'] = $secStmt->fetchAll();

        echo json_encode($article);
    }

    public function updateArticle($articleId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $input = json_decode(file_get_contents('php://input'), true);
        $title = $input['title'] ?? null;
        $primary_content = $input['primary_content'] ?? null;

        $stmt = $this->pdo->prepare("SELECT a.id FROM articles a
            JOIN folders f ON a.folder_id = f.id
            JOIN campaigns c ON f.campaign_id = c.id
            WHERE a.id = ? AND c.user_id = ?");
        $stmt->execute([$articleId, $userId]);
        if (!$stmt->fetch()) { http_response_code(404); echo json_encode(['message'=>'Article not found']); return; }

        $fields = [];
        $params = ['id' => $articleId];
        if ($title !== null) { $fields[] = "title = :title"; $params['title'] = $title; }
        if ($primary_content !== null) { $fields[] = "primary_content = :pc"; $params['pc'] = $primary_content; }
        if (!empty($fields)) {
            $sql = "UPDATE articles SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
        }
        $this->getArticle($articleId);
    }

    public function deleteArticle($articleId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $stmt = $this->pdo->prepare("SELECT a.id FROM articles a
            JOIN folders f ON a.folder_id = f.id
            JOIN campaigns c ON f.campaign_id = c.id
            WHERE a.id = ? AND c.user_id = ?");
        $stmt->execute([$articleId, $userId]);
        if (!$stmt->fetch()) { http_response_code(404); echo json_encode(['message'=>'Article not found']); return; }

        $this->pdo->prepare("DELETE FROM articles WHERE id = ?")->execute([$articleId]);
        echo json_encode(['message'=>'Article deleted']);
    }

    public function addSection($articleId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $input = json_decode(file_get_contents('php://input'), true);
        $section_title = trim($input['section_title'] ?? '');
        $section_text = $input['section_text'] ?? '';
        if (!$section_title) { http_response_code(400); echo json_encode(['message'=>'Section title required']); return; }

        $stmt = $this->pdo->prepare("SELECT a.id FROM articles a
            JOIN folders f ON a.folder_id = f.id
            JOIN campaigns c ON f.campaign_id = c.id
            WHERE a.id = ? AND c.user_id = ?");
        $stmt->execute([$articleId, $userId]);
        if (!$stmt->fetch()) { http_response_code(404); echo json_encode(['message'=>'Article not found']); return; }

        $stmt = $this->pdo->prepare("INSERT INTO article_sections (article_id, section_title, section_text) VALUES (:aid, :title, :text)");
        $stmt->execute(['aid'=>$articleId, 'title'=>$section_title, 'text'=>$section_text]);
        $id = $this->pdo->lastInsertId();
        $section = $this->pdo->prepare("SELECT * FROM article_sections WHERE id = ?");
        $section->execute([$id]);
        echo json_encode($section->fetch());
    }

    public function updateSection($sectionId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $input = json_decode(file_get_contents('php://input'), true);
        $section_title = $input['section_title'] ?? null;
        $section_text = $input['section_text'] ?? null;

        $stmt = $this->pdo->prepare("SELECT a.id FROM article_sections s
            JOIN articles a ON s.article_id = a.id
            JOIN folders f ON a.folder_id = f.id
            JOIN campaigns c ON f.campaign_id = c.id
            WHERE s.id = ? AND c.user_id = ?");
        $stmt->execute([$sectionId, $userId]);
        if (!$stmt->fetch()) { http_response_code(404); echo json_encode(['message'=>'Section not found']); return; }

        $fields = [];
        $params = ['id' => $sectionId];
        if ($section_title !== null) { $fields[] = "section_title = :title"; $params['title'] = $section_title; }
        if ($section_text !== null) { $fields[] = "section_text = :text"; $params['text'] = $section_text; }
        if (!empty($fields)) {
            $sql = "UPDATE article_sections SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
        }
        $section = $this->pdo->prepare("SELECT * FROM article_sections WHERE id = ?");
        $section->execute([$sectionId]);
        echo json_encode($section->fetch());
    }

    public function deleteSection($sectionId) {
        $userId = $this->getUserId();
        if (!$userId) { http_response_code(401); echo json_encode(['message'=>'Unauthorized']); return; }
        $stmt = $this->pdo->prepare("SELECT a.id FROM article_sections s
            JOIN articles a ON s.article_id = a.id
            JOIN folders f ON a.folder_id = f.id
            JOIN campaigns c ON f.campaign_id = c.id
            WHERE s.id = ? AND c.user_id = ?");
        $stmt->execute([$sectionId, $userId]);
        if (!$stmt->fetch()) { http_response_code(404); echo json_encode(['message'=>'Section not found']); return; }

        $this->pdo->prepare("DELETE FROM article_sections WHERE id = ?")->execute([$sectionId]);
        echo json_encode(['message'=>'Section deleted']);
    }

    public function getLastArticle() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            return;
        }
        $stmt = $this->pdo->prepare("SELECT last_article_id FROM user_progress WHERE user_id = ?");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        echo json_encode(['last_article_id' => $row ? (int)$row['last_article_id'] : null]);
    }

    public function setLastArticle() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            return;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $articleId = $input['article_id'] ?? null;
        if ($articleId === null) {
            http_response_code(400);
            echo json_encode(['message' => 'article_id required']);
            return;
        }
        $sql = "INSERT INTO user_progress (user_id, last_article_id) VALUES (:uid, :aid)
                ON DUPLICATE KEY UPDATE last_article_id = VALUES(last_article_id)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['uid' => $userId, 'aid' => $articleId]);
        echo json_encode(['message' => 'Last article updated']);
    }
}