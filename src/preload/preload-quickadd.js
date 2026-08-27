const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('slate', {
  quickAdd: {
    submit: (target, text) => ipcRenderer.invoke('quickAdd:submit', { target, text }),
  },
});
