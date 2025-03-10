// main.js (Electron Main Process)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile('index.html');
});

// Initialize SQLite Database
const db = new sqlite3.Database('pharmacy.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database');
        db.run(`
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                expiry_date TEXT,
                stock INTEGER NOT NULL,
                price REAL NOT NULL
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                total_amount REAL NOT NULL,
                date TEXT NOT NULL,
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS stock_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                quantity_change INTEGER,
                date TEXT NOT NULL,
                FOREIGN KEY(product_id) REFERENCES products(id)
            );
        `);
    }
});

// IPC Handlers for CRUD operations
ipcMain.handle('add-customer', async (_, customer) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)`,
            [customer.name, customer.phone, customer.email],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
});