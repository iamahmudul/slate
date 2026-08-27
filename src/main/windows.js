const path = require('path');
const { app, BrowserWindow, Tray, Menu } = require('electron');

let tray = null;
let mainWindow = null;
let quickAddWindow = null;

function positionNearTray(win) {
  const trayBounds = tray.getBounds();
  const windowBounds = win.getBounds();
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height);
  win.setPosition(x, y, false);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 480,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Clicking outside the window closes it (FR-003). The window instance is
  // only ever hidden, never destroyed, so data:changed pushes still reach it
  // while hidden (see ipc.js broadcast()).
  mainWindow.on('blur', () => {
    if (!quickAddWindow) {
      mainWindow.hide();
    }
  });
}

function toggleMainWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showMainWindow();
  }
}

function showMainWindow() {
  positionNearTray(mainWindow);
  mainWindow.show();
  mainWindow.focus();
}

function openQuickAdd(target) {
  if (quickAddWindow) {
    quickAddWindow.focus();
    return;
  }
  quickAddWindow = new BrowserWindow({
    width: 320,
    height: 60,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload-quickadd.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  quickAddWindow.loadFile(path.join(__dirname, '..', 'quickadd', 'quickadd.html'), {
    query: { target },
  });
  quickAddWindow.once('ready-to-show', () => {
    positionNearTray(quickAddWindow);
    quickAddWindow.show();
    quickAddWindow.focus();
  });
  quickAddWindow.on('blur', closeQuickAdd);
  quickAddWindow.on('closed', () => {
    quickAddWindow = null;
  });
}

function closeQuickAdd() {
  if (quickAddWindow) {
    quickAddWindow.close();
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-iconTemplate.png');
  tray = new Tray(iconPath);
  tray.setToolTip('Slate');
  tray.on('click', toggleMainWindow);
  tray.on('right-click', () => {
    const menu = Menu.buildFromTemplate([
      { label: 'Quick Add to Today', click: () => openQuickAdd('today') },
      { label: 'Quick Add to Notes', click: () => openQuickAdd('notes') },
      { label: 'Open Slate', click: () => showMainWindow() },
      { label: 'Quit', click: () => app.quit() },
    ]);
    tray.popUpContextMenu(menu);
  });
}

module.exports = {
  createMainWindow,
  createTray,
  showMainWindow,
  closeQuickAdd,
};
