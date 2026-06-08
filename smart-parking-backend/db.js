const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./smartparking.db", (error) => {
  if (error) {
    console.error("Greška pri spajanju na SQLite bazu:", error.message);
  } else {
    console.log("Spojeno na SQLite bazu.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS parking (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS parking_spot (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parking_id TEXT NOT NULL,
      label TEXT NOT NULL,
      occupied INTEGER NOT NULL DEFAULT 0,
      online INTEGER NOT NULL DEFAULT 1,
      source TEXT NOT NULL DEFAULT 'simulation',
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parking_id) REFERENCES parking(id),
      UNIQUE(parking_id, label)
    )
  `);
});

module.exports = db;