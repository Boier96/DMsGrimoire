<?php
class StatsController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    private function getUserId() {
        return $_SESSION['user_id'] ?? null;
    }

    public function getStats() {
        $userId = $this->getUserId();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            return;
        }

        $stats = [];

        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM user_page_status 
             WHERE user_id = ? AND item_type = 'chapter' AND completed = 1"
        );
        $stmt->execute([$userId]);
        $stats['chapters_completed'] = (int)$stmt->fetchColumn();

        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM user_page_status 
             WHERE user_id = ? AND item_type = 'part' AND completed = 1"
        );
        $stmt->execute([$userId]);
        $stats['parts_completed'] = (int)$stmt->fetchColumn();

        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM articles a
             JOIN folders f ON a.folder_id = f.id
             JOIN campaigns c ON f.campaign_id = c.id
             WHERE c.user_id = ?"
        );
        $stmt->execute([$userId]);
        $stats['articles_count'] = (int)$stmt->fetchColumn();

        $stmt = $this->pdo->prepare(
            "SELECT a.primary_content, s.section_text 
             FROM articles a
             JOIN folders f ON a.folder_id = f.id
             JOIN campaigns c ON f.campaign_id = c.id
             LEFT JOIN article_sections s ON s.article_id = a.id
             WHERE c.user_id = ?"
        );
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $totalWords = 0;
        foreach ($rows as $row) {
            $content = $row['primary_content'] ?? '';
            $totalWords += str_word_count(strip_tags($content), 0);
            $sectionText = $row['section_text'] ?? '';
            $totalWords += str_word_count(strip_tags($sectionText), 0);
        }
        $stats['total_words'] = $totalWords;

        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM character_sheets WHERE user_id = ?");
        $stmt->execute([$userId]);
        $stats['character_sheets_count'] = (int)$stmt->fetchColumn();

        echo json_encode($stats);
    }
}