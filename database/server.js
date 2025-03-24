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
    addProduct: ({ name, price, cost, stock, storage_location }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO products (name, price, cost, stock, storage_location) VALUES (?, ?, ?, ?, ?)',
          [name, price, cost, stock, storage_location],
          function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
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
    editProduct: ({ id, name, price, cost, stock, storage_location }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE products SET name = ?, price = ?, cost = ?, stock = ?, storage_location = ? WHERE id = ?',
          [name, price, cost, stock, storage_location, id],
          function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
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
    addInvoice: ({ customer, items, total, date, invoice_number, invoice_type, payment_method, discount, bank_name, sales_representative, paid_amount }) => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run(
            'INSERT INTO invoices (customer, items, total, date, invoice_number, invoice_type, payment_method, discount, bank_name, sales_representative, paid_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customer, JSON.stringify(items), total, date, invoice_number, invoice_type, payment_method, discount || 0, bank_name || null, sales_representative, paid_amount || 0],
            function (err) {
              if (err) return reject(err);
              const invoiceId = this.lastID;
              const parsedItems = JSON.parse(JSON.stringify(items));
              parsedItems.forEach(item => {
                db.run('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [item.quantity, item.productId, item.quantity], (err) => {
                  if (err) reject(err);
                });
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
              [customer, JSON.stringify(items), total, date, invoice_number, invoice_type, payment_method, discount || 0, bank_name || null, sales_representative, id],
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
        db.get('SELECT SUM(total) as totalSales FROM invoices', [], (err, row) => {
          if (err) reject(err);
          else resolve(row.totalSales || 0);
        });
      });
    },
    fetchUniqueCustomerCount: () => {
      return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(DISTINCT customer) as count FROM invoices', [], (err, row) => {
          if (err) reject(err);
          else resolve(row.count || 0);
        });
      });
    },
    fetchTotalBalance: () => {
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT SUM(total) as totalRevenue, SUM(paid_amount) as totalPaid FROM invoices',
          [],
          (err, row) => {
            if (err) reject(err);
            else {
              const balance = (row.totalRevenue || 0) - (row.totalPaid || 0);
              resolve(balance);
            }
          }
        );
      });
    },
    fetchClientBalance: (customerName) => {
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT SUM(total) as totalInvoiced, SUM(paid_amount) as totalPaid FROM invoices WHERE customer = ?',
          [customerName],
          (err, row) => {
            if (err) reject(err);
            else {
              const balance = (row.totalInvoiced || 0) - (row.totalPaid || 0);
              resolve(balance);
            }
          }
        );
      });
    },
    fetchWeeklySalesTotal: (start, end) => {
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT SUM(total) as weeklyTotal FROM invoices WHERE date >= ? AND date <= ?',
          [start, end],
          (err, row) => {
            if (err) reject(err);
            else resolve(row.weeklyTotal || 0);
          }
        );
      });
    },
    fetchWeeklySalesByDay: (start, end) => {
      return new Promise((resolve, reject) => {
        db.all(
          'SELECT date, SUM(total) as dailyTotal FROM invoices WHERE date >= ? AND date <= ? GROUP BY date ORDER BY date ASC',
          [start, end],
          (err, rows) => {
            if (err) reject(err);
            else {
              const startDate = new Date(start);
              const salesByDay = Array(7).fill(0);
              rows.forEach(row => {
                const rowDate = new Date(row.date);
                const dayIndex = Math.floor((rowDate - startDate) / (1000 * 60 * 60 * 24));
                if (dayIndex >= 0 && dayIndex < 7) {
                  salesByDay[dayIndex] = row.dailyTotal;
                }
              });
              resolve(salesByDay);
            }
          }
        );
      });
    },
    fetchCustomers: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT DISTINCT customer FROM invoices', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => row.customer));
        });
      });
    },
  };
}

module.exports = createBackend;