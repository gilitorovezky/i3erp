// Bidirectional Schema with Set-based lookups for O(1) performance

class Schema {
    constructor() {
        this.tableToFields = {};
        this.fieldToTables = {};
    }

    // Build schema from table definitions
    buildFromDefinitions(tableDefinitions) {
        for (const [table, fields] of Object.entries(tableDefinitions)) {
            this.tableToFields[table] = new Set(fields);
            
            fields.forEach(field => {
                if (!this.fieldToTables[field]) {
                    this.fieldToTables[field] = new Set();
                }
                this.fieldToTables[field].add(table);
            });
        }
        return this;
    }

    // Get all fields for a table (returns array)
    getFieldsForTable(tableName) {
        return this.tableToFields[tableName] 
            ? Array.from(this.tableToFields[tableName]) 
            : [];
    }

    // Get all tables that contain a field (returns array)
    getTablesForField(fieldName) {
        return this.fieldToTables[fieldName] 
            ? Array.from(this.fieldToTables[fieldName]) 
            : [];
    }

    // Check if table has a specific field - O(1)
    hasField(tableName, fieldName) {
        return this.tableToFields[tableName]?.has(fieldName) || false;
    }

    // Check if table exists
    hasTable(tableName) {
        return tableName in this.tableToFields;
    }

    // Check if field exists anywhere
    fieldExists(fieldName) {
        return fieldName in this.fieldToTables;
    }

    // Add a new table with fields
    addTable(tableName, fields) {
        if (!this.tableToFields[tableName]) {
            this.tableToFields[tableName] = new Set();
        }

        fields.forEach(field => {
            this.tableToFields[tableName].add(field);
            
            if (!this.fieldToTables[field]) {
                this.fieldToTables[field] = new Set();
            }
            this.fieldToTables[field].add(tableName);
        });
    }

    // Add a single field to an existing table
    addFieldToTable(tableName, fieldName) {
        if (!this.tableToFields[tableName]) {
            this.tableToFields[tableName] = new Set();
        }
        
        this.tableToFields[tableName].add(fieldName);
        
        if (!this.fieldToTables[fieldName]) {
            this.fieldToTables[fieldName] = new Set();
        }
        this.fieldToTables[fieldName].add(tableName);
    }

    // Remove a table completely
    removeTable(tableName) {
        const fields = this.tableToFields[tableName];
        
        if (fields) {
            fields.forEach(field => {
                this.fieldToTables[field]?.delete(tableName);
                
                // Clean up empty sets
                if (this.fieldToTables[field]?.size === 0) {
                    delete this.fieldToTables[field];
                }
            });
            
            delete this.tableToFields[tableName];
        }
    }

    // Remove a field from a specific table
    removeFieldFromTable(tableName, fieldName) {
        this.tableToFields[tableName]?.delete(fieldName);
        this.fieldToTables[fieldName]?.delete(tableName);
        
        // Clean up empty sets
        if (this.tableToFields[tableName]?.size === 0) {
            delete this.tableToFields[tableName];
        }
        if (this.fieldToTables[fieldName]?.size === 0) {
            delete this.fieldToTables[fieldName];
        }
    }

    // Get all table names
    getAllTables() {
        return Object.keys(this.tableToFields);
    }

    // Get all field names
    getAllFields() {
        return Object.keys(this.fieldToTables);
    }

    // Get tables that share a specific field
    getTablesWithCommonField(fieldName) {
        return this.getTablesForField(fieldName);
    }

    // Get common fields between two tables
    getCommonFields(table1, table2) {
        const fields1 = this.tableToFields[table1];
        const fields2 = this.tableToFields[table2];
        
        if (!fields1 || !fields2) return [];
        
        return Array.from(fields1).filter(field => fields2.has(field));
    }

    // Print schema for debugging
    printSchema() {
        console.log('=== SCHEMA ===');
        console.log('\nTable -> Fields:');
        for (const [table, fields] of Object.entries(this.tableToFields)) {
            console.log(`  ${table}: [${Array.from(fields).join(', ')}]`);
        }
        
        console.log('\nField -> Tables:');
        for (const [field, tables] of Object.entries(this.fieldToTables)) {
            console.log(`  ${field}: [${Array.from(tables).join(', ')}]`);
        }
    }
}

// ===== USAGE EXAMPLES =====

// Create schema and initialize with data
const schema = new Schema();

const tableDefinitions = {
    'users': ['id', 'name', 'email', 'created_at'],
    'orders': ['id', 'user_id', 'total', 'status', 'created_at'],
    'products': ['id', 'name', 'price', 'stock'],
    'payments': ['id', 'order_id', 'amount', 'status']
};

schema.buildFromDefinitions(tableDefinitions);

// Example queries
console.log('Fields in users:', schema.getFieldsForTable('users'));
// Output: ['id', 'name', 'email', 'created_at']

console.log('Tables with status field:', schema.getTablesForField('status'));
// Output: ['orders', 'payments']

console.log('Does users have email?', schema.hasField('users', 'email'));
// Output: true

console.log('Does products have email?', schema.hasField('products', 'email'));
// Output: false

console.log('Common fields between users and orders:', 
    schema.getCommonFields('users', 'orders'));
// Output: ['id', 'created_at']

// Add new table
schema.addTable('invoices', ['id', 'order_id', 'amount', 'due_date']);
console.log('Tables with order_id:', schema.getTablesForField('order_id'));
// Output: ['orders', 'payments', 'invoices']

// Add field to existing table
schema.addFieldToTable('users', 'phone');
console.log('Updated users fields:', schema.getFieldsForTable('users'));

// Print entire schema
schema.printSchema();