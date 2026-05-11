<?php

class AdminController {
	private $pdo;

	public function __construct($pdo) {
		$this->pdo = $pdo;
	}

	private function requireAdmin() {
		$userId = $_SESSION['user_id'] ?? null;
		if (!$userId) {
			http_response_code(401);
			echo json_encode(['message' => 'Unauthorized']);
			exit;
		}
		$stmt = $this->pdo->prepare("SELECT role FROM users WHERE id = ?");
		$stmt->execute([$userId]);
		$role = $stmt->fetchColumn();
		if ($role !== 'admin') {
			http_response_code(403);
			echo json_encode(['message' => 'Forbidden']);
			exit;
		}
		return $userId;
	}

	public function listUsers() {
		$this->requireAdmin();

		$users = $this->pdo->query(
			"SELECT id, username, password_hash, role, created_at FROM users"
		)->fetchAll(PDO::FETCH_ASSOC);

		foreach ($users as &$user) {
			$uid = $user['id'];

			$stmt = $this->pdo->prepare("SELECT * FROM campaigns WHERE user_id = ?");
			$stmt->execute([$uid]);
			$user['campaigns'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

			$foldersStmt = $this->pdo->prepare(
				"SELECT f.*, c.name AS campaign_name FROM folders f
				 JOIN campaigns c ON f.campaign_id = c.id
				 WHERE c.user_id = ?"
			);
			$foldersStmt->execute([$uid]);
			$folders = $foldersStmt->fetchAll(PDO::FETCH_ASSOC);

			foreach ($folders as &$folder) {
				$articlesStmt = $this->pdo->prepare(
					"SELECT * FROM articles WHERE folder_id = ?"
				);
				$articlesStmt->execute([$folder['id']]);
				$folder['articles'] = $articlesStmt->fetchAll(PDO::FETCH_ASSOC);
			}
			$user['folders'] = $folders;

			$progressStmt = $this->pdo->prepare(
				"SELECT * FROM user_progress WHERE user_id = ?"
			);
			$progressStmt->execute([$uid]);
			$user['progress'] = $progressStmt->fetch(PDO::FETCH_ASSOC) ?: null;

			$statusesStmt = $this->pdo->prepare(
				"SELECT * FROM user_page_status WHERE user_id = ?"
			);
			$statusesStmt->execute([$uid]);
			$user['statuses'] = $statusesStmt->fetchAll(PDO::FETCH_ASSOC);

			$sheetsStmt = $this->pdo->prepare(
				"SELECT id, name, updated_at FROM character_sheets WHERE user_id = ?"
			);
			$sheetsStmt->execute([$uid]);
			$user['character_sheets'] = $sheetsStmt->fetchAll(PDO::FETCH_ASSOC);
		}

		echo json_encode($users);
	}

	public function deleteUser($userId) {
        $this->requireAdmin();

        $this->pdo->prepare("DELETE FROM character_sheets WHERE user_id = ?")->execute([$userId]);

        $this->pdo->prepare("DELETE FROM user_page_status WHERE user_id = ?")->execute([$userId]);
        $this->pdo->prepare("DELETE FROM user_progress WHERE user_id = ?")->execute([$userId]);

        $stmt = $this->pdo->prepare("SELECT id FROM campaigns WHERE user_id = ?");
        $stmt->execute([$userId]);
        $campaignIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($campaignIds as $cid) {
            $fstmt = $this->pdo->prepare("SELECT id FROM folders WHERE campaign_id = ?");
            $fstmt->execute([$cid]);
            $folderIds = $fstmt->fetchAll(PDO::FETCH_COLUMN);

            foreach ($folderIds as $fid) {
                $this->pdo->prepare(
                    "DELETE FROM article_sections WHERE article_id IN (SELECT id FROM articles WHERE folder_id = ?)"
                )->execute([$fid]);

                $this->pdo->prepare("DELETE FROM articles WHERE folder_id = ?")->execute([$fid]);
            }

            $this->pdo->prepare("DELETE FROM folders WHERE campaign_id = ?")->execute([$cid]);
        }

        $this->pdo->prepare("DELETE FROM campaigns WHERE user_id = ?")->execute([$userId]);

        $this->pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);

        echo json_encode(['message' => 'User and all data deleted']);
    }

	public function createCampaign() {
		$this->requireAdmin();
		$input = json_decode(file_get_contents('php://input'), true);
		$userId = $input['user_id'] ?? null;
		$name = trim($input['name'] ?? '');
		if (!$userId || !$name) {
			http_response_code(400);
			echo json_encode(['message' => 'user_id and name required']);
			return;
		}
		$stmt = $this->pdo->prepare("INSERT INTO campaigns (user_id, name) VALUES (?, ?)");
		$stmt->execute([$userId, $name]);
		$id = $this->pdo->lastInsertId();
		echo json_encode(['id' => $id, 'name' => $name]);
	}

	public function deleteCampaign($campaignId) {
		$this->requireAdmin();
		$this->pdo->prepare("DELETE FROM campaigns WHERE id = ?")->execute([$campaignId]);
		echo json_encode(['message' => 'Campaign deleted']);
	}

	public function createFolder() {
		$this->requireAdmin();
		$input = json_decode(file_get_contents('php://input'), true);
		$campaignId = $input['campaign_id'] ?? null;
		$name = trim($input['name'] ?? '');
		if (!$campaignId || !$name) {
			http_response_code(400);
			echo json_encode(['message' => 'campaign_id and name required']);
			return;
		}
		$stmt = $this->pdo->prepare("INSERT INTO folders (campaign_id, name) VALUES (?, ?)");
		$stmt->execute([$campaignId, $name]);
		$id = $this->pdo->lastInsertId();
		echo json_encode(['id' => $id, 'name' => $name]);
	}

	public function deleteFolder($folderId) {
		$this->requireAdmin();
		$this->pdo->prepare("DELETE FROM folders WHERE id = ?")->execute([$folderId]);
		echo json_encode(['message' => 'Folder deleted']);
	}

	public function createArticle() {
		$this->requireAdmin();
		$input = json_decode(file_get_contents('php://input'), true);
		$folderId = $input['folder_id'] ?? null;
		$title = trim($input['title'] ?? '');
		if (!$folderId || !$title) {
			http_response_code(400);
			echo json_encode(['message' => 'folder_id and title required']);
			return;
		}
		$stmt = $this->pdo->prepare("INSERT INTO articles (folder_id, title) VALUES (?, ?)");
		$stmt->execute([$folderId, $title]);
		$id = $this->pdo->lastInsertId();
		echo json_encode(['id' => $id, 'title' => $title]);
	}

	public function deleteArticle($articleId) {
		$this->requireAdmin();
		$this->pdo->prepare("DELETE FROM articles WHERE id = ?")->execute([$articleId]);
		echo json_encode(['message' => 'Article deleted']);
	}

	public function addSection() {
		$this->requireAdmin();
		$input = json_decode(file_get_contents('php://input'), true);
		$articleId = $input['article_id'] ?? null;
		$section_title = trim($input['section_title'] ?? '');
		$section_text = $input['section_text'] ?? '';
		if (!$articleId || !$section_title) {
			http_response_code(400);
			echo json_encode(['message' => 'article_id and section_title required']);
			return;
		}
		$stmt = $this->pdo->prepare("INSERT INTO article_sections (article_id, section_title, section_text) VALUES (?, ?, ?)");
		$stmt->execute([$articleId, $section_title, $section_text]);
		$id = $this->pdo->lastInsertId();
		echo json_encode(['id' => $id]);
	}

	public function deleteSection($sectionId) {
		$this->requireAdmin();
		$this->pdo->prepare("DELETE FROM article_sections WHERE id = ?")->execute([$sectionId]);
		echo json_encode(['message' => 'Section deleted']);
	}
}