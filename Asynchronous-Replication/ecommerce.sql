-- Create the database
CREATE DATABASE IF NOT EXISTS ecommerce;

-- Use the database
USE ecommerce;

-- Create the products table
DROP TABLE IF EXISTS shopping_carts;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255),
    inStock BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create the orders table

CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    user_id INT,
    quantity INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);


CREATE TABLE IF NOT EXISTS shopping_carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
-- Insert hardware product data
INSERT INTO products (name, description, price, category, inStock) VALUES
('Laptop', 'High-performance laptop with Intel Core i7 processor', 999.99, 'Computers', true),
('Smartphone', 'Flagship smartphone with OLED display and dual camera', 699.99, 'Phones', true),
('Tablet', '10-inch tablet with long battery life', 299.99, 'Tablets', true),
('Smartwatch', 'Fitness tracker with heart rate monitor and GPS', 199.99, 'Wearables', false),
('Wireless Mouse', 'Ergonomic wireless mouse with adjustable DPI', 29.99, 'Accessories', true),
('External Hard Drive', '1TB external hard drive for backup and storage', 79.99, 'Storage', true);

INSERT INTO users (username, email, password)
VALUES 
    ('john_doe', 'john@example.com', 'password123'),
    ('jane_smith', 'jane@example.com', 'securepassword'),
    ('bob_jackson', 'bob@example.com', 'strongpassword'),
    ('alice_smith', 'alice@example.com', 'password123'),
    ('david_miller', 'david@example.com', 'strongpassword'),
    ('sarah_jones', 'sarah@example.com', 'securepassword'),
    ('michael_brown', 'michael@example.com', 'password123'),
    ('emily_davis', 'emily@example.com', 'strongpassword'),
    ('robert_taylor', 'robert@example.com', 'securepassword'),
    ('olivia_clark', 'olivia@example.com', 'password123');
INSERT INTO orders (product_id, user_id, quantity)
VALUES
    (1, 1, 2),
    (2, 2, 1),
    (3, 3, 3),
    (4, 4, 2),
    (5, 5, 1),
    (6, 6, 3),
    (1, 7, 2),
    (2, 8, 1),
    (3, 9, 3),
    (3, 10, 2),
    (4, 2, 1),
    (5, 3, 2),
    (6, 4, 3),
    (1, 5, 2),
    (5, 6, 1);


INSERT INTO shopping_carts (user_id, product_id, quantity)
VALUES
    (1, 1, 2),
    (1, 2, 1),
    (2, 3, 3),
    (3, 4, 1),
    (3, 5, 2),
    (4, 1, 2),
    (5, 1, 1),
    (6, 2, 3),
    (7, 3, 2),
    (8, 4, 1),
    (9, 5, 2),
    (10, 3, 1);

select * from products;
select * from orders;