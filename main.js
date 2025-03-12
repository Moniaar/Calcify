const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const createBackend = require('./database/server.js');

// Database setup
const dbPath = path.join(__dirname, 'database', 'setup.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

function initializeDatabase() {
  const sqlPath = path.join(__dirname, 'database', 'setup.sql'); // Assuming you have a setup.sql file
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  db.exec(sql, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('Database initialized successfully');
    }
  });
}

// Initialize backend with the db instance
const backend = createBackend(db);

// App setup
app.whenReady().then(() => {
  initializeDatabase();

  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false, // Added for security
    },
  });
  mainWindow.loadFile('public/index.html');
});

app.on('window-all-closed', () => {
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    else console.log('Database closed');
  });
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('fetch-customers', async () => {
  return backend.fetchCustomers();
});

ipcMain.handle('fetch-products', async () => {
  return backend.fetchProducts();
});

ipcMain.handle('fetch-invoices', async () => {
  return backend.fetchInvoices();
});

ipcMain.handle('add-customer', async (event, name) => {
  return backend.addCustomer(name);
});

ipcMain.handle('add-product', async (event, product) => {
  return backend.addProduct(product);
});

ipcMain.handle('generate-invoice', async (event, invoice) => {
  return backend.generateInvoice(invoice);
});