const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');

function emptyData() {
  return { today: [], topics: [], tracker: [], notes: [] };
}

let data = emptyData();

function dataFilePath() {
  return path.join(app.getPath('userData'), 'slate-data.json');
}

// Loads slate-data.json into memory. Falls back to an empty document if the
// file is missing or fails to parse, so a bad/missing file never blocks launch (FR-018).
function load() {
  try {
    const raw = fs.readFileSync(dataFilePath(), 'utf-8');
    const parsed = JSON.parse(raw);
    data = {
      today: Array.isArray(parsed.today) ? parsed.today : [],
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      tracker: Array.isArray(parsed.tracker) ? parsed.tracker : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch (err) {
    data = emptyData();
  }
  return data;
}

// Writes the in-memory document atomically (temp file + rename). If the write
// fails, the in-memory data is left untouched and remains the source of truth
// for this session; the next call to save() (triggered by the next mutation)
// simply tries again (FR-028).
function save() {
  const file = dataFilePath();
  const tmpFile = `${file}.tmp`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
    fs.renameSync(tmpFile, file);
  } catch (err) {
    // Intentionally silent: keep the in-memory change, retry on next save().
  }
}

function getData() {
  return data;
}

function newId() {
  return crypto.randomUUID();
}

function isBlank(text) {
  return typeof text !== 'string' || text.trim().length === 0;
}

module.exports = { load, save, getData, newId, isBlank };
