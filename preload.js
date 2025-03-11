const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    fetchCustomers: () => ipcRenderer.invoke('fetch-customers'),
    fetchProducts: () => ipcRenderer.invoke('fetch-products'),
    fetchInvoices: () => ipcRenderer.invoke('fetch-invoices'),
    addCustomer: (name) => ipcRenderer.send('add-customer', name),
    addProduct: (product) => ipcRenderer.send('add-product', product),
    generateInvoice: (invoice) => ipcRenderer.send('generate-invoice', invoice)
});