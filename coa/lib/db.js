'use strict';
/*
 * Tiny JSON-file data store. No external dependencies.
 * Holds the whole COA state in memory and persists it to disk after every
 * mutation (debounced). On first run it writes the seed; afterwards it loads
 * whatever is on disk so test data survives restarts.
 */
const fs = require('fs');
const path = require('path');
const { seed } = require('./seed');

const DATA_DIR = process.env.COA_DATA_DIR || path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

let state = null;
let saveTimer = null;

function load() {
  if (state) return state;
  try {
    if (fs.existsSync(DATA_FILE)) {
      state = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return state;
    }
  } catch (e) {
    console.error('[db] failed to read store.json, reseeding:', e.message);
  }
  state = seed();
  persistNow();
  return state;
}

function get() {
  return load();
}

function persistNow() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('[db] write failed:', e.message);
  }
}

// Debounced save — call after any mutation.
function save() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(persistNow, 150);
}

// Drop everything and reseed (handy for a clean test run).
function reset() {
  state = seed();
  persistNow();
  return state;
}

module.exports = { get, save, persistNow, reset, DATA_FILE };
