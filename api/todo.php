<?php

// ----------------------------------------------------
// Incluimos el archivo de configuración
// ----------------------------------------------------
require_once '../config.php';

class Database {
    private PDO $pdo;

    public function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            die("Error de conexión a la base de datos: " . $e->getMessage());
        }
    }

    public function query(string $sql, array $params = []): array {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function execute(string $sql, array $params = []): int {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    public function lastInsertId(): string {
        return $this->pdo->lastInsertId();
    }
}

// ----------------------------------------------------
// Lógica de la API REST
// ----------------------------------------------------
header('Content-Type: application/json');

$db = new Database();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $todos = $db->query("SELECT * FROM todos ORDER BY id DESC");
        echo json_encode(['success' => true, 'data' => $todos]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['task'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Falta el campo de tarea.']);
            exit;
        }
        $db->execute("INSERT INTO todos (task) VALUES (?)", [$data['task']]);
        $last_id = $db->lastInsertId();
        echo json_encode(['success' => true, 'message' => 'Tarea agregada.', 'id' => $last_id]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Falta el ID.']);
            exit;
        }
        $db->execute("UPDATE todos SET completed = NOT completed WHERE id = ?", [$data['id']]);
        echo json_encode(['success' => true, 'message' => 'Tarea actualizada.']);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Falta el ID.']);
            exit;
        }
        $db->execute("DELETE FROM todos WHERE id = ?", [$data['id']]);
        echo json_encode(['success' => true, 'message' => 'Tarea eliminada.']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
        break;
}