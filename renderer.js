async function loadCustomers() {
    try {
        const customers = await window.api.invoke('fetch-customers');
        const customerList = document.getElementById('customerList');
        if (customerList) {
            customerList.innerHTML = customers.map(c => `<li>${c}: ${c}</li>`).join(''); // Adjusted for customer being a string
        } else {
            console.error('customerList element not found');
        }
    } catch (err) {
        console.error('Error loading customers:', err);
    }
}

async function loadProducts() {
    try {
        const products = await window.api.invoke('fetch-products');
        const productList = document.getElementById('productList');
        if (productList) {
            productList.innerHTML = products.map(p =>
                `<li>${p.id}: ${p.name} - $${p.price} - Stock: ${p.stock}</li>`).join('');
        } else {
            console.error('productList element not found');
        }
    } catch (err) {
        console.error('Error loading products:', err);
    }
}

async function loadInvoices() {
    try {
        const invoices = await window.api.invoke('fetch-invoices');
        const invoiceList = document.getElementById('invoiceList');
        if (invoiceList) {
            invoiceList.innerHTML = invoices.map(i =>
                `<li>${i.id}: Customer: ${i.customer} - Total: $${i.total}</li>`).join('');
        } else {
            console.error('invoiceList element not found');
        }
    } catch (err) {
        console.error('Error loading invoices:', err);
    }
}

function addCustomer() {
    const name = document.getElementById('customerName').value;
    if (name) {
        window.api.invoke('add-customer', name)
            .then(() => loadCustomers())
            .catch(err => console.error('Error adding customer:', err));
    }
}

function addProduct() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('stock').value, 10);
    if (name && !isNaN(price) && !isNaN(stock)) {
        window.api.invoke('add-product', { name, price, stock })
            .then(() => loadProducts())
            .catch(err => console.error('Error adding product:', err));
    }
}

function generateInvoice() {
    const customer = document.getElementById('invoiceCustomer').value;
    const items = JSON.parse(document.getElementById('invoiceItems').value || '[]');
    const total = parseFloat(document.getElementById('invoiceTotal').value);
    if (customer && items.length && !isNaN(total)) {
        window.api.invoke('add-invoice', { customer, items, total, date: new Date().toISOString().split('T')[0], invoice_number: 'INV' + Date.now(), invoice_type: 'Cash', payment_method: 'Cash', sales_representative: 'Admin', paid_amount: 0 })
            .then(() => loadInvoices())
            .catch(err => console.error('Error generating invoice:', err));
    }
}

window.onload = function () {
    loadCustomers();
    loadProducts();
    loadInvoices();
};