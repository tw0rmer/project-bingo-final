import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'bingo.db');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `bingo_backup_${timestamp}.db`);

try {
    // Check if database exists
    if (!fs.existsSync(DB_PATH)) {
        console.error('❌ Database file not found!');
        process.exit(1);
    }

    // Copy database file
    fs.copyFileSync(DB_PATH, backupPath);

    // Get file size
    const stats = fs.statSync(backupPath);
    const sizeKB = stats.size / 1024;

    console.log('✅ Database backup created successfully!');
    console.log(`📁 Location: ${backupPath}`);
    console.log(`📊 Size: ${sizeKB.toFixed(1)}KB`);

} catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
} 