<?php
// delete_data.php - Deletes a record
header('Content-Type: application/json');

require_once 'config.php';

$database = new Database();
$db = $database->connect();
$mapper = new FieldMapper($db);
$handler = new DataHandler($db, $mapper);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($_POST['id']) ? $_POST['id'] : null;
    
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID is required']);
        exit;
    }
    
    $result = $handler->deleteData($id);
    echo json_encode($result);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>