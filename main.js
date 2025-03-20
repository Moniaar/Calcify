const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const createBackend = require('./database/server.js');

const dbPath = path.join(__dirname, 'database', 'setup.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error connecting to database:', err);
  else console.log('Connected to SQLite database');
});

function initializeDatabase() {
  const sqlPath = path.join(__dirname, 'database', 'setup.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  db.exec(sql, (err) => {
    if (err) console.error('Error initializing database:', err);
    else console.log('Database initialized successfully');
  });

  const alterQueries = [
    "ALTER TABLE invoices ADD COLUMN date TEXT",
    "ALTER TABLE invoices ADD COLUMN invoice_number TEXT",
    "ALTER TABLE invoices ADD COLUMN invoice_type TEXT",
    "ALTER TABLE invoices ADD COLUMN payment_method TEXT",
    "ALTER TABLE invoices ADD COLUMN discount REAL DEFAULT 0",
    "ALTER TABLE invoices ADD COLUMN bank_name TEXT",
    "ALTER TABLE invoices ADD COLUMN sales_representative TEXT",
    "ALTER TABLE products ADD COLUMN storage_location TEXT",
    "ALTER TABLE invoices ADD COLUMN paid_amount REAL DEFAULT 0"
  ];

  alterQueries.forEach(query => {
    db.run(query, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error altering table:', err);
      }
    });
  });
}

const backend = createBackend(db);

let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile('public/index.html');
}

let addProductWindow;
function createAddProductWindow() {
  addProductWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  addProductWindow.loadFile('public/add-product.html');
  addProductWindow.on('closed', () => addProductWindow = null);
}

let editProductWindow;
function createEditProductWindow(productId) {
  editProductWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  editProductWindow.loadFile('public/edit-product.html', { query: { id: productId } });
  editProductWindow.on('closed', () => editProductWindow = null);
}

let productsTableWindow;
function createProductsTableWindow() {
  productsTableWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  productsTableWindow.loadFile('public/products-table.html');
  productsTableWindow.on('closed', () => productsTableWindow = null);
}

let addInvoiceWindow;
function createAddInvoiceWindow() {
  addInvoiceWindow = new BrowserWindow({
    width: 600,
    height: 400,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  addInvoiceWindow.loadFile('public/add-invoice.html');
  addInvoiceWindow.on('closed', () => addInvoiceWindow = null);
}

let invoicesTableWindow;
function createInvoicesTableWindow() {
  invoicesTableWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  invoicesTableWindow.loadFile('public/invoices-table.html');
  invoicesTableWindow.on('closed', () => invoicesTableWindow = null);
}

let editInvoiceWindow;
function createEditInvoiceWindow(invoiceId) {
  editInvoiceWindow = new BrowserWindow({
    width: 600,
    height: 400,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  editInvoiceWindow.loadFile('public/edit-invoice.html', { query: { id: invoiceId } });
  editInvoiceWindow.on('closed', () => editInvoiceWindow = null);
}

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
ipcMain.handle('fetch-products', async () => backend.fetchProducts());
ipcMain.handle('add-product', async (event, product) => {
  const result = await backend.addProduct(product);
  if (mainWindow) mainWindow.webContents.send('product-added');
  if (productsTableWindow) productsTableWindow.webContents.send('product-added');
  return result;
});
ipcMain.handle('delete-product', async (event, id) => {
  const result = await backend.deleteProduct(id);
  if (mainWindow) mainWindow.webContents.send('product-deleted');
  if (productsTableWindow) productsTableWindow.webContents.send('product-deleted');
  return result;
});
ipcMain.handle('edit-product', async (event, product) => {
  const result = await backend.editProduct(product);
  if (mainWindow) mainWindow.webContents.send('product-edited');
  if (productsTableWindow) productsTableWindow.webContents.send('product-edited');
  return result;
});
ipcMain.handle('fetch-product-by-id', async (event, id) => backend.fetchProductById(id));
ipcMain.handle('fetch-invoices', async () => backend.fetchInvoices());
ipcMain.handle('add-invoice', async (event, invoice) => {
  const result = await backend.addInvoice(invoice);
  if (mainWindow) mainWindow.webContents.send('invoice-added');
  if (invoicesTableWindow) invoicesTableWindow.webContents.send('invoice-added');
  return result;
});
ipcMain.handle('delete-invoice', async (event, id) => {
  const result = await backend.deleteInvoice(id);
  if (mainWindow) mainWindow.webContents.send('invoice-deleted');
  if (invoicesTableWindow) invoicesTableWindow.webContents.send('invoice-deleted');
  return result;
});
ipcMain.handle('edit-invoice', async (event, invoice) => {
  const result = await backend.editInvoice(invoice);
  if (mainWindow) mainWindow.webContents.send('invoice-edited');
  if (invoicesTableWindow) invoicesTableWindow.webContents.send('invoice-edited');
  return result;
});
ipcMain.handle('fetch-invoice-by-id', async (event, id) => backend.fetchInvoiceById(id));
ipcMain.handle('fetch-sales-total', async () => backend.fetchSalesTotal()); // Removed duplicate
ipcMain.handle('fetch-unique-customer-count', async () => backend.fetchUniqueCustomerCount());
ipcMain.handle('fetch-total-balance', async () => backend.fetchTotalBalance());
ipcMain.handle('fetch-client-balance', async (event, customerName) => backend.fetchClientBalance(customerName));
ipcMain.handle('fetch-weekly-sales-total', async (event, { start, end }) => backend.fetchWeeklySalesTotal(start, end));
ipcMain.handle('fetch-weekly-sales-by-day', async (event, { start, end }) => backend.fetchWeeklySalesByDay(start, end));
ipcMain.handle('fetch-customers', async () => backend.fetchCustomers());

ipcMain.on('open-client-balance-window', (event, customerName) => {
  const balanceWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });
  balanceWindow.loadFile('public/client-balance.html', { query: { customer: customerName } });
});

ipcMain.on('open-add-product-window', () => {
  if (!addProductWindow) createAddProductWindow();
});
ipcMain.on('open-products-table-window', () => {
  if (!productsTableWindow) createProductsTableWindow();
});
ipcMain.on('open-edit-product-window', (event, id) => {
  if (!editProductWindow) createEditProductWindow(id);
});
ipcMain.on('open-add-invoice-window', () => {
  if (!addInvoiceWindow) createAddInvoiceWindow();
});
ipcMain.on('open-invoices-table-window', () => {
  if (!invoicesTableWindow) createInvoicesTableWindow();
});
ipcMain.on('open-edit-invoice-window', (event, id) => {
  if (!editInvoiceWindow) createEditInvoiceWindow(id);
});