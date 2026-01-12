-- ===== MySQL TABLE STRUCTURE =====

-- Table to store table definitions
CREATE TABLE schema_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table to store field definitions
CREATE TABLE schema_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(100) DEFAULT NULL,
    is_nullable BOOLEAN DEFAULT TRUE,
    is_primary_key BOOLEAN DEFAULT FALSE,
    field_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_table_field (table_name, field_name),
    FOREIGN KEY (table_name) REFERENCES schema_tables(table_name) ON DELETE CASCADE,
    INDEX idx_field_name (field_name),
    INDEX idx_table_name (table_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== PHP CODE =====

<?php

class SchemaManager {
    private $pdo;
    
    public function __construct($host, $dbname, $username, $password) {
        try {
            $this->pdo = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }
    
    // Save entire schema to database
    public function saveSchema($tableDefinitions) {
        try {
            $this->pdo->beginTransaction();
            
            foreach ($tableDefinitions as $tableName => $fields) {
                $this->addTable($tableName, $fields, false);
            }
            
            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw new Exception("Failed to save schema: " . $e->getMessage());
        }
    }
    
    // Add a table with its fields
    public function addTable($tableName, $fields, $autoCommit = true) {
        try {
            if ($autoCommit) {
                $this->pdo->beginTransaction();
            }
            
            // Insert table
            $stmt = $this->pdo->prepare(
                "INSERT INTO schema_tables (table_name) VALUES (?)
                 ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP"
            );
            $stmt->execute([$tableName]);
            
            // Insert fields
            $fieldOrder = 0;
            foreach ($fields as $field) {
                if (is_array($field)) {
                    // Field with metadata: ['name' => 'id', 'type' => 'int', 'primary' => true]
                    $this->addField(
                        $tableName, 
                        $field['name'], 
                        $field['type'] ?? null,
                        $field['nullable'] ?? true,
                        $field['primary'] ?? false,
                        $fieldOrder++,
                        false
                    );
                } else {
                    // Simple field name
                    $this->addField($tableName, $field, null, true, false, $fieldOrder++, false);
                }
            }
            
            if ($autoCommit) {
                $this->pdo->commit();
            }
            
            return true;
        } catch (Exception $e) {
            if ($autoCommit) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }
    
    // Add a single field to a table
    public function addField($tableName, $fieldName, $fieldType = null, 
                            $isNullable = true, $isPrimaryKey = false, 
                            $fieldOrder = 0, $autoCommit = true) {
        try {
            if ($autoCommit) {
                $this->pdo->beginTransaction();
            }
            
            $stmt = $this->pdo->prepare(
                "INSERT INTO schema_fields 
                 (table_name, field_name, field_type, is_nullable, is_primary_key, field_order)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 field_type = VALUES(field_type),
                 is_nullable = VALUES(is_nullable),
                 is_primary_key = VALUES(is_primary_key),
                 field_order = VALUES(field_order)"
            );
            
            $stmt->execute([
                $tableName, 
                $fieldName, 
                $fieldType, 
                $isNullable ? 1 : 0,
                $isPrimaryKey ? 1 : 0,
                $fieldOrder
            ]);
            
            if ($autoCommit) {
                $this->pdo->commit();
            }
            
            return true;
        } catch (Exception $e) {
            if ($autoCommit) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }
    
    // Get all fields for a table
    public function getFieldsForTable($tableName) {
        $stmt = $this->pdo->prepare(
            "SELECT field_name, field_type, is_nullable, is_primary_key, field_order
             FROM schema_fields
             WHERE table_name = ?
             ORDER BY field_order ASC"
        );
        $stmt->execute([$tableName]);
        return $stmt->fetchAll();
    }
    
    // Get all tables that contain a specific field
    public function getTablesForField($fieldName) {
        $stmt = $this->pdo->prepare(
            "SELECT DISTINCT table_name
             FROM schema_fields
             WHERE field_name = ?
             ORDER BY table_name ASC"
        );
        $stmt->execute([$fieldName]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    // Check if a table has a specific field
    public function hasField($tableName, $fieldName) {
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM schema_fields
             WHERE table_name = ? AND field_name = ?"
        );
        $stmt->execute([$tableName, $fieldName]);
        return $stmt->fetchColumn() > 0;
    }
    
    // Get all tables
    public function getAllTables() {
        $stmt = $this->pdo->query(
            "SELECT table_name FROM schema_tables ORDER BY table_name ASC"
        );
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    // Get all unique field names
    public function getAllFields() {
        $stmt = $this->pdo->query(
            "SELECT DISTINCT field_name FROM schema_fields ORDER BY field_name ASC"
        );
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    // Get complete schema as nested array (for JavaScript conversion)
    public function getCompleteSchema() {
        $schema = [
            'tableToFields' => [],
            'fieldToTables' => []
        ];
        
        // Get all tables and their fields
        $tables = $this->getAllTables();
        foreach ($tables as $table) {
            $fields = $this->getFieldsForTable($table);
            $schema['tableToFields'][$table] = array_column($fields, 'field_name');
        }
        
        // Get all fields and their tables
        $fields = $this->getAllFields();
        foreach ($fields as $field) {
            $schema['fieldToTables'][$field] = $this->getTablesForField($field);
        }
        
        return $schema;
    }
    
    // Get schema as JSON (ready for JavaScript)
    public function getSchemaAsJSON() {
        return json_encode($this->getCompleteSchema(), JSON_PRETTY_PRINT);
    }
    
    // Remove a table and all its fields
    public function removeTable($tableName) {
        $stmt = $this->pdo->prepare("DELETE FROM schema_tables WHERE table_name = ?");
        return $stmt->execute([$tableName]);
    }
    
    // Remove a field from a table
    public function removeField($tableName, $fieldName) {
        $stmt = $this->pdo->prepare(
            "DELETE FROM schema_fields WHERE table_name = ? AND field_name = ?"
        );
        return $stmt->execute([$tableName, $fieldName]);
    }
    
    // Get common fields between two tables
    public function getCommonFields($table1, $table2) {
        $stmt = $this->pdo->prepare(
            "SELECT DISTINCT f1.field_name
             FROM schema_fields f1
             INNER JOIN schema_fields f2 
                ON f1.field_name = f2.field_name
             WHERE f1.table_name = ? AND f2.table_name = ?
             ORDER BY f1.field_name"
        );
        $stmt->execute([$table1, $table2]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}

// ===== USAGE EXAMPLE =====

// Initialize
$schema = new SchemaManager('localhost', 'your_database', 'username', 'password');

// Define and save schema
$tableDefinitions = [
    'users' => ['id', 'name', 'email', 'created_at'],
    'orders' => ['id', 'user_id', 'total', 'status', 'created_at'],
    'products' => ['id', 'name', 'price', 'stock'],
    'payments' => ['id', 'order_id', 'amount', 'status']
];

try {
    // Save schema
    $schema->saveSchema($tableDefinitions);
    echo "Schema saved successfully!\n";
    
    // Query examples
    echo "\nFields in 'users' table:\n";
    print_r($schema->getFieldsForTable('users'));
    
    echo "\nTables with 'status' field:\n";
    print_r($schema->getTablesForField('status'));
    
    echo "\nDoes 'users' have 'email'? ";
    echo $schema->hasField('users', 'email') ? "Yes\n" : "No\n";
    
    echo "\nCommon fields between 'users' and 'orders':\n";
    print_r($schema->getCommonFields('users', 'orders'));
    
    // Get complete schema as JSON for JavaScript
    echo "\nComplete Schema as JSON:\n";
    echo $schema->getSchemaAsJSON();
    
    // Add new table
    $schema->addTable('invoices', ['id', 'order_id', 'amount', 'due_date']);
    echo "\nAdded 'invoices' table\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// ===== CONVERT TO JAVASCRIPT =====
// In your PHP file that outputs to frontend:
?>
<script>
// Load schema from PHP into JavaScript
const schemaData = <?php echo $schema->getSchemaAsJSON(); ?>;

// Convert arrays to Sets for O(1) lookup
const schema = {
    tableToFields: {},
    fieldToTables: {}
};

for (const [table, fields] of Object.entries(schemaData.tableToFields)) {
    schema.tableToFields[table] = new Set(fields);
}

for (const [field, tables] of Object.entries(schemaData.fieldToTables)) {
    schema.fieldToTables[field] = new Set(tables);
}

// Now you can use it in JavaScript
console.log('Does users have email?', schema.tableToFields['users'].has('email'));
console.log('Tables with status:', Array.from(schema.fieldToTables['status']));
</script>
<?php
?>