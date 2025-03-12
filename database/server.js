function createBackend(db) {
    return {
      // Fetch all customers
      fetchCustomers: () => {
        return new Promise((resolve, reject) => {
          db.all('SELECT name, company_name, phone_number, invoice_type, invoice_number FROM customers', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      },
  
      // Fetch all products
      fetchProducts: () => {
        return new Promise((resolve, reject) => {
          db.all('SELECT * FROM products', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      },
  
      // Fetch all invoices
      fetchInvoices: () => {
        return new Promise((resolve, reject) => {
          db.all('SELECT * FROM invoices', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      },
  
      // Add a customer
      addCustomer: (name) => {
        return new Promise((resolve, reject) => {
          db.run('INSERT INTO customers (name) VALUES (?)', [name], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          });
        });
      },
  
      // Add a product
      addProduct: ({ name, price, stock }) => {
        return new Promise((resolve, reject) => {
          db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', [name, price, stock], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          });
        });
      },
  
      // Generate an invoice
      generateInvoice: ({ customer, items, total }) => {
        return new Promise((resolve, reject) => {
          db.run('INSERT INTO invoices (customer, items, total) VALUES (?, ?, ?)', [customer, JSON.stringify(items), total], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          });
        });
      },
    };
  }
  
  module.exports = createBackend;