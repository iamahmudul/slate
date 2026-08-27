const { ipcMain, app, BrowserWindow } = require('electron');
const store = require('./store');
const windows = require('./windows');

// Pushes the updated section to every open renderer window (main window and,
// if open, the Quick Add prompt) so a change made in one place appears
// immediately everywhere else (FR-024, SC-008).
function broadcast(section) {
  const payload = { section, data: store.getData()[section] };
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('data:changed', payload);
  }
}

function registerIpcHandlers() {
  // ---------- Today ----------
  ipcMain.handle('today:list', () => store.getData().today);

  ipcMain.handle('today:add', (_event, { text }) => {
    if (store.isBlank(text)) throw new Error('text is required');
    const item = {
      id: store.newId(),
      text: text.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    store.getData().today.push(item);
    store.save();
    broadcast('today');
    return item;
  });

  ipcMain.handle('today:toggle', (_event, { id }) => {
    const item = store.getData().today.find((i) => i.id === id);
    if (item) {
      item.done = !item.done;
      store.save();
      broadcast('today');
    }
    return item;
  });

  ipcMain.handle('today:remove', (_event, { id }) => {
    const data = store.getData();
    data.today = data.today.filter((i) => i.id !== id);
    store.save();
    broadcast('today');
    return { id };
  });

  // ---------- Topics ----------
  ipcMain.handle('topics:list', () => store.getData().topics);

  ipcMain.handle('topics:addCategory', (_event, { name }) => {
    if (store.isBlank(name)) throw new Error('name is required');
    const category = { id: store.newId(), name: name.trim(), items: [] };
    store.getData().topics.push(category);
    store.save();
    broadcast('topics');
    return category;
  });

  ipcMain.handle('topics:renameCategory', (_event, { id, name }) => {
    if (store.isBlank(name)) throw new Error('name is required');
    const category = store.getData().topics.find((c) => c.id === id);
    if (category) {
      category.name = name.trim();
      store.save();
      broadcast('topics');
    }
    return category;
  });

  ipcMain.handle('topics:deleteCategory', (_event, { id }) => {
    const data = store.getData();
    data.topics = data.topics.filter((c) => c.id !== id);
    store.save();
    broadcast('topics');
    return { id };
  });

  ipcMain.handle('topics:addItem', (_event, { categoryId, text }) => {
    if (store.isBlank(text)) throw new Error('text is required');
    const category = store.getData().topics.find((c) => c.id === categoryId);
    if (!category) throw new Error('category not found');
    const item = { id: store.newId(), text: text.trim(), done: false };
    category.items.push(item);
    store.save();
    broadcast('topics');
    return item;
  });

  ipcMain.handle('topics:toggleItem', (_event, { categoryId, itemId }) => {
    const category = store.getData().topics.find((c) => c.id === categoryId);
    const item = category && category.items.find((i) => i.id === itemId);
    if (item) {
      item.done = !item.done;
      store.save();
      broadcast('topics');
    }
    return item;
  });

  ipcMain.handle('topics:removeItem', (_event, { categoryId, itemId }) => {
    const category = store.getData().topics.find((c) => c.id === categoryId);
    if (category) {
      category.items = category.items.filter((i) => i.id !== itemId);
      store.save();
      broadcast('topics');
    }
    return { itemId };
  });

  // ---------- Tracker ----------
  ipcMain.handle('tracker:list', () => store.getData().tracker);

  ipcMain.handle('tracker:addRow', () => {
    const row = { id: store.newId(), item: '', category: '', status: '' };
    store.getData().tracker.push(row);
    store.save();
    broadcast('tracker');
    return row;
  });

  ipcMain.handle('tracker:updateRow', (_event, { id, field, value }) => {
    if (!['item', 'category', 'status'].includes(field)) {
      throw new Error('invalid field');
    }
    const row = store.getData().tracker.find((r) => r.id === id);
    if (row) {
      row[field] = value;
      store.save();
      broadcast('tracker');
    }
    return row;
  });

  ipcMain.handle('tracker:removeRow', (_event, { id }) => {
    const data = store.getData();
    data.tracker = data.tracker.filter((r) => r.id !== id);
    store.save();
    broadcast('tracker');
    return { id };
  });

  // ---------- Notes ----------
  ipcMain.handle('notes:list', () => store.getData().notes);

  ipcMain.handle('notes:add', (_event, { text }) => {
    if (store.isBlank(text)) throw new Error('text is required');
    const note = { id: store.newId(), text: text.trim(), updatedAt: new Date().toISOString() };
    store.getData().notes.push(note);
    store.save();
    broadcast('notes');
    return note;
  });

  ipcMain.handle('notes:update', (_event, { id, text }) => {
    if (store.isBlank(text)) throw new Error('text is required');
    const note = store.getData().notes.find((n) => n.id === id);
    if (note) {
      note.text = text.trim();
      note.updatedAt = new Date().toISOString();
      store.save();
      broadcast('notes');
    }
    return note;
  });

  ipcMain.handle('notes:remove', (_event, { id }) => {
    const data = store.getData();
    data.notes = data.notes.filter((n) => n.id !== id);
    store.save();
    broadcast('notes');
    return { id };
  });

  // ---------- Quick Add ----------
  ipcMain.handle('quickAdd:submit', (_event, { target, text }) => {
    if (store.isBlank(text)) throw new Error('text is required');

    let entry;
    if (target === 'today') {
      entry = {
        id: store.newId(),
        text: text.trim(),
        done: false,
        createdAt: new Date().toISOString(),
      };
      store.getData().today.push(entry);
      store.save();
      broadcast('today');
    } else if (target === 'notes') {
      entry = { id: store.newId(), text: text.trim(), updatedAt: new Date().toISOString() };
      store.getData().notes.push(entry);
      store.save();
      broadcast('notes');
    } else {
      throw new Error('invalid target');
    }

    windows.closeQuickAdd();
    return { entry };
  });

  // ---------- App / window control ----------
  ipcMain.handle('app:openMain', () => {
    windows.showMainWindow();
  });

  ipcMain.handle('app:quit', () => {
    app.quit();
  });
}

module.exports = { registerIpcHandlers };
