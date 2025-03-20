// Purpose: This file is the main renderer process for the Electron app. It handles the UI and user interactions.
const productList = document.getElementById('productList');
if (!productList) console.log('productList element not found');
else productList.innerHTML = '...';

// Line 38-ish
const invoiceList = document.getElementById('invoiceList');
if (!invoiceList) console.log('invoiceList element not found');
else invoiceList.innerHTML = '...';

async function loadCustomers() {
    const customers = await window.api.fetchCustomers();
    document.getElementById('customerList').innerHTML = customers.map(c => `<li>${c.id}: ${c.name}</li>`).join('');
}

async function loadProducts() {
    const products = await window.api.fetchProducts();
    document.getElementById('productList').innerHTML = products.map(p =>
        `<li>${p.id}: ${p.name} - $${p.price} - Stock: ${p.stock}</li>`).join('');
}

async function loadInvoices() {
    const invoices = await window.api.fetchInvoices();
    document.getElementById('invoiceList').innerHTML = invoices.map(i =>
        `<li>${i.id}: Customer: ${i.customer} - Total: $${i.total}</li>`).join('');
}

function addCustomer() {
    const name = document.getElementById('customerName').value;
    window.api.addCustomer(name);
    loadCustomers();
}

function addProduct() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('stock').value);
    window.api.addProduct({ name, price, stock });
    loadProducts();
}

function generateInvoice() {
    const customer = document.getElementById('invoiceCustomer').value;
    const items = JSON.parse(document.getElementById('invoiceItems').value);
    const total = parseFloat(document.getElementById('invoiceTotal').value);
    window.api.generateInvoice({ customer, items, total });
    loadInvoices();
}

window.onload = function () {
    loadCustomers();
    loadProducts();
    loadInvoices();
};