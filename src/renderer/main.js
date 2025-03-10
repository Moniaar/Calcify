// main.js (Electron Backend Logic)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pharmacy.db');

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
});

// IPC Handlers
ipcMain.on('add-customer', (event, name) => {
    db.run("INSERT INTO customers (name) VALUES (?)", [name]);
});

ipcMain.on('add-product', (event, product) => {
    db.run("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", [product.name, product.price, product.stock]);
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
    <script src="renderer.js"></script>
</body>
</html>
`;

require('fs').writeFileSync("index.html", indexHTML);

// styles.css (Basic Styling)
const stylesCSS = `
body { font-family: Arial, sans-serif; padding: 20px; }
h1 { color: #333; }
input { margin: 5px; padding: 5px; }
button { padding: 5px 10px; }
`;
require('fs').writeFileSync("styles.css", stylesCSS);

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