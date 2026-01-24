<?php
// get_fields.php - Returns all active field mappings
header('Content-Type: application/json');

require_once 'config.php';

$database = new Database();
$db = $database->connect();
$mapper = new FieldMapper($db);

$fields = $mapper->getFieldMappings();
echo json_encode(['success' => true, 'fields' => $fields]);
?>