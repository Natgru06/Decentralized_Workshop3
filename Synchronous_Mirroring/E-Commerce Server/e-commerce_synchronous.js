// Importing required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ecommerce'
});
(async () => {
    try {
        await pool.getConnection();
        console.log('Connected to MySQL database');
    } catch (err) {
        console.error('Error connecting to MySQL database:', err);
        process.exit(1); // Exit the process if unable to connect to the database
    }
})();
// Creating express app
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.get('/products', async (req, res) => {
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

    try {
        const [rows, fields] = await pool.query(sql, filterValues);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    const sql = 'SELECT * FROM products WHERE id = ?';

    try {
        const [rows, fields] = await pool.query(sql, [productId]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.json(rows[0]);
        }
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/products', async (req, res) => {
    const newProduct = req.body;
    const sql = 'INSERT INTO products SET ?';

    try {
        const [result] = await pool.query(sql, newProduct);
        newProduct.id = result.insertId;
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/* curl command
curl -X POST -H "Content-Type: application/json" -d '{"name": "Tablet","description": "Sleek tablet with high-resolution display","price": 299.99,"category": "Electronics", "inStock": true}' http://localhost:3000/products
check on http://localhost:3000/products/
*/

app.put('/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    const sql = 'UPDATE products SET ? WHERE id = ?';

    try {
        const [result] = await pool.query(sql, [updatedProduct, productId]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.json(updatedProduct);
        }
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/* PUT curl command
curl -X PUT -H "Content-Type: application/json" -d '{"name": "Laptop","description": "High-performance laptop with Intel Core i7 processor","price": 899.99,"category": "Computers", "inStock": false}' http://localhost:3000/products/1
*/

app.delete('/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    const sql = 'DELETE FROM products WHERE id = ?';

    try {
        const [result] = await pool.query(sql, [productId]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.json({ message: 'Product deleted successfully' });
        }
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/*
Curl command for delete
curl -X DELETE http://localhost:3000/products/8
 */
// Orders Routes
app.post('/orders', async (req, res) => {
    const { product_id, user_id, quantity } = req.body;
    const order = {
        product_id,
        user_id,
        quantity
    };
    const sql = 'INSERT INTO orders SET ?';

    try {
        const [result] = await pool.query(sql, order);
        order.order_id = result.insertId;
        res.json(order);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/*
Curl command
curl -X POST -H "Content-Type: application/json" -d '{"product_id": 3, "user_id": 1, "quantity": 2}' http://localhost:3000/orders
*/

app.get('/orders/:userId', async (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT * FROM orders WHERE user_id = ?';

    try {
        const [rows, fields] = await pool.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Cart Routes
app.post('/cart/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;

    const sqlInsert = 'INSERT INTO shopping_carts (user_id, product_id, quantity) VALUES (?, ?, ?)';
    const sqlSelect = 'SELECT * FROM shopping_carts WHERE user_id = ?';

    try {
        // Execute the insert query to add the item to the shopping cart
        await pool.query(sqlInsert, [userId, productId, quantity]);

        // Execute the select query to retrieve the updated contents of the cart
        const [results] = await pool.query(sqlSelect, [userId]);
        res.json(results);
    } catch (err) {
        console.error('Error adding item to shopping cart:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/*
Curl command for the post for cart routes
curl -X POST -H "Content-Type: application/json" -d '{"productId": 1, "quantity": 2}' http://localhost:3000/cart/1
 */
app.get('/cart/:userId', async (req, res) => {
    const userId = req.params.userId;

    const sql = 'SELECT * FROM shopping_carts WHERE user_id = ?';

    try {
        const [rows, fields] = await pool.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error('Error retrieving shopping cart:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/cart/:userId/item/:productId', async (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    const sql = 'DELETE FROM shopping_carts WHERE user_id = ? AND product_id = ?';

    try {
        await pool.query(sql, [userId, productId]);
        res.json({ message: 'Item removed from shopping cart successfully' });
    } catch (err) {
        console.error('Error deleting item from shopping cart:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
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
