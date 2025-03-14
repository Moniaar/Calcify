const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchProducts: () => ipcRenderer.invoke('fetch-products'),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  editProduct: (product) => ipcRenderer.invoke('edit-product', product),
  fetchProductById: (id) => ipcRenderer.invoke('fetch-product-by-id', id),
  fetchInvoices: () => ipcRenderer.invoke('fetch-invoices'),
  addInvoice: (invoice) => ipcRenderer.invoke('add-invoice', invoice),
  openAddProductWindow: () => ipcRenderer.send('open-add-product-window'),
  openProductsTableWindow: () => ipcRenderer.send('open-products-table-window'),
  openEditProductWindow: (id) => ipcRenderer.send('open-edit-product-window', id),
  openAddInvoiceWindow: () => ipcRenderer.send('open-add-invoice-window'),
  openInvoicesTableWindow: () => ipcRenderer.send('open-invoices-table-window'),
  onProductAdded: (callback) => ipcRenderer.on('product-added', callback),
  onInvoiceAdded: (callback) => ipcRenderer.on('invoice-added', callback),
});