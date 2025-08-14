// Browser Debug Logger - Captures console logs and sends to server
interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  args?: any[];
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 500; // Maximum logs to keep in memory
  private uploadInterval = 10000; // Upload every 10 seconds
  private uploadTimer: NodeJS.Timeout | null = null;
  
  // Original console methods
  private originalLog = console.log;
  private originalError = console.error;
  private originalWarn = console.warn;
  private originalInfo = console.info;

  constructor() {
    this.initializeCapture();
    this.startAutoUpload();
    this.addManualControls();
  }

  private initializeCapture() {
    // Override console.log
    console.log = (...args: any[]) => {
      this.originalLog(...args);
      this.captureLog('log', args);
    };

    // Override console.error
    console.error = (...args: any[]) => {
      this.originalError(...args);
      this.captureLog('error', args);
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      this.originalWarn(...args);
      this.captureLog('warn', args);
    };

    // Override console.info
    console.info = (...args: any[]) => {
      this.originalInfo(...args);
      this.captureLog('info', args);
    };

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.captureLog('error', [`Unhandled Error: ${event.error?.message || event.message}`, event.error?.stack || '']);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureLog('error', [`Unhandled Promise Rejection: ${event.reason}`]);
    });

    console.log('🔍 Debug Logger initialized - capturing all console output');
  }

  private captureLog(level: string, args: any[]) {
    const logEntry: LogEntry = {
      level,
      message: args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' '),
      timestamp: new Date().toISOString(),
      args: args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.parse(JSON.stringify(arg));
          } catch {
            return String(arg);
          }
        }
        return arg;
      })
    };

    this.logs.push(logEntry);

    // Trim logs if too many
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private async uploadLogs() {
    if (this.logs.length === 0) return;

    try {
      const payload = {
        logs: [...this.logs], // Copy current logs
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/debug/browser-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        this.originalLog(`📤 Uploaded ${result.entries} log entries to server`);
        this.logs = []; // Clear uploaded logs
      } else {
        this.originalError('Failed to upload logs to server:', response.statusText);
      }
    } catch (error) {
      this.originalError('Error uploading logs:', error);
    }
  }

  private startAutoUpload() {
    this.uploadTimer = setInterval(() => {
      this.uploadLogs();
    }, this.uploadInterval);
  }

  private addManualControls() {
    // Add global functions for manual control
    (window as any).debugLogger = {
      upload: () => this.uploadLogs(),
      clear: () => {
        this.logs = [];
        this.originalLog('🗑️ Debug logs cleared');
      },
      getLogs: () => this.logs,
      getStats: () => ({
        totalLogs: this.logs.length,
        maxLogs: this.maxLogs,
        uploadInterval: this.uploadInterval
      }),
      downloadLogs: () => this.downloadLogs()
    };

    console.log('🛠️ Debug Logger controls available:');
    console.log('  debugLogger.upload() - Upload logs now');
    console.log('  debugLogger.clear() - Clear captured logs');
    console.log('  debugLogger.getLogs() - View captured logs');
    console.log('  debugLogger.getStats() - View logger stats');
    console.log('  debugLogger.downloadLogs() - Download logs as file');
  }

  private downloadLogs() {
    const content = this.logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `browser-logs-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.originalLog('💾 Logs downloaded');
  }

  public destroy() {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer);
      this.uploadTimer = null;
    }

    // Restore original console methods
    console.log = this.originalLog;
    console.error = this.originalError;
    console.warn = this.originalWarn;
    console.info = this.originalInfo;

    // Final upload
    this.uploadLogs();
  }
}

// Initialize the debug logger
let debugLoggerInstance: DebugLogger | null = null;

export const initializeDebugLogger = () => {
  if (!debugLoggerInstance) {
    debugLoggerInstance = new DebugLogger();
  }
  return debugLoggerInstance;
};

export const getDebugLogger = () => debugLoggerInstance;

// Auto-initialize in development
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  initializeDebugLogger();
} 