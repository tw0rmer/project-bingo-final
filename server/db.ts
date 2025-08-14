// Database connection for the bingo game application
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import bcrypt from 'bcryptjs';
import * as schema from "../shared/schema";
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// SQLite database file path
const DB_PATH = path.join(DATA_DIR, 'bingo.db');
console.log('[DB] Using SQLite database at:', DB_PATH);

// Initialize database connection
const sqlite = new Database(DB_PATH);
let db: any;

// Initialize SQLite with Drizzle
try {
    // Enable foreign keys and other SQLite optimizations
    sqlite.exec('PRAGMA foreign_keys = ON;');
    sqlite.exec('PRAGMA journal_mode = WAL;');
    sqlite.exec('PRAGMA synchronous = NORMAL;');
    // Ensure new tables/columns exist (dev convenience). For production, use migrations.
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS winners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER,
        lobby_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        note TEXT,
        created_at INTEGER
      );
    `);
    try {
      const columns: Array<{ name: string }> = sqlite.prepare('PRAGMA table_info(users)').all() as any;
      const hasUsername = columns.some((c) => c.name === 'username');
      if (!hasUsername) {
        sqlite.exec('ALTER TABLE users ADD COLUMN username TEXT');
      }
    } catch (e) {
      console.warn('[DB] Username column check/creation failed:', e);
    }
    
    // Create database connection with Drizzle
    db = drizzle(sqlite, { schema });
    console.log('[DB] SQLite database initialized successfully');
} catch (error) {
    console.error('[DB] Failed to initialize SQLite database:', error);
    process.exit(1);
}

// Export database connection
export { db };
export type DB = typeof db;