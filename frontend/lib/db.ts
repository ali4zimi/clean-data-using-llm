import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db/wordlist.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening database', err);
  else {
    db.run(`
      CREATE TABLE IF NOT EXISTS wordlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        meaning TEXT NOT NULL,
        example TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
});

export default db;
