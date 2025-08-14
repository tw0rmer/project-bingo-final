# 🐛 Debug Logging System

This project includes an automated debug logging system that captures both server and browser logs for easy debugging.

## 📁 Log Location

All logs are automatically saved to the `debugging/` folder:

```
debugging/
├── server-2025-01-31T00-05-19.log     # Server console logs
├── browser-2025-01-31T00-05-25.log    # Browser console logs (uploaded)
└── console-2025-01-31T00-05-19.log    # Additional console logs
```

## 🖥️ Server Logging

**Automatic**: All server console output is automatically captured to files.

### What's Captured:
- ✅ All `console.log()`, `console.error()`, `console.warn()` calls
- ✅ API request logs
- ✅ Database operations
- ✅ Socket.io events
- ✅ Authentication flows

### Log File Format:
```
[2025-01-31T00:05:19.123Z] [LOG] Server message here
[2025-01-31T00:05:19.456Z] [ERROR] Error message here
[2025-01-31T00:05:19.789Z] [WARN] Warning message here
```

## 🌐 Browser Logging

**Automatic**: All browser console output is captured and uploaded to the server every 10 seconds.

### What's Captured:
- ✅ All `console.log()`, `console.error()`, `console.warn()`, `console.info()` calls
- ✅ Unhandled JavaScript errors
- ✅ Unhandled promise rejections
- ✅ Authentication flows
- ✅ Socket.io events
- ✅ API responses

### Debug Panel

Look for the **🐛 DEBUG** button in the bottom-right corner of any page.

**Features:**
- 📤 **Upload Logs Now**: Immediately upload current logs to server
- 👁️ **View in Console**: Display captured logs in browser console
- 💾 **Download Logs**: Download logs as a text file
- 🗑️ **Clear Logs**: Clear captured logs from memory

### Manual Controls

Open browser console and use these commands:

```javascript
// Upload logs immediately
debugLogger.upload()

// View captured logs
debugLogger.getLogs()

// Clear logs
debugLogger.clear()

// Get statistics
debugLogger.getStats()

// Download logs as file
debugLogger.downloadLogs()
```

## 🚀 Quick Usage

### For Testing/Debugging:

1. **Start the server**: `npm run dev`
2. **Open the app** in your browser
3. **Reproduce the issue** you're testing
4. **Wait 10 seconds** for automatic upload, or click **🐛 DEBUG** → **📤 Upload Logs Now**
5. **Check the `debugging/` folder** for log files
6. **Share the log files** for analysis

### For Developers:

```bash
# View recent server logs
tail -f debugging/server-*.log

# View all logs from today
ls -la debugging/

# Search for specific errors
grep -i "error" debugging/server-*.log
```

## 📋 Log Analysis

### Common Patterns to Look For:

**Authentication Issues:**
```
[AUTH] Token verification failed
[AUTH] Stored token validation failed
[AUTH] Server restarted detected
```

**Socket.io Issues:**
```
[SOCKET] User connected
[SOCKET] Emitted seat_taken to lobby room
[SOCKET AUTH] Token verified for user
```

**Database Issues:**
```
[MOCK DB] Select participants with where, current count: 0
[MOCK DB] Added participant via then
[LOBBY] Join request
```

**API Issues:**
```
POST /api/lobbies/1/join 200 in 38ms
GET /api/lobbies/1/participants 304 in 3ms
[SERVER] API Request Received
```

## 🛠️ Configuration

### Server Logging
- **Location**: `server/logger.ts`
- **Max file size**: Unlimited (files rotate by session)
- **Format**: Timestamped with log level

### Browser Logging
- **Max logs in memory**: 500 entries
- **Upload interval**: 10 seconds
- **Auto-initialization**: Development mode only
- **Location**: `client/src/lib/debugLogger.ts`

## 📝 Tips

1. **Always check both server AND browser logs** when debugging
2. **Use the timestamp** to correlate events between server and browser
3. **Upload browser logs manually** before reproducing critical issues
4. **Download logs** before clearing them if you need to keep them
5. **The debug panel shows real-time stats** about captured logs

## 🔄 Session Management

- **New log files** are created each time the server restarts
- **Browser logs** are uploaded and then cleared from memory
- **Log files persist** until manually deleted
- **Session timestamps** help track different test sessions

This system makes debugging much easier by automatically capturing everything that happens during your testing sessions! 