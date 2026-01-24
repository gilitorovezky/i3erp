-- =============================================
-- DATABASE SCHEMA
-- =============================================

-- Table to store field definitions and mappings
CREATE TABLE field_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    field_name VARCHAR(100) NOT NULL UNIQUE,      -- Display name in HTML
    db_column_name VARCHAR(100) NOT NULL,         -- Actual database column name
    field_type VARCHAR(50) DEFAULT 'text',        -- text, number, email, date, select, etc.
    is_required BOOLEAN DEFAULT FALSE,
    validation_rule VARCHAR(255),                 -- regex or validation type
    display_order INT DEFAULT 0,                  -- Order to display in table
    is_active BOOLEAN DEFAULT TRUE,               -- Can disable without deleting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(display_order),
    INDEX(is_active)
);

-- Table to store the actual data
CREATE TABLE user_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial field mappings
INSERT INTO field_mappings (field_name, db_column_name, field_type, is_required, display_order) VALUES
('First Name', 'first_name', 'text', TRUE, 1),
('Last Name', 'last_name', 'text', TRUE, 2),
('Email', 'email', 'email', TRUE, 3),
('Phone', 'phone', 'tel', FALSE, 4),
('Address', 'address', 'text', FALSE, 5),
('City', 'city', 'text', FALSE, 6);

-- =============================================
-- PHP: DATABASE CONNECTION
-- =============================================
<?php
// config.php

class Database {
    private $host = 'localhost';
    private $db_name = 'your_database';
    private $username = 'your_username';
    private $password = 'your_password';
    private $conn;

    public function connect() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            echo "Connection Error: " . $e->getMessage();
        }
        return $this->conn;
    }
}

// =============================================
// PHP: FIELD MAPPING CLASS
-- =============================================

class FieldMapper {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Get all active field mappings
    public function getFieldMappings() {
        $query = "SELECT * FROM field_mappings 
                  WHERE is_active = 1 
                  ORDER BY display_order ASC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get mapping for a specific field name
    public function getFieldMapping($fieldName) {
        $query = "SELECT * FROM field_mappings 
                  WHERE field_name = :field_name AND is_active = 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':field_name', $fieldName);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Add new field mapping (never delete, only add)
    public function addFieldMapping($fieldName, $dbColumnName, $fieldType = 'text', $isRequired = false) {
        // Get max display_order
        $query = "SELECT MAX(display_order) as max_order FROM field_mappings";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $nextOrder = ($result['max_order'] ?? 0) + 1;

        // Insert new field
        $query = "INSERT INTO field_mappings 
                  (field_name, db_column_name, field_type, is_required, display_order) 
                  VALUES (:field_name, :db_column, :field_type, :is_required, :display_order)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':field_name', $fieldName);
        $stmt->bindParam(':db_column', $dbColumnName);
        $stmt->bindParam(':field_type', $fieldType);
        $stmt->bindParam(':is_required', $isRequired, PDO::PARAM_BOOL);
        $stmt->bindParam(':display_order', $nextOrder);
        
        return $stmt->execute();
    }

    // Map HTML field names to DB column names
    public function mapFieldsToDb($postData) {
        $mappedData = [];
        
        foreach ($postData as $fieldName => $value) {
            $mapping = $this->getFieldMapping($fieldName);
            if ($mapping) {
                $mappedData[$mapping['db_column_name']] = $value;
            }
        }
        
        return $mappedData;
    }
}

// =============================================
-- PHP: DATA HANDLER CLASS
-- =============================================

class DataHandler {
    private $db;
    private $mapper;

    public function __construct($db, $mapper) {
        $this->db = $db;
        $this->mapper = $mapper;
    }

    // Save data to database
    public function saveData($postData, $id = null) {
        // Map field names to DB columns
        $mappedData = $this->mapper->mapFieldsToDb($postData);
        
        if (empty($mappedData)) {
            return ['success' => false, 'message' => 'No valid data to save'];
        }

        try {
            if ($id) {
                // UPDATE existing record
                $setClauses = [];
                foreach ($mappedData as $column => $value) {
                    $setClauses[] = "$column = :$column";
                }
                
                $query = "UPDATE user_data SET " . implode(', ', $setClauses) . " WHERE id = :id";
                $stmt = $this->db->prepare($query);
                
                foreach ($mappedData as $column => $value) {
                    $stmt->bindValue(":$column", $value);
                }
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
                
            } else {
                // INSERT new record
                $columns = array_keys($mappedData);
                $placeholders = array_map(function($col) { return ":$col"; }, $columns);
                
                $query = "INSERT INTO user_data (" . implode(', ', $columns) . ") 
                         VALUES (" . implode(', ', $placeholders) . ")";
                $stmt = $this->db->prepare($query);
                
                foreach ($mappedData as $column => $value) {
                    $stmt->bindValue(":$column", $value);
                }
            }
            
            $stmt->execute();
            
            return [
                'success' => true, 
                'message' => $id ? 'Record updated successfully' : 'Record created successfully',
                'id' => $id ?? $this->db->lastInsertId()
            ];
            
        } catch(PDOException $e) {
            return ['success' => false, 'message' => 'Database Error: ' . $e->getMessage()];
        }
    }

    // Get all data
    public function getAllData() {
        $query = "SELECT * FROM user_data ORDER BY id DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get single record
    public function getData($id) {
        $query = "SELECT * FROM user_data WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

// =============================================
-- PHP: API ENDPOINT (save_data.php)
-- =============================================

// save_data.php
header('Content-Type: application/json');

require_once 'config.php';

$database = new Database();
$db = $database->connect();
$mapper = new FieldMapper($db);
$handler = new DataHandler($db, $mapper);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = $_POST;
    $id = isset($postData['id']) && !empty($postData['id']) ? $postData['id'] : null;
    
    // Remove id from postData if present
    unset($postData['id']);
    
    $result = $handler->saveData($postData, $id);
    echo json_encode($result);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

// =============================================
-- PHP: GET FIELD MAPPINGS (get_fields.php)
-- =============================================

// get_fields.php
header('Content-Type: application/json');

require_once 'config.php';

$database = new Database();
$db = $database->connect();
$mapper = new FieldMapper($db);

$fields = $mapper->getFieldMappings();
echo json_encode(['success' => true, 'fields' => $fields]);

// =============================================
-- PHP: GET DATA (get_data.php)
-- =============================================

// get_data.php
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
}

// =============================================
-- PHP: ADD NEW FIELD (admin_add_field.php)
-- =============================================

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
    
    // IMPORTANT: You must also add this column to user_data table via ALTER TABLE
    // This should be done carefully, possibly with migration scripts
    
    $result = $mapper->addFieldMapping($fieldName, $dbColumnName, $fieldType, $isRequired);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Field added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add field']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>