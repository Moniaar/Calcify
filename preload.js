const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchCustomers: () => ipcRenderer.invoke('fetch-customers'),
  fetchProducts: () => ipcRenderer.invoke('fetch-products'),
  fetchInvoices: () => ipcRenderer.invoke('fetch-invoices'),
  addCustomer: (name) => ipcRenderer.invoke('add-customer', name),
  fetchProducts: () => ipcRenderer.invoke('fetch-products'),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  openAddProductWindow: () => ipcRenderer.send('open-add-product-window'),
  onProductAdded: (callback) => ipcRenderer.on('product-added', callback),
  generateInvoice: (invoice) => ipcRenderer.invoke('generate-invoice', invoice),
  fetchProductById: (id) => ipcRenderer.invoke('fetch-product-by-id', id),
  openProductsTableWindow: () => ipcRenderer.send('open-products-table-window'),
});