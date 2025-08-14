import fs from 'fs';
import path from 'path';

// Create debugging directory if it doesn't exist
const debuggingDir = path.join(process.cwd(), 'debugging');
if (!fs.existsSync(debuggingDir)) {
  fs.mkdirSync(debuggingDir, { recursive: true });
}

// Generate timestamp for log files
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5); // Remove milliseconds and replace : with -
};

// Current session timestamp
const sessionTimestamp = getTimestamp();

// Log file paths
const serverLogFile = path.join(debuggingDir, `server-${sessionTimestamp}.log`);
const consoleLogFile = path.join(debuggingDir, `console-${sessionTimestamp}.log`);

// Original console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

// Enhanced logging function
const writeToFile = (file: string, level: string, args: any[]) => {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  
  try {
    fs.appendFileSync(file, logEntry);
  } catch (error) {
    originalError('Failed to write to log file:', error);
  }
};

// Override console methods to capture logs
console.log = (...args: any[]) => {
  originalLog(...args);
  writeToFile(serverLogFile, 'LOG', args);
};

console.error = (...args: any[]) => {
  originalError(...args);
  writeToFile(serverLogFile, 'ERROR', args);
};

console.warn = (...args: any[]) => {
  originalWarn(...args);
  writeToFile(serverLogFile, 'WARN', args);
};

// Export logger utilities
export const logger = {
  log: (...args: any[]) => {
    originalLog(...args);
    writeToFile(serverLogFile, 'LOG', args);
  },
  error: (...args: any[]) => {
    originalError(...args);
    writeToFile(serverLogFile, 'ERROR', args);
  },
  warn: (...args: any[]) => {
    originalWarn(...args);
    writeToFile(serverLogFile, 'WARN', args);
  },
  debug: (...args: any[]) => {
    originalLog('[DEBUG]', ...args);
    writeToFile(serverLogFile, 'DEBUG', args);
  },
  getLogFiles: () => ({
    serverLog: serverLogFile,
    consoleLog: consoleLogFile,
    sessionTimestamp
  })
};

// Initialize logging
originalLog(`📝 Server logging initialized`);
originalLog(`📂 Server logs: ${serverLogFile}`);
originalLog(`🌐 Browser logs: ${consoleLogFile}`);

export default logger; 