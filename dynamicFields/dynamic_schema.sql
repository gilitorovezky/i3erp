           'database.sql': `-- database.sql - Complete database schema

CREATE TABLE field_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    field_name VARCHAR(100) NOT NULL UNIQUE,
    db_column_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) DEFAULT 'text',
    is_required BOOLEAN DEFAULT FALSE,
    validation_rule VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(display_order),
    INDEX(is_active)
);

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

INSERT INTO field_mappings (field_name, db_column_name, field_type, is_required, display_order) VALUES
('First Name', 'first_name', 'text', TRUE, 1),
('Last Name', 'last_name', 'text', TRUE, 2),
('Email', 'email', 'email', TRUE, 3),
('Phone', 'phone', 'tel', FALSE, 4),
('Address', 'address', 'text', FALSE, 5),
('City', 'city', 'text', FALSE, 6);`,