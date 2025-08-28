// Manual migration script to add missing columns to existing database
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'bingo.db');
const db = new Database(dbPath);

async function manualMigrate() {
  console.log('[MIGRATION] Starting manual database migration...');
  
  try {
    // Check if columns exist first
    const tableInfo = db.prepare("PRAGMA table_info(lobbies)").all();
    const existingColumns = (tableInfo as any[]).map(col => col.name);
    console.log('[MIGRATION] Existing lobby columns:', existingColumns);
    
    // Add missing columns to lobbies table
    if (!existingColumns.includes('description')) {
      console.log('[MIGRATION] Adding description column...');
      db.exec('ALTER TABLE lobbies ADD COLUMN description TEXT');
    }
    
    if (!existingColumns.includes('max_games')) {
      console.log('[MIGRATION] Adding max_games column...');
      db.exec('ALTER TABLE lobbies ADD COLUMN max_games INTEGER DEFAULT 4');
      db.exec('UPDATE lobbies SET max_games = 4 WHERE max_games IS NULL');
    }
    
    // Check if games table exists
    const tablesResult = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='games'").all();
    
    if ((tablesResult as any[]).length === 0) {
      console.log('[MIGRATION] Creating games table...');
      db.exec(`
        CREATE TABLE games (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lobby_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          game_number INTEGER NOT NULL,
          max_seats INTEGER DEFAULT 15,
          seats_taken INTEGER DEFAULT 0,
          winner_id INTEGER,
          status TEXT DEFAULT 'waiting',
          drawn_numbers TEXT DEFAULT '[]',
          current_number INTEGER,
          created_at INTEGER,
          updated_at INTEGER,
          FOREIGN KEY (lobby_id) REFERENCES lobbies(id),
          FOREIGN KEY (winner_id) REFERENCES users(id)
        )
      `);
    } else {
      // Check if the table has all required columns
      const gameTableInfo = db.prepare("PRAGMA table_info(games)").all();
      const gameColumns = (gameTableInfo as any[]).map(col => col.name);
      console.log('[MIGRATION] Existing game columns:', gameColumns);
      
      if (!gameColumns.includes('name')) {
        console.log('[MIGRATION] Adding name column to games...');
        db.exec('ALTER TABLE games ADD COLUMN name TEXT NOT NULL DEFAULT "Game"');
      }
      
      if (!gameColumns.includes('game_number')) {
        console.log('[MIGRATION] Adding game_number column to games...');
        db.exec('ALTER TABLE games ADD COLUMN game_number INTEGER NOT NULL DEFAULT 1');
      }
      
      if (!gameColumns.includes('max_seats')) {
        console.log('[MIGRATION] Adding max_seats column to games...');
        db.exec('ALTER TABLE games ADD COLUMN max_seats INTEGER DEFAULT 15');
      }
      
      if (!gameColumns.includes('seats_taken')) {
        console.log('[MIGRATION] Adding seats_taken column to games...');
        db.exec('ALTER TABLE games ADD COLUMN seats_taken INTEGER DEFAULT 0');
      }
    }
    
    // Check if game_participants table exists
    const gameParticipantsResult = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='game_participants'").all();
    
    if ((gameParticipantsResult as any[]).length === 0) {
      console.log('[MIGRATION] Creating game_participants table...');
      db.exec(`
        CREATE TABLE game_participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          game_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          seat_number INTEGER NOT NULL,
          card TEXT NOT NULL,
          is_winner INTEGER DEFAULT 0,
          joined_at INTEGER,
          FOREIGN KEY (game_id) REFERENCES games(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
    }
    
    console.log('[MIGRATION] Manual migration completed successfully!');
    return true;
  } catch (error) {
    console.error('[MIGRATION] Manual migration failed:', error);
    return false;
  } finally {
    db.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  manualMigrate()
    .then((success) => {
      console.log(`[MIGRATION] Completed with ${success ? 'success' : 'failure'}`);
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('[MIGRATION] Fatal error:', error);
      process.exit(1);
    });
}

export { manualMigrate };