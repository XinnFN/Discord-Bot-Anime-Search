import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILE = path.join(__dirname, '..', 'data', 'watchlist.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load database
function loadDb() {
  ensureDataDir();
  
  if (!fs.existsSync(DB_FILE)) {
    return {};
  }
  
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading watchlist database:', error);
    return {};
  }
}

// Save database
function saveDb(db) {
  ensureDataDir();
  
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving watchlist database:', error);
  }
}

// Add anime to user's watchlist
export function addToWatchlist(userId, anime) {
  const db = loadDb();
  
  if (!db[userId]) {
    db[userId] = [];
  }
  
  // Check if already exists
  const exists = db[userId].some(a => a.id === anime.id);
  if (exists) {
    return false;
  }
  
  db[userId].push({
    ...anime,
    addedAt: Date.now()
  });
  
  saveDb(db);
  return true;
}

// Remove anime from user's watchlist
export function removeFromWatchlist(userId, animeId) {
  const db = loadDb();
  
  if (!db[userId]) {
    return false;
  }
  
  const initialLength = db[userId].length;
  db[userId] = db[userId].filter(a => a.id !== animeId);
  
  if (db[userId].length === initialLength) {
    return false; // Nothing was removed
  }
  
  saveDb(db);
  return true;
}

// Get user's watchlist
export function getWatchlist(userId) {
  const db = loadDb();
  return db[userId] || [];
}

// Check if anime is in watchlist
export function isInWatchlist(userId, animeId) {
  const db = loadDb();
  
  if (!db[userId]) {
    return false;
  }
  
  return db[userId].some(a => a.id === animeId);
}

// Get watchlist stats
export function getWatchlistStats(userId) {
  const watchlist = getWatchlist(userId);
  
  return {
    total: watchlist.length,
    byStatus: watchlist.reduce((acc, anime) => {
      acc[anime.status] = (acc[anime.status] || 0) + 1;
      return acc;
    }, {}),
    byType: watchlist.reduce((acc, anime) => {
      acc[anime.type] = (acc[anime.type] || 0) + 1;
      return acc;
    }, {})
  };
}
