<?php
// config.php - Database connection and main classes

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

class FieldMapper {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getFieldMappings() {
        $query = "SELECT * FROM field_mappings 
                  WHERE is_active = 1 
                  ORDER BY display_order ASC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFieldMapping($fieldName) {
        $query = "SELECT * FROM field_mappings 
                  WHERE field_name = :field_name AND is_active = 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':field_name', $fieldName);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function addFieldMapping($fieldName, $dbColumnName, $fieldType = 'text', $isRequired = false) {
        $query = "SELECT MAX(display_order) as max_order FROM field_mappings";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $nextOrder = ($result['max_order'] ?? 0) + 1;

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

class DataHandler {
    private $db;
    private $mapper;

    public function __construct($db, $mapper) {
        $this->db = $db;
        $this->mapper = $mapper;
    }

    public function saveData($postData, $id = null) {
        $mappedData = $this->mapper->mapFieldsToDb($postData);
        
        if (empty($mappedData)) {
            return ['success' => false, 'message' => 'No valid data to save'];
        }

        try {
            if ($id) {
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

    public function getAllData() {
        $query = "SELECT * FROM user_data ORDER BY id DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getData($id) {
        $query = "SELECT * FROM user_data WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deleteData($id) {
        try {
            $query = "DELETE FROM user_data WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            return ['success' => true, 'message' => 'Record deleted successfully'];
        } catch(PDOException $e) {
            return ['success' => false, 'message' => 'Database Error: ' . $e->getMessage()];
        }
    }
}
?>