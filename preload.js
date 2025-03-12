const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchCustomers: () => ipcRenderer.invoke('fetch-customers'),
  fetchProducts: () => ipcRenderer.invoke('fetch-products'),
  fetchInvoices: () => ipcRenderer.invoke('fetch-invoices'),
  addCustomer: (name) => ipcRenderer.invoke('add-customer', name),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  generateInvoice: (invoice) => ipcRenderer.invoke('generate-invoice', invoice),
});