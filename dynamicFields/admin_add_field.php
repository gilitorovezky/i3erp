<?php
// admin_add_field.php - For adding new fields dynamically
header('Content-Type: application/json');

require_once 'config.php';

$database = new Database();
$db = $database->connect();
$mapper = new FieldMapper($db);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fieldName = $_POST['field_name'] ?? '';
    $dbColumnName = $_POST['db_column_name'] ?? '';
    $fieldType = $_POST['field_type'] ?? 'text';
    $isRequired = isset($_POST['is_required']) ? (bool)$_POST['is_required'] : false;
    
    if (empty($fieldName) || empty($dbColumnName)) {
        echo json_encode(['success' => false, 'message' => 'Field name and DB column are required']);
        exit;
    }
    
    $result = $mapper->addFieldMapping($fieldName, $dbColumnName, $fieldType, $isRequired);
    
    if ($result) {
        echo json_encode([
            'success' => true, 
            'message' => 'Field added successfully. Make sure the column exists in user_data table!'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add field']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>