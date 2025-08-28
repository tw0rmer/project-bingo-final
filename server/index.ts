// Main server file for the bingo game application
import 'dotenv/config'; // Load environment variables first
import './logger'; // Initialize logging system first
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import { registerRoutes } from "./routes/index";
import GameEngine from "./gameEngine";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
// Generate a unique server session ID on startup to detect restarts
const serverSessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
console.log('[SERVER] Started with session ID:', serverSessionId);

// Database cleanup on startup
import { db } from './db';
import { lobbyParticipants, lobbies, games, gameParticipants } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function cleanupStaleData() {
  try {
    console.log('[DB CLEANUP] Starting database cleanup...');
    const currentParticipants = await db.select().from(lobbyParticipants);
    const currentLobbies = await db.select().from(lobbies);
    console.log(`[DB CLEANUP] Pre-check: ${currentParticipants.length} participants across ${currentLobbies.length} lobbies`);

    // Remove all lobby participants (fresh start on server restart)
    if (currentParticipants.length > 0) {
      await db.delete(lobbyParticipants);
    }

    // Reset lobby seat counts
    await db.update(lobbies).set({ seatsTaken: 0 });

    // Finish any active games and clear game participants (dev convenience)
    await db.update(games).set({ status: 'finished', currentNumber: null }).where(eq(games.status as any, 'active' as any));
    await db.delete(gameParticipants);

    const remainingParticipants = await db.select().from(lobbyParticipants);
    console.log(`[DB CLEANUP] Completed. Participants remaining: ${remainingParticipants.length}`);
  } catch (error) {
    console.error('[DB CLEANUP] Error during database cleanup:', error);
  }
}

// Run cleanup immediately
cleanupStaleData();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  // Create HTTP server first
  const httpServer = createServer(app);

  // Setup Socket.IO with enhanced authentication BEFORE registering routes
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow all origins for simplicity
    },
  });

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('[SOCKET AUTH] No token provided');
      return next(new Error('Authentication token required'));
    }

    try {
      // Import the verifyToken function to ensure consistent JWT handling
      const { verifyToken } = await import('./middleware/auth');
      const decoded = verifyToken(token);
      
      console.log('[SOCKET AUTH] Token verified for user:', decoded.id);
      socket.data.userId = decoded.id;
      socket.data.userEmail = decoded.email;
      
      next();
    } catch (err) {
      console.error('[SOCKET AUTH] Token verification failed:', err);
      return next(new Error('Invalid authentication token'));
    }
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const userEmail = socket.data.userEmail;
    
    console.log(`[SOCKET] User connected: ${userEmail} (ID: ${userId}, Socket: ${socket.id})`);
    
    // Join user to their personal room for targeted messages
    socket.join(`user_${userId}`);
    
    // Handle lobby-specific events
    socket.on('join_lobby', (data) => {
      const lobbyId = typeof data === 'object' ? data.lobbyId : data;
      const lobbyRoom = `lobby_${lobbyId}`;
      socket.join(lobbyRoom);
      console.log(`[SOCKET] User ${userEmail} joined lobby room: ${lobbyRoom}`);
      
      // Notify others in the lobby
      socket.to(lobbyRoom).emit('user_joined_lobby', {
        userId,
        userEmail,
        lobbyId,
        timestamp: new Date().toISOString()
      });
    });
    
    socket.on('leave_lobby', (lobbyId) => {
      const lobbyRoom = `lobby_${lobbyId}`;
      socket.leave(lobbyRoom);
      console.log(`[SOCKET] User ${userEmail} left lobby room: ${lobbyRoom}`);
      
      // Notify others in the lobby
      socket.to(lobbyRoom).emit('user_left_lobby', {
        userId,
        userEmail,
        lobbyId,
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`[SOCKET] User disconnected: ${userEmail} (Reason: ${reason})`);
    });
    
    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`[SOCKET] Socket error for user ${userEmail}:`, error);
    });
  });

  // Initialize Game Engine
  const gameEngine = new GameEngine(io);

  // Make game engine, io, and server session ID available to routes BEFORE registering routes
  app.set('gameEngine', gameEngine);
  app.set('io', io);
  app.set('serverSessionId', serverSessionId);
  app.set('etag', false);
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  // Register API routes AFTER Socket.io is set up
  await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Setup Vite for development or serve static files for production
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  // Start the server
  const port = parseInt(process.env.PORT || '5000', 10);
  httpServer.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`Server with Socket.IO listening on port ${port}`);
  });
})();
