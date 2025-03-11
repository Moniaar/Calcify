const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'setup.db');
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
    const sqlPath = path.join(__dirname, 'database', 'setup.db');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    db.exec(sql, (err) => {
        if (err) {
            console.error("Error initializing database:", err);
        } else {
            console.log("Database initialized successfully.");
        }
    });
}

app.whenReady().then(() => {
    initializeDatabase();

    let mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });
    mainWindow.loadFile('index.html');
});

// IPC Handlers
ipcMain.handle('fetch-customers', async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM customers", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});

ipcMain.handle('fetch-products', async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM products", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});

ipcMain.handle('fetch-invoices', async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM invoices", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});

ipcMain.on('add-customer', (event, name) => {
    db.run("INSERT INTO customers (name) VALUES (?)", [name]);
});

ipcMain.on('add-product', (event, product) => {
    db.run("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", [product.name, product.price, product.stock]);
});

ipcMain.on('generate-invoice', (event, invoice) => {
    db.run("INSERT INTO invoices (customer, items, total) VALUES (?, ?, ?)", [invoice.customer, JSON.stringify(invoice.items), invoice.total]);
});