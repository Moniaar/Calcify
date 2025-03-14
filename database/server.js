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
    fetchInvoices: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM invoices', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },
    addInvoice: ({ customer, items, total, date, invoice_number, invoice_type, payment_method, discount, bank_name }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO invoices (customer, items, total, date, invoice_number, invoice_type, payment_method, discount, bank_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [customer, JSON.stringify(items), total, date, invoice_number, invoice_type, payment_method, discount, bank_name || null],
          function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });
    },
    deleteInvoice: (id) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM invoices WHERE id = ?', [id], function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        });
      });
    },
    editInvoice: ({ id, customer, items, total, date, invoice_number, invoice_type, payment_method, discount, bank_name }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE invoices SET customer = ?, items = ?, total = ?, date = ?, invoice_number = ?, invoice_type = ?, payment_method = ?, discount = ?, bank_name = ? WHERE id = ?',
          [customer, JSON.stringify(items), total, date, invoice_number, invoice_type, payment_method, discount, bank_name || null, id],
          function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });
    },
    fetchInvoiceById: (id) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM invoices WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    },
    fetchSalesTotal: () => {
      return new Promise((resolve, reject) => {
        db.get('SELECT SUM(total) as total FROM invoices', (err, row) => {
          if (err) reject(err);
          else resolve(row.total || 0);
        });
      });
    },
    fetchUniqueCustomerCount: () => {
      return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(DISTINCT customer) as count FROM invoices', (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0); // Return 0 if no customers
        });
      });
    },
  };
}

module.exports = createBackend;