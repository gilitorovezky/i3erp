<?php
// get_data.php - Returns all data or single record
header('Content-Type: application/json');

require_once 'config.php';

$database = new Database();
$db = $database->connect();
$mapper = new FieldMapper($db);
$handler = new DataHandler($db, $mapper);

if (isset($_GET['id'])) {
    $data = $handler->getData($_GET['id']);
    echo json_encode(['success' => true, 'data' => $data]);
} else {
    $data = $handler->getAllData();
    echo json_encode(['success' => true, 'data' => $data]);
}?>