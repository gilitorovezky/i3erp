<?php
// save_data.php - Saves or updates a record
header('Content-Type: application/json');

require_once 'config.php';

$database = new Database();
$db = $database->connect();
$mapper = new FieldMapper($db);
$handler = new DataHandler($db, $mapper);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = $_POST;
    $id = isset($postData['id']) && !empty($postData['id']) ? $postData['id'] : null;
    
    unset($postData['id']);
    
    $result = $handler->saveData($postData, $id);
    echo json_encode($result);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>