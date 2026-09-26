-- SQLi-Labs schema
-- Synthetic educational data only. Do not reuse these tables/passwords for real systems.

DROP TABLE IF EXISTS admin_secrets;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,   -- stored in plaintext intentionally for the vulnerable-mode teaching scenario
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'student'
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50)
);

-- Target table for the UNION-based challenge: same column count/shape as `products`
-- so students discover it is extractable via UNION SELECT.
CREATE TABLE admin_secrets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    secret_name VARCHAR(100) NOT NULL,
    secret_value VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'confidential'
);
