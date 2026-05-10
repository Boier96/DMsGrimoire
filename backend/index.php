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
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

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

    case 'course':
        require_once __DIR__ . '/controllers/CourseController.php';
        $courseCtrl = new CourseController($pdo);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $courseCtrl->getCourse();
        }
        break;

    case 'visit':
    require_once __DIR__.'/controllers/CourseController.php';
    $courseCtrl = new CourseController($pdo);
    if ($_SERVER['REQUEST_METHOD'] === 'POST') $courseCtrl->visit();
    else { http_response_code(405); echo json_encode(['message'=>'Method not allowed']); }
    break;

    case 'toggle-complete':
        require_once __DIR__ . '/controllers/CourseController.php';
        $courseCtrl = new CourseController($pdo);
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $courseCtrl->toggleComplete();
        } else {
            http_response_code(405);
            echo json_encode(['message' => 'Method not allowed']);
        }
        break;

    case 'statuses':
        require_once __DIR__.'/controllers/CourseController.php';
        $courseCtrl = new CourseController($pdo);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $courseCtrl->getStatuses();
        else { http_response_code(405); echo json_encode(['message'=>'Method not allowed']); }
        break;

    case 'progress':
        require_once __DIR__ . '/controllers/CourseController.php';
        $courseCtrl = new CourseController($pdo);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $courseCtrl->getProgress();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $courseCtrl->updateProgress();
        } else {
            http_response_code(405);
            echo json_encode(['message' => 'Method not allowed']);
        }
        break;

    case 'campaigns':
        require_once __DIR__ . '/controllers/CampaignController.php';
        $campaignCtrl = new CampaignController($pdo);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($id === null) {
                $campaignCtrl->list();
            } else {
                $campaignCtrl->list();
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $campaignCtrl->create();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
            if ($id) $campaignCtrl->update($id);
            else { http_response_code(400); echo json_encode(['message'=>'Missing campaign id']); }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            if ($id) $campaignCtrl->delete($id);
            else { http_response_code(400); echo json_encode(['message'=>'Missing campaign id']); }
        } else {
            http_response_code(405);
            echo json_encode(['message'=>'Method not allowed']);
        }
        break;

    case 'folders':
        require_once __DIR__ . '/controllers/FolderController.php';
        $folderCtrl = new FolderController($pdo);

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($id === null && isset($_GET['campaign_id'])) {
                $folderCtrl->listForCampaign($_GET['campaign_id']);
            } elseif ($id) {
                $folderCtrl->listForCampaign(null);
            } else {
                http_response_code(400);
                echo json_encode(['message'=>'Provide campaign_id']);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $campaignId = $_GET['campaign_id'] ?? null;
            if ($campaignId) {
                $folderCtrl->create($campaignId);
            } else {
                http_response_code(400);
                echo json_encode(['message'=>'campaign_id required']);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
            if ($id) $folderCtrl->update($id);
            else { http_response_code(400); echo json_encode(['message'=>'Missing folder id']); }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            if ($id) $folderCtrl->delete($id);
            else { http_response_code(400); echo json_encode(['message'=>'Missing folder id']); }
        } else {
            http_response_code(405);
            echo json_encode(['message'=>'Method not allowed']);
        }
        break;

    case 'articles':
        require_once __DIR__ . '/controllers/ArticleController.php';
        $articleCtrl = new ArticleController($pdo);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset($_GET['folder_id'])) {
                $articleCtrl->listForFolder($_GET['folder_id']);
            } elseif ($id) {
                $articleCtrl->getArticle($id);
            } else {
                http_response_code(400);
                echo json_encode(['message'=>'Provide folder_id or article id']);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset($_GET['folder_id'])) {
                $articleCtrl->create($_GET['folder_id']);
            } else {
                http_response_code(400);
                echo json_encode(['message'=>'folder_id required']);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
            if ($id) $articleCtrl->updateArticle($id);
            else { http_response_code(400); echo json_encode(['message'=>'Missing article id']); }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            if ($id) $articleCtrl->deleteArticle($id);
            else { http_response_code(400); echo json_encode(['message'=>'Missing article id']); }
        } else {
            http_response_code(405);
            echo json_encode(['message'=>'Method not allowed']);
        }
        break;

    case 'sections':
        require_once __DIR__ . '/controllers/ArticleController.php';
        $articleCtrl = new ArticleController($pdo);
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $articleId = $_GET['article_id'] ?? null;
            if ($articleId) {
                $articleCtrl->addSection($articleId);
            } else {
                http_response_code(400);
                echo json_encode(['message'=>'article_id required']);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
            if ($id) $articleCtrl->updateSection($id);
            else { http_response_code(400); echo json_encode(['message'=>'Missing section id']); }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            if ($id) $articleCtrl->deleteSection($id);
            else { http_response_code(400); echo json_encode(['message'=>'Missing section id']); }
        } else {
            http_response_code(405);
            echo json_encode(['message'=>'Method not allowed']);
        }
        break;
    
    case 'last-article':
        require_once __DIR__ . '/controllers/ArticleController.php';
        $articleCtrl = new ArticleController($pdo);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $articleCtrl->getLastArticle();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $articleCtrl->setLastArticle();
        } else {
            http_response_code(405);
            echo json_encode(['message' => 'Method not allowed']);
        }
        break;

    case 'last-campaign':
        require_once __DIR__ . '/controllers/CampaignController.php';
        $campaignCtrl = new CampaignController($pdo);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $campaignCtrl->getLastCampaign();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $campaignCtrl->setLastCampaign();
        } else {
            http_response_code(405);
            echo json_encode(['message' => 'Method not allowed']);
        }
        break;

    case 'character-sheets':
        require_once __DIR__ . '/controllers/CharacterSheetController.php';
        $ctrl = new CharacterSheetController($pdo);
        if ($id === null) {
            if ($_SERVER['REQUEST_METHOD'] === 'GET') $ctrl->list();
            elseif ($_SERVER['REQUEST_METHOD'] === 'POST') $ctrl->create();
            else { http_response_code(405); echo json_encode(['message'=>'Method not allowed']); }
        } else {
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                if (isset($_GET['pdf'])) $ctrl->getPdf($id);
                else $ctrl->get($id);
            }
            elseif ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['pdf'])) {
                $ctrl->updatePdf($id);
            }
            elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                $ctrl->delete($id);
            }
            else { http_response_code(405); echo json_encode(['message'=>'Method not allowed']); }
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['message' => 'Not found']);
}