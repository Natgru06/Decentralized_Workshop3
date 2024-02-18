// Importing required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ecommerce'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Creating express app
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.get('/products', (req, res) => {
    let sql = 'SELECT * FROM products';

    // Apply filters if provided
    const { category, inStock } = req.query;
    const filterConditions = [];
    const filterValues = [];
    if (category) {
        filterConditions.push('category = ?');
        filterValues.push(category);
    }
    if (inStock) {
        filterConditions.push('inStock = ?');
        filterValues.push(inStock === 'true' ? 1 : 0);
    }
    if (filterConditions.length > 0) {
        sql += ' WHERE ' + filterConditions.join(' AND ');
    }

    connection.query(sql, filterValues, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const sql = 'SELECT * FROM products WHERE id = ?';

    connection.query(sql, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(results[0]);
    });
});

app.post('/products', (req, res) => {
    const newProduct = req.body;
    const sql = 'INSERT INTO products SET ?';

    connection.query(sql, newProduct, (err, result) => {
        if (err) {
            console.error('Error creating product:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        newProduct.id = result.insertId;
        res.status(201).json(newProduct);
    });
});
/* curl command
curl -X POST -H "Content-Type: application/json" -d '{"name": "Tablet","description": "Sleek tablet with high-resolution display","price": 299.99,"category": "Electronics", "inStock": true}' http://localhost:3000/products
check on http://localhost:3000/products/
*/

app.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    const sql = 'UPDATE products SET ? WHERE id = ?';

    connection.query(sql, [updatedProduct, productId], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(updatedProduct);
    });
});
/* PUT curl command
curl -X PUT -H "Content-Type: application/json" -d '{"name": "Laptop","description": "High-performance laptop with Intel Core i7 processor","price": 899.99,"category": "Computers", "inStock": false}' http://localhost:3000/products/1
*/

app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const sql = 'DELETE FROM products WHERE id = ?';

    connection.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json({ message: 'Product deleted successfully' });
    });
});
/*
Curl command for delete
curl -X DELETE http://localhost:3000/products/13
 */
// Orders Routes
app.post('/orders', (req, res) => {
    const { product_id, user_id, quantity } = req.body;
    const order = {
        product_id,
        user_id,
        quantity
    };
    const sql = 'INSERT INTO orders SET ?';

    connection.query(sql, order, (err, result) => {
        if (err) {
            console.error('Error creating order:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        order.order_id = result.insertId;
        res.json(order);
    });
});
/*
Curl command
curl -X POST -H "Content-Type: application/json" -d '{"product_id": 3, "user_id": 1, "quantity": 2}' http://localhost:3000/orders
*/

app.get('/orders/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT * FROM orders WHERE user_id = ?';

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving orders:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

//Cart Routes
app.post('/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;

    const sql = 'INSERT INTO shopping_carts (user_id, product_id, quantity) VALUES (?, ?, ?)';
    connection.query(sql, [userId, productId, quantity], (err, result) => {
        if (err) {
            console.error('Error adding item to shopping cart:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        // Respond with the updated contents of the cart
        connection.query('SELECT * FROM shopping_carts WHERE user_id = ?', [userId], (err, results) => {
            if (err) {
                console.error('Error retrieving updated shopping cart:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    });
});
/*
Curl command for the post for cart routes
curl -X POST -H "Content-Type: application/json" -d '{"productId": 1, "quantity": 2}' http://localhost:3000/cart/1
 */
app.get('/cart/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = 'SELECT * FROM shopping_carts WHERE user_id = ?';

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving shopping cart:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

app.delete('/cart/:userId/item/:productId', (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    const sql = 'DELETE FROM shopping_carts WHERE user_id = ? AND product_id = ?';

    connection.query(sql, [userId, productId], (err, result) => {
        if (err) {
            console.error('Error deleting item from shopping cart:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Item removed from shopping cart successfully' });
    });
});
/*
DELETE curl command
 curl -X DELETE http://localhost:3000/cart/1/item/1
 */
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
