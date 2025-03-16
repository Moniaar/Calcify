const sqlite3 = require('sqlite3').verbose();

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
    addInvoice: ({ customer, items, total, date, invoice_number, invoice_type, payment_method, discount, bank_name, sales_representative }) => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(
            'INSERT INTO invoices (customer, items, total, date, invoice_number, invoice_type, payment_method, discount, bank_name, sales_representative) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customer, JSON.stringify(items), total, date, invoice_number, invoice_type, payment_method, discount, bank_name || null, sales_representative],
            function (err) {
              if (err) return reject(err);
              const invoiceId = this.lastID;

              const parsedItems = JSON.parse(JSON.stringify(items));
              parsedItems.forEach(item => {
                db.run(
                  'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                  [item.quantity, item.productId, item.quantity],
                  (err) => {
                    if (err) reject(err);
                  }
                );
              });
              resolve({ id: invoiceId });
            }
          );
        });
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
    editInvoice: ({ id, customer, items, total, date, invoice_number, invoice_type, payment_method, discount, bank_name, sales_representative }) => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.get('SELECT items FROM invoices WHERE id = ?', [id], (err, row) => {
            if (err) return reject(err);
            const oldItems = JSON.parse(row.items);

            oldItems.forEach(item => {
              db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.productId], (err) => {
                if (err) reject(err);
              });
            });

            db.run(
              'UPDATE invoices SET customer = ?, items = ?, total = ?, date = ?, invoice_number = ?, invoice_type = ?, payment_method = ?, discount = ?, bank_name = ?, sales_representative = ? WHERE id = ?',
              [customer, JSON.stringify(items), total, date, invoice_number, invoice_type, payment_method, discount, bank_name || null, sales_representative, id],
              function (err) {
                if (err) return reject(err);

                const newItems = JSON.parse(JSON.stringify(items));
                newItems.forEach(item => {
                  db.run(
                    'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                    [item.quantity, item.productId, item.quantity],
                    (err) => {
                      if (err) reject(err);
                    }
                  );
                });
                resolve({ changes: this.changes });
              }
            );
          });
        });
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
          else resolve(row.count || 0);
        });
      });
    },
  };
}

module.exports = createBackend;