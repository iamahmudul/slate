const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('slate', {
  today: {
    list: () => ipcRenderer.invoke('today:list'),
    add: (text) => ipcRenderer.invoke('today:add', { text }),
    toggle: (id) => ipcRenderer.invoke('today:toggle', { id }),
    remove: (id) => ipcRenderer.invoke('today:remove', { id }),
  },
  topics: {
    list: () => ipcRenderer.invoke('topics:list'),
    addCategory: (name) => ipcRenderer.invoke('topics:addCategory', { name }),
    renameCategory: (id, name) => ipcRenderer.invoke('topics:renameCategory', { id, name }),
    deleteCategory: (id) => ipcRenderer.invoke('topics:deleteCategory', { id }),
    addItem: (categoryId, text) => ipcRenderer.invoke('topics:addItem', { categoryId, text }),
    toggleItem: (categoryId, itemId) =>
      ipcRenderer.invoke('topics:toggleItem', { categoryId, itemId }),
    removeItem: (categoryId, itemId) =>
      ipcRenderer.invoke('topics:removeItem', { categoryId, itemId }),
  },
  tracker: {
    list: () => ipcRenderer.invoke('tracker:list'),
    addRow: () => ipcRenderer.invoke('tracker:addRow'),
    updateRow: (id, field, value) => ipcRenderer.invoke('tracker:updateRow', { id, field, value }),
    removeRow: (id) => ipcRenderer.invoke('tracker:removeRow', { id }),
  },
  notes: {
    list: () => ipcRenderer.invoke('notes:list'),
    add: (text) => ipcRenderer.invoke('notes:add', { text }),
    update: (id, text) => ipcRenderer.invoke('notes:update', { id, text }),
    remove: (id) => ipcRenderer.invoke('notes:remove', { id }),
  },
  onDataChanged: (callback) => {
    ipcRenderer.on('data:changed', (_event, payload) => callback(payload));
  },
});
