const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const createBackend = require('./database/server.js'); // Adjust path if needed (e.g., './backend/index.js')

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
  const sqlPath = path.join(__dirname, 'database', 'setup.sql');
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

// Main window (declare outside to make it globally accessible)
let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile('public/index.html');
}

// Add product window
let addProductWindow;
function createAddProductWindow() {
  addProductWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: mainWindow, // Links it to the main window
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  addProductWindow.loadFile('public/add-product.html');
  addProductWindow.on('closed', () => {
    addProductWindow = null;
  });
}

// App setup
app.whenReady().then(() => {
  initializeDatabase();
  createMainWindow();
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

ipcMain.handle('add-product', async (event, product) => {
  const result = await backend.addProduct(product);
  if (mainWindow) mainWindow.webContents.send('product-added');
  return result;
});

ipcMain.on('open-add-product-window', () => {
  if (!addProductWindow) createAddProductWindow();
});

ipcMain.handle('generate-invoice', async (event, invoice) => {
  return backend.generateInvoice(invoice);
});

ipcMain.handle('fetch-product-by-id', async (event, id) => {
  return backend.fetchProductById(id);
});