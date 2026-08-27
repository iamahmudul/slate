const state = { today: [], topics: [], tracker: [], notes: [] };

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function emptyState(text) {
  const p = document.createElement('p');
  p.className = 'empty-state';
  p.textContent = text;
  return p;
}

// ---------- Tabs ----------
function initTabs() {
  $all('.tab-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      $all('.tab-button').forEach((b) => b.classList.remove('active'));
      $all('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      $(`#tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

// ---------- Today ----------
function renderToday() {
  const panel = $('#tab-today');
  panel.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'add-row';
  form.innerHTML = '<input type="text" placeholder="Add a task for today..." /><button type="submit">Add</button>';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const text = input.value.trim();
    if (!text) return;
    await window.slate.today.add(text);
    input.value = '';
    state.today = await window.slate.today.list();
    renderToday();
  });
  panel.appendChild(form);

  if (state.today.length === 0) {
    panel.appendChild(emptyState('No items yet'));
    return;
  }

  const list = document.createElement('ul');
  list.className = 'checklist';
  state.today.forEach((item) => {
    const li = document.createElement('li');
    li.className = item.done ? 'done' : '';
    li.innerHTML = `
      <label>
        <input type="checkbox" ${item.done ? 'checked' : ''} />
        <span>${escapeHtml(item.text)}</span>
      </label>
      <button class="remove" title="Remove">&times;</button>
    `;
    li.querySelector('input').addEventListener('change', async () => {
      await window.slate.today.toggle(item.id);
      state.today = await window.slate.today.list();
      renderToday();
    });
    li.querySelector('.remove').addEventListener('click', async () => {
      await window.slate.today.remove(item.id);
      state.today = await window.slate.today.list();
      renderToday();
    });
    list.appendChild(li);
  });
  panel.appendChild(list);
}

// ---------- Topics ----------
function renderTopics() {
  const panel = $('#tab-topics');
  panel.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'add-row';
  form.innerHTML = '<input type="text" placeholder="New category name..." /><button type="submit">Add Category</button>';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const name = input.value.trim();
    if (!name) return;
    await window.slate.topics.addCategory(name);
    input.value = '';
    state.topics = await window.slate.topics.list();
    renderTopics();
  });
  panel.appendChild(form);

  if (state.topics.length === 0) {
    panel.appendChild(emptyState('No categories yet'));
    return;
  }

  state.topics.forEach((category) => {
    const group = document.createElement('div');
    group.className = 'category';

    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
      <span class="category-name">${escapeHtml(category.name)}</span>
      <button class="rename" type="button">Rename</button>
      <button class="delete" type="button">Delete</button>
    `;
    header.querySelector('.rename').addEventListener('click', async () => {
      const name = window.prompt('Rename category', category.name);
      if (name === null) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      await window.slate.topics.renameCategory(category.id, trimmed);
      state.topics = await window.slate.topics.list();
      renderTopics();
    });
    header.querySelector('.delete').addEventListener('click', async () => {
      await window.slate.topics.deleteCategory(category.id);
      state.topics = await window.slate.topics.list();
      renderTopics();
    });
    group.appendChild(header);

    const itemForm = document.createElement('form');
    itemForm.className = 'add-row';
    itemForm.innerHTML = '<input type="text" placeholder="Add item..." /><button type="submit">Add</button>';
    itemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = itemForm.querySelector('input');
      const text = input.value.trim();
      if (!text) return;
      await window.slate.topics.addItem(category.id, text);
      input.value = '';
      state.topics = await window.slate.topics.list();
      renderTopics();
    });
    group.appendChild(itemForm);

    if (category.items.length === 0) {
      group.appendChild(emptyState('No items yet'));
    } else {
      const list = document.createElement('ul');
      list.className = 'checklist';
      category.items.forEach((item) => {
        const li = document.createElement('li');
        li.className = item.done ? 'done' : '';
        li.innerHTML = `
          <label>
            <input type="checkbox" ${item.done ? 'checked' : ''} />
            <span>${escapeHtml(item.text)}</span>
          </label>
          <button class="remove" title="Remove">&times;</button>
        `;
        li.querySelector('input').addEventListener('change', async () => {
          await window.slate.topics.toggleItem(category.id, item.id);
          state.topics = await window.slate.topics.list();
          renderTopics();
        });
        li.querySelector('.remove').addEventListener('click', async () => {
          await window.slate.topics.removeItem(category.id, item.id);
          state.topics = await window.slate.topics.list();
          renderTopics();
        });
        list.appendChild(li);
      });
      group.appendChild(list);
    }

    panel.appendChild(group);
  });
}

// ---------- Tracker ----------
function editableCell(row, field) {
  const td = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = row[field];
  input.addEventListener('change', async () => {
    await window.slate.tracker.updateRow(row.id, field, input.value);
    state.tracker = await window.slate.tracker.list();
  });
  td.appendChild(input);
  return td;
}

function renderTracker() {
  const panel = $('#tab-tracker');
  panel.innerHTML = '';

  const addButton = document.createElement('button');
  addButton.className = 'add-row-button';
  addButton.type = 'button';
  addButton.textContent = 'Add Row';
  addButton.addEventListener('click', async () => {
    await window.slate.tracker.addRow();
    state.tracker = await window.slate.tracker.list();
    renderTracker();
  });
  panel.appendChild(addButton);

  if (state.tracker.length === 0) {
    panel.appendChild(emptyState('No tracked items yet'));
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th>Item</th><th>Category/Track</th><th>Status</th><th></th></tr></thead>';
  const tbody = document.createElement('tbody');

  state.tracker.forEach((row) => {
    const tr = document.createElement('tr');
    tr.appendChild(editableCell(row, 'item'));
    tr.appendChild(editableCell(row, 'category'));
    tr.appendChild(editableCell(row, 'status'));

    const actionsTd = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove';
    removeBtn.type = 'button';
    removeBtn.title = 'Remove';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', async () => {
      await window.slate.tracker.removeRow(row.id);
      state.tracker = await window.slate.tracker.list();
      renderTracker();
    });
    actionsTd.appendChild(removeBtn);
    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  panel.appendChild(table);
}

// ---------- Notes ----------
function renderNotes() {
  const panel = $('#tab-notes');
  panel.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'add-row';
  form.innerHTML = '<input type="text" placeholder="New note..." /><button type="submit">Add</button>';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const text = input.value.trim();
    if (!text) return;
    await window.slate.notes.add(text);
    input.value = '';
    state.notes = await window.slate.notes.list();
    renderNotes();
  });
  panel.appendChild(form);

  if (state.notes.length === 0) {
    panel.appendChild(emptyState('No notes yet'));
    return;
  }

  const list = document.createElement('ul');
  list.className = 'notes-list';
  state.notes.forEach((note) => {
    const li = document.createElement('li');

    const textarea = document.createElement('textarea');
    textarea.value = note.text;
    textarea.addEventListener('change', async () => {
      const text = textarea.value.trim();
      if (!text) {
        textarea.value = note.text;
        return;
      }
      await window.slate.notes.update(note.id, text);
      state.notes = await window.slate.notes.list();
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove';
    removeBtn.type = 'button';
    removeBtn.title = 'Remove';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', async () => {
      await window.slate.notes.remove(note.id);
      state.notes = await window.slate.notes.list();
      renderNotes();
    });

    li.appendChild(textarea);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
  panel.appendChild(list);
}

// ---------- Bootstrap ----------
function renderSection(section) {
  if (section === 'today') renderToday();
  if (section === 'topics') renderTopics();
  if (section === 'tracker') renderTracker();
  if (section === 'notes') renderNotes();
}

async function init() {
  initTabs();

  state.today = await window.slate.today.list();
  state.topics = await window.slate.topics.list();
  state.tracker = await window.slate.tracker.list();
  state.notes = await window.slate.notes.list();

  renderToday();
  renderTopics();
  renderTracker();
  renderNotes();

  // Keeps this window in sync when a mutation happens elsewhere (e.g. Quick
  // Add), even while this window is hidden (FR-024, SC-008).
  window.slate.onDataChanged(({ section, data }) => {
    state[section] = data;
    renderSection(section);
  });
}

init();
