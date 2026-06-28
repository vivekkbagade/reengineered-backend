const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./cart.db');

db.serialize(() => {
  // Create Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price REAL,
    description TEXT,
    image TEXT
  )`);

  // Create Cart table
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);

  // Seed Products
  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare("INSERT INTO products (id, name, price, description, image) VALUES (?, ?, ?, ?, ?)");
      stmt.run(1, "Premium Yoga Mat", 49.99, "Eco-friendly, non-slip natural rubber yoga mat.", "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500");
      stmt.run(2, "Cork Yoga Block", 14.99, "High-density natural cork block for posture support.", "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=500");
      stmt.run(3, "Organic Cotton Strap", 9.99, "Durable 8ft alignment strap with metal D-ring.", "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500");
      stmt.run(4, "Meditation Cushion", 39.99, "Buckwheat-filled ergonomic cushion for mindfulness.", "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500");
      stmt.finalize();
    }
  });
});

// GET /api/products
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
  const query = `
    SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image
    FROM cart c
    JOIN products p ON c.product_id = p.id
  `;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/cart
app.post('/api/cart', (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: "product_id is required" });

  db.get("SELECT * FROM cart WHERE product_id = ?", [product_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      // Increment quantity
      db.run("UPDATE cart SET quantity = quantity + 1 WHERE id = ?", [row.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, cart_item_id: row.id, quantity: row.quantity + 1 });
      });
    } else {
      // Create new cart item
      db.run("INSERT INTO cart (product_id, quantity) VALUES (?, ?)", [product_id, 1], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, cart_item_id: this.lastID, quantity: 1 });
      });
    }
  });
});

// DELETE /api/cart/:id
app.delete('/api/cart/:id', (req, res) => {
  const cart_id = req.params.id;

  db.get("SELECT * FROM cart WHERE id = ?", [cart_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Cart item not found" });

    if (row.quantity > 1) {
      // Decrement quantity
      db.run("UPDATE cart SET quantity = quantity - 1 WHERE id = ?", [cart_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, removed: false });
      });
    } else {
      // Remove item
      db.run("DELETE FROM cart WHERE id = ?", [cart_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, removed: true });
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
