const { app } = require('electron');
const store = require('./store');
const windows = require('./windows');
const { registerIpcHandlers } = require('./ipc');

// Enforce a single running instance (FR-027): if another instance already
// holds the lock, quit immediately instead of starting a second process.
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    windows.showMainWindow();
  });

  app.whenReady().then(() => {
    if (process.platform === 'darwin') {
      app.dock.hide();
    }
    store.load();
    windows.createMainWindow();
    windows.createTray();
    registerIpcHandlers();
  });
}
