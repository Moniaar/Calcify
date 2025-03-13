function createBackend(db) {
  return {
    fetchProducts: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },
    addProduct: ({ name, price, stock }) => {
      return new Promise((resolve, reject) => {
        db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', [name, price, stock], function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });
    },
    deleteProduct: (id) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        });
      });
    },
    editProduct: ({ id, name, price, stock }) => {
      return new Promise((resolve, reject) => {
        db.run('UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?', [name, price, stock, id], function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        });
      });
    },
    fetchProductById: (id) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    },
    // ... other methods (fetchCustomers, etc.)
  };
}

module.exports = createBackend;