const params = new URLSearchParams(window.location.search);
const target = params.get('target') === 'notes' ? 'notes' : 'today';

const form = document.getElementById('quick-add-form');
const input = document.getElementById('quick-add-input');

input.focus();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  await window.slate.quickAdd.submit(target, text);
  window.close();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.close();
  }
});
