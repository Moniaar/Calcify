// main.js (Electron Backend Logic)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pharmacy.db');
const fs = require('fs');
const { dialog } = require('electron');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800, height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile('index.html');
});

// Database Setup
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL, stock INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY, customer TEXT, items TEXT, total REAL)");
});

// IPC Handlers
ipcMain.on('add-customer', (event, name) => {
    db.run("INSERT INTO customers (name) VALUES (?)", [name]);
});

ipcMain.on('add-product', (event, product) => {
    db.run("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", [product.name, product.price, product.stock]);
});

ipcMain.on('generate-invoice', (event, invoice) => {
    db.run("INSERT INTO invoices (customer, items, total) VALUES (?, ?, ?)", [invoice.customer, JSON.stringify(invoice.items), invoice.total], function(err) {
        if (err) {
            console.error("Error saving invoice:", err);
            return;
        }
        event.reply('invoice-saved', this.lastID);
    });
});

ipcMain.on('print-invoice', (event, invoiceData) => {
    const invoiceHTML = `
        <html>
        <head><title>Invoice</title></head>
        <body>
            <h1>Invoice</h1>
            <p>Customer: ${invoiceData.customer}</p>
            <ul>
                ${invoiceData.items.map(item => `<li>${item.name} - $${item.price} x ${item.quantity}</li>`).join('')}
            </ul>
            <h3>Total: $${invoiceData.total}</h3>
        </body>
        </html>
    `;
    
    const invoiceWin = new BrowserWindow({ width: 400, height: 600, show: false });
    invoiceWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(invoiceHTML)}`);
    invoiceWin.webContents.once('did-finish-load', () => {
        invoiceWin.webContents.print({ silent: false, printBackground: true });
    });
});

// index.html (Frontend UI)
const indexHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Pharmacy POS</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
</head>
<body>
    <h1>Pharmacy POS</h1>
    <div>
        <h2>Add Customer</h2>
        <input id="customerName" placeholder="Customer Name">
        <button onclick="addCustomer()">Add</button>
    </div>
    <div>
        <h2>Add Product</h2>
        <input id="productName" placeholder="Product Name">
        <input id="productPrice" placeholder="Price" type="number">
        <input id="stock" placeholder="Stock" type="number">
        <button onclick="addProduct()">Add</button>
    </div>
    <div>
        <h2>Generate Invoice</h2>
        <input id="invoiceCustomer" placeholder="Customer Name">
        <textarea id="invoiceItems" placeholder='[{"name": "Med A", "price": 10, "quantity": 2}]'></textarea>
        <input id="invoiceTotal" placeholder="Total Amount" type="number">
        <button onclick="generateInvoice()">Save Invoice</button>
        <button onclick="printInvoice()">Print Invoice</button>
    </div>
    <script src="renderer.js"></script>
</body>
</html>
`;

fs.writeFileSync("index.html", indexHTML);

// styles.css (Basic Styling)
const stylesCSS = `
body { font-family: Arial, sans-serif; padding: 20px; }
h1 { color: #333; }
input, textarea { margin: 5px; padding: 5px; width: 100%; }
button { padding: 5px 10px; margin: 5px; }
`;
fs.writeFileSync("styles.css", stylesCSS);

// renderer.js (Frontend Logic)
const { ipcRenderer } = require('electron');
function addCustomer() {
    const name = document.getElementById('customerName').value;
    ipcRenderer.send('add-customer', name);
}
function addProduct() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const stock = document.getElementById('stock').value;
    ipcRenderer.send('add-product', { name, price, stock });
}
function generateInvoice() {
    const customer = document.getElementById('invoiceCustomer').value;
    const items = JSON.parse(document.getElementById('invoiceItems').value);
    const total = document.getElementById('invoiceTotal').value;
    ipcRenderer.send('generate-invoice', { customer, items, total });
}
function printInvoice() {
    const customer = document.getElementById('invoiceCustomer').value;
    const items = JSON.parse(document.getElementById('invoiceItems').value);
    const total = document.getElementById('invoiceTotal').value;
    ipcRenderer.send('print-invoice', { customer, items, total });
}