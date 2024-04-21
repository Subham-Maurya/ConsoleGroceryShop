CREATE DATABASE IF NOT EXISTS GROCERY;
USE GROCERY;
-- DROP DATABASE GROCERY;

-- Customer Table
CREATE TABLE IF NOT EXISTS CUSTOMER (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    houseNumber VARCHAR(10),
    street VARCHAR(100),
    city VARCHAR(100),
    pincode VARCHAR(10),
    phoneNumber VARCHAR(10) NOT NULL,
    email_ID VARCHAR(100) NOT NULL,
    password VARCHAR(16) NOT NULL CHECK (LENGTH(password) >= 8)
);

-- Delivery Assistant Table
create table IF NOT EXISTS DELIVERY_ASSISTANT (
	assistant_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    houseNumber VARCHAR(10),
    street VARCHAR(100),
    city VARCHAR(100),
    pincode VARCHAR(10),
    phoneNumber VARCHAR(10) NOT NULL,
    email_ID VARCHAR(100) NOT NULL,
	password VARCHAR(16) NOT NULL CHECK (LENGTH(password) >= 8)
);

-- Store Table
create table IF NOT EXISTS STORE (
	store_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    houseNumber VARCHAR(10),
    street VARCHAR(100),
    city VARCHAR(100),
    pincode VARCHAR(10),
    phoneNumber VARCHAR(10) NOT NULL,
    email_ID VARCHAR(100) NOT NULL,
    password VARCHAR(16) NOT NULL CHECK (LENGTH(password) >= 8)
);

-- Admin Table
create table IF NOT EXISTS ADMIN (
	admin_id INT AUTO_INCREMENT PRIMARY KEY,
	name varchar(100),
    phoneNumber varchar(10) NOT NULL,
    password varchar(16) NOT NULL,
    email_ID varchar(100) NOT NULL
);

-- Product Table
create table IF NOT EXISTS PRODUCT (
	product_id INT AUTO_INCREMENT PRIMARY KEY,
	productName varchar(100) NOT NULL,
    description varchar(200),
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL
);

-- Shopping Cart Table
CREATE TABLE IF NOT EXISTS SHOPPING_CART (
    customer_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY(customer_id, product_id),
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id),
    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id)
);

-- Payment Table
CREATE TABLE IF NOT EXISTS PAYMENT (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    paymentType VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2),
    product_id INT,
    quantity INT,
    customer_id INT,
    date DATE,
    time TIME,

    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id),
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS ORDERS (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_status VARCHAR(100),
    customer_id INT NOT NULL,
    date DATE,
    time TIME,
    delivery_person_id INT,
    store_id INT,

    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id),
    FOREIGN KEY (delivery_person_id) REFERENCES DELIVERY_ASSISTANT(assistant_id),
    FOREIGN KEY (store_id) REFERENCES STORE(store_id)
);

-- Product Feedback Table
CREATE TABLE IF NOT EXISTS PRODUCT_FEEDBACK (
    customer_id INT,
    product_id INT,
    feedback VARCHAR(200),

    PRIMARY KEY(customer_id, product_id),
    FOREIGN KEY (Customer_id) REFERENCES CUSTOMER(customer_id),
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
);

-- Sample data for CUSTOMER table
INSERT INTO CUSTOMER (customer_id, name, houseNumber, street, city, pincode, phoneNumber, email_ID, password) 
VALUES
(1, 'John Doe', '123', 'Main St', 'City1', '12345', '5551234567', 'john.doe@email.com', 'password123'),
(2, 'Jane Smith', '456', 'Broadway', 'City2', '67890', '5559876543', 'jane.smith@email.com', 'securepass'),
(3, 'Bob Johnson', '789', 'Oak St', 'City3', '54321', '5551112233', 'bob.johnson@email.com', 'pass1234'),
(4, 'Alice Williams', '321', 'Maple Ave', 'City4', '98765', '5559998888', 'alice@email.com', 'alicepass'),
(5, 'Charlie Brown', '654', 'Pine St', 'City5', '13579', '5553334444', 'charlie.brown@email.com', 'brown123'),
(6, 'Eva Davis', '987', 'Cedar St', 'City6', '24680', '5557778888', 'eva@email.com', 'evapasss'),
(7, 'Frank Miller', '234', 'Elm St', 'City7', '87654', '5554445555', 'frank.miller@email.com', 'millerpass'),
(8, 'Grace Taylor', '567', 'Cherry Ave', 'City8', '11223', '5556667777', 'grace@email.com', 'gracepass'),
(9, 'David White', '890', 'Holly St', 'City9', '33445', '5552221111', 'david.white@email.com', 'davidpass'),
(10, 'Sarah Brown', '432', 'Birch St', 'City10', '55443', '5558889999', 'sarah.brown@email.com', 'sarahpass');


-- Sample data for PRODUCT table (grocery items)
INSERT INTO PRODUCT (product_id, productName, description, price, quantity)
VALUES
(1, 'Fresh Fruits Basket', 'Assorted fresh fruits', 15.99, 50),
(2, 'Organic Vegetables Bundle', 'Locally sourced organic vegetables', 12.50, 30),
(3, 'Whole Grain Bread', 'Nutritious whole grain bread', 3.99, 100),
(4, 'Dairy Essentials Pack', 'Milk, cheese, and yogurt', 8.75, 40),
(5, 'Pasta & Sauce Combo', 'Assorted pasta and pasta sauce', 5.49, 60),
(6, 'Snack Time Delights', 'Variety pack of healthy snacks', 9.99, 80),
(7, 'Beverages Sampler', 'Selection of refreshing beverages', 6.25, 70),
(8, 'Canned Goods Assortment', 'Assorted canned goods', 4.50, 90),
(9, 'Sweet Treats Collection', 'Variety of desserts and sweets', 7.99, 50),
(10, 'Cooking Essentials Kit', 'Basic cooking ingredients', 11.25, 40);


-- Sample data for SHOPPING_CART table
INSERT INTO SHOPPING_CART (customer_id, product_id, quantity)
VALUES
(1, 1, 2),
(1, 3, 1),
(2, 5, 3),
(3, 8, 2),
(3, 10, 1),
(4, 2, 5),
(4, 4, 4),
(5, 6, 2),
(5, 7, 3),
(5, 9, 1);


-- Sample data for PAYMENT table
INSERT INTO PAYMENT (paymentType, amount, product_id, quantity, customer_id, date, time)
VALUES
('Credit Card',  27.45,  5,  5,  1, '2024-02-12', '15:30:00'),
('PayPal',       79.9,  9,  10,  2, '2024-02-13', '10:45:00'),
('Debit Card',   11.97,  3,  3,  3, '2024-02-14', '14:20:00'),
('Cash',         8.75,   4,  1,  3, '2024-02-15', '18:05:20'),
('Cash',         111.93,  1,  7,  4, '2024-02-15', '18:00:00'),
('Credit Card',  59.94,  6,  6,  5, '2024-02-16', '12:15:00');

-- Sample data for STORE table (grocery shops)
INSERT INTO STORE (store_id, name, houseNumber, street, city, pincode, phoneNumber, email_ID, password)
VALUES
(1, 'Gourmet Groceries', '123', 'Main St', 'City1', '12345', '5551234567', 'groceries@store.com', 'storepass1'),
(2, 'Pet Supplies Hub', '456', 'Pet Lane', 'City2', '67890', '5559876543', 'pets@store.com', 'storepass2'),
(3, 'Beauty Boutique', '789', 'Beauty Square', 'City3', '54321', '5551112233', 'beauty@store.com', 'storepass3'),
(4, 'Fresh Fare Market', '321', 'Farmers Ave', 'City4', '98765', '5559998888', 'freshfare@store.com', 'storepass4'),
(5, 'Organic Oasis', '654', 'Green St', 'City5', '13579', '5553334444', 'organic@store.com', 'storepass5'),
(6, 'Marketplace Delights', '987', 'Market Square', 'City6', '24680', '5557778888', 'marketplace@store.com', 'storepass6'),
(7, 'Natures Basket', '234', 'Nature Trail', 'City7', '87654', '5554445555', 'nature@store.com', 'storepass7'),
(8, 'Superior Superfoods', '567', 'Superfood Blvd', 'City8', '11223', '5556667777', 'superior@store.com', 'storepass8'),
(9, 'Essential Eats', '890', 'Essential St', 'City9', '33445', '5552221111', 'essentialeats@store.com', 'storepass9'),
(10, 'Harvest Haven', '432', 'Harvest Lane', 'City10', '55443', '5558889999', 'harvest@store.com', 'storepass10');


-- Sample data for DELIVERY_ASSISTANT table
INSERT INTO DELIVERY_ASSISTANT (assistant_id, name, houseNumber, street, city, pincode, phoneNumber, email_ID, password)
VALUES
(1, 'Delivery Dave', '123', 'Main St', 'City1', '12345', '5551234567', 'dave@email.com', 'deliverypass1'),
(2, 'Express Ellie', '456', 'Express Lane', 'City2', '67890', '5559876543', 'ellie@email.com', 'deliverypass2'),
(3, 'Speedy Sam', '789', 'Fast Ave', 'City3', '54321', '5551112233', 'sam@email.com', 'deliverypass3'),
(4, 'Swift Sarah', '321', 'Swift Blvd', 'City4', '98765', '5559998888', 'sarah@email.com', 'deliverypass4'),
(5, 'Quick Qasim', '654', 'Quick St', 'City5', '13579', '5553334444', 'qasim@email.com', 'deliverypass5'),
(6, 'Rapid Rachel', '987', 'Rapid Plaza', 'City6', '24680', '5557778888', 'rachel@email.com', 'deliverypass6'),
(7, 'Prompt Peter', '234', 'Prompt Lane', 'City7', '87654', '5554445555', 'peter@email.com', 'deliverypass7'),
(8, 'Timely Tina', '567', 'Timely Trail', 'City8', '11223', '5556667777', 'tina@email.com', 'deliverypass8'),
(9, 'Efficient Eddy', '890', 'Efficient Drive', 'City9', '33445', '5552221111', 'eddy@email.com', 'deliverypass9'),
(10, 'On-time Olivia', '432', 'On-time Square', 'City10', '55443', '5558889999', 'olivia@email.com', 'deliverypass10');


-- Sample data for ADMIN table
INSERT INTO ADMIN (admin_id, name, phoneNumber, password, email_ID)
VALUES
(1, 'Admin1', '5551234567', 'adminpass1', 'admin1@email.com'),
(2, 'Admin2', '5559876543', 'adminpass2', 'admin2@email.com'),
(3, 'Admin3', '5551112233', 'adminpass3', 'admin3@email.com');


-- Sample data for PRODUCT_FEEDBACK table
INSERT INTO PRODUCT_FEEDBACK (customer_id, product_id, feedback)
VALUES
(1, 1, 'Great product! Really satisfied with the quality.'),
(2, 3, 'Excellent service. Fast delivery and good packaging.'),
(3, 5, 'The product didnt meet my expectations. Please improve.'),
(4, 2, 'Love the variety of options available.'),
(5, 7, 'Outstanding quality. Will definitely purchase again.'),
(6, 4, 'The price is a bit high, but the product is worth it.'),
(7, 6, 'Fast response from customer support. Thank you!'),
(8, 8, 'Product arrived damaged. Please issue a replacement.'),
(9, 10, 'Highly recommend this product. Very satisfied.'),
(10, 9, 'The product description was misleading. Not happy with the purchase.');

-- Sample data for ORDERS table
INSERT INTO ORDERS (order_status, customer_id, date, time, delivery_person_id, store_id)
VALUES
('Pending', 1, '2024-02-12', '15:30:00', 1, 1),
('Pending', 2, '2024-02-13', '10:45:00', 2, 2),
('Pending', 3, '2024-02-14', '14:20:00', 3, 3),
('Pending', 3, '2024-02-15', '18:05:20', 4, 4),
('Pending', 4, '2024-02-15', '18:00:00', 5, 5),
('Pending', 5, '2024-02-16', '12:15:00', 6, 6);

SELECT SUM(amount) AS total_earned
FROM PAYMENT p
JOIN ORDERS o ON p.customer_id = o.customer_id
WHERE o.store_id IS NOT NULL;

SELECT o.store_id, SUM(p.amount) AS TOTAL_PROFIT
FROM ORDERS o
JOIN PAYMENT p ON o.customer_id = p.customer_id AND o.date = p.date AND o.time = p.time
GROUP BY o.store_id;

SELECT s.store_id, s.name, SUM(p.amount) AS TOTAL_PROFIT
FROM ORDERS o
JOIN PAYMENT p ON o.customer_id = p.customer_id AND o.date = p.date AND o.time = p.time
JOIN STORE s ON o.store_id = s.store_id
GROUP BY s.store_id;

SELECT p.product_id, p.productName, SUM(pm.quantity) AS Total_Sold_Quantity, SUM(pm.amount) AS Total_Profit
FROM PAYMENT pm
JOIN PRODUCT p ON pm.product_id = p.product_id
GROUP BY p.product_id
ORDER BY Total_Sold_Quantity DESC;

UPDATE product SET quantity = quantity + 1000 WHERE quantity <= 170;




