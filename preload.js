const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchProducts: () => ipcRenderer.invoke('fetch-products'),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  editProduct: (product) => ipcRenderer.invoke('edit-product', product),
  fetchProductById: (id) => ipcRenderer.invoke('fetch-product-by-id', id),
  openAddProductWindow: () => ipcRenderer.send('open-add-product-window'),
  openProductsTableWindow: () => ipcRenderer.send('open-products-table-window'),
  openEditProductWindow: (id) => ipcRenderer.send('open-edit-product-window', id),
  onProductAdded: (callback) => ipcRenderer.on('product-added', callback),
});