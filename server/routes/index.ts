// Main routes file for the bingo game application
import { Express } from 'express';
import fs from 'fs';
import path from 'path';
import authRoutes from './auth';
import dashboardRoutes from './dashboard';
import lobbiesRoutes from './lobbies';
import gamesRoutes from './games';
import adminRoutes from './admin';
import achievementsRoutes from './achievements';
import { storage } from '../storage';
import { db } from '../db';
import { winners as winnersTable, users as usersTable, lobbies } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function registerRoutes(app: Express): Promise<void> {
  app.use('/api', (req, res, next) => {
    console.log(`[SERVER] API Request Received: ${req.method} ${req.originalUrl}`);
    next();
  });
  
  // Register API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/lobbies', lobbiesRoutes);
  app.use('/api/games', gamesRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/achievements', achievementsRoutes);

  // Game control endpoints (minimal for 7A)
  app.post('/api/games/:lobbyId/start', async (req, res) => {
    try {
      const lobbyId = parseInt(req.params.lobbyId, 10);
      const gameEngine = app.get('gameEngine');
      const game = await gameEngine.startGame(lobbyId);
      res.json({ message: 'Game started', gameId: game.id, lobbyId });
    } catch (e: any) {
      res.status(400).json({ message: e.message || 'Failed to start game' });
    }
  });

  app.post('/api/games/:lobbyId/stop', async (req, res) => {
    try {
      const lobbyId = parseInt(req.params.lobbyId, 10);
      const gameEngine = app.get('gameEngine');
      const snapshot = gameEngine.getSnapshotByLobby(lobbyId);
      if (!snapshot) return res.status(404).json({ message: 'No active game' });
      await gameEngine.endGame(snapshot.gameId);
      res.json({ message: 'Game stopped', gameId: snapshot.gameId, lobbyId });
    } catch (e: any) {
      res.status(400).json({ message: e.message || 'Failed to stop game' });
    }
  });

  app.get('/api/games/:lobbyId/snapshot', async (req, res) => {
    const lobbyId = parseInt(req.params.lobbyId, 10);
    const gameEngine = app.get('gameEngine');
    const snapshot = await gameEngine.getSnapshotByLobby(lobbyId);
    if (!snapshot) return res.status(404).json({ message: 'No active game' });
    res.json(snapshot);
  });

  // Admin: pause game
  app.post('/api/games/:lobbyId/pause', (req, res) => {
    const lobbyId = parseInt(req.params.lobbyId, 10);
    const gameEngine = app.get('gameEngine');
    try {
      gameEngine.pauseGame(lobbyId);
      res.json({ message: 'Game paused' });
    } catch (e: any) {
      res.status(400).json({ message: e.message || 'Unable to pause' });
    }
  });

  // Admin: resume game
  app.post('/api/games/:lobbyId/resume', (req, res) => {
    const lobbyId = parseInt(req.params.lobbyId, 10);
    const gameEngine = app.get('gameEngine');
    try {
      gameEngine.resumeGame(lobbyId);
      res.json({ message: 'Game resumed' });
    } catch (e: any) {
      res.status(400).json({ message: e.message || 'Unable to resume' });
    }
  });

  // Admin: set call speed
  app.post('/api/games/:lobbyId/speed', (req, res) => {
    const lobbyId = parseInt(req.params.lobbyId, 10);
    const { ms } = req.body || {};
    const gameEngine = app.get('gameEngine');
    try {
      gameEngine.setCallInterval(lobbyId, Number(ms) || 3000);
      res.json({ message: 'Speed updated', ms: Number(ms) || 3000 });
    } catch (e: any) {
      res.status(400).json({ message: e.message || 'Unable to update speed' });
    }
  });

  app.post('/api/games/:lobbyId/claim', async (req, res) => {
    try {
      const lobbyId = parseInt(req.params.lobbyId, 10);
      const { userId, seatNumber, numbers } = req.body || {};
      if (!userId || !seatNumber || !Array.isArray(numbers)) return res.status(400).json({ message: 'Invalid claim payload' });
      const gameEngine = app.get('gameEngine');
      const result = await gameEngine.claimWin(lobbyId, userId, seatNumber, numbers);
      res.json({ message: 'Win validated', ...result });
    } catch (e: any) {
      res.status(400).json({ message: e.message || 'Claim validation failed' });
    }
  });

  // Winners CRUD (public list + admin manage)
  app.get('/api/winners', async (_req, res) => {
    const list = await db.select({
      id: winnersTable.id,
      gameId: winnersTable.gameId,
      lobbyId: winnersTable.lobbyId,
      userId: winnersTable.userId,
      amount: winnersTable.amount,
      note: winnersTable.note,
      createdAt: winnersTable.createdAt,
      username: usersTable.username,
      email: usersTable.email
    }).from(winnersTable)
    .leftJoin(usersTable, eq(winnersTable.userId, usersTable.id));
    res.json(list);
  });

  app.post('/api/admin/winners', async (req, res) => {
    try {
      const payload = req.body || {};
      const [row] = await db.insert(winnersTable).values(payload).returning();
      res.json(row);
    } catch (e:any) {
      res.status(400).json({ message: e.message || 'Failed to add winner' });
    }
  });

  app.put('/api/admin/winners/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const [row] = await db.update(winnersTable).set(req.body || {}).where((winnersTable as any).id.eq?.(id) ?? undefined).returning();
      res.json(row);
    } catch (e:any) {
      res.status(400).json({ message: e.message || 'Failed to update winner' });
    }
  });

  app.delete('/api/admin/winners/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await db.delete(winnersTable).where((winnersTable as any).id.eq?.(id) ?? undefined);
      res.json({ message: 'Deleted' });
    } catch (e:any) {
      res.status(400).json({ message: e.message || 'Failed to delete winner' });
    }
  });

  app.post('/api/admin/winners/reset', async (_req, res) => {
    try {
      await db.delete(winnersTable);
      res.json({ message: 'Winners reset' });
    } catch (e:any) {
      res.status(400).json({ message: e.message || 'Failed to reset winners' });
    }
  });

  // Debug logging endpoint for browser logs
  app.post('/api/debug/browser-log', (req, res) => {
    try {
      const { logs, userAgent, url, timestamp } = req.body;
      
      if (!logs || !Array.isArray(logs)) {
        return res.status(400).json({ message: 'Invalid logs format' });
      }

      const debuggingDir = path.join(process.cwd(), 'debugging');
      const sessionTimestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const browserLogFile = path.join(debuggingDir, `browser-${sessionTimestamp}.log`);
      
      // Create log entry
      const logHeader = `\n=== BROWSER LOG CAPTURE ===\n`;
      const logMeta = `Timestamp: ${timestamp || new Date().toISOString()}\n`;
      const logUrl = `URL: ${url || 'unknown'}\n`;
      const logUA = `User Agent: ${userAgent || 'unknown'}\n`;
      const logSeparator = `================================\n\n`;
      
      let logContent = logHeader + logMeta + logUrl + logUA + logSeparator;
      
      // Process each log entry
      logs.forEach((log: any, index: number) => {
        logContent += `[${index + 1}] [${log.level?.toUpperCase() || 'LOG'}] ${log.timestamp || new Date().toISOString()}\n`;
        logContent += `${log.message || JSON.stringify(log)}\n\n`;
      });
      
      // Append to file
      fs.appendFileSync(browserLogFile, logContent);
      
      console.log(`📱 Browser logs captured: ${logs.length} entries saved to ${browserLogFile}`);
      res.json({ message: 'Browser logs captured successfully', entries: logs.length });
      
    } catch (error) {
      console.error('Error capturing browser logs:', error);
      res.status(500).json({ message: 'Failed to capture browser logs' });
    }
  });

  // Game rooms endpoints
  app.get("/api/game-rooms", async (req, res) => {
    try {
      const rooms = await storage.getGameRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game rooms" });
    }
  });

  app.get("/api/game-rooms/:id", async (req, res) => {
    try {
      const room = await storage.getGameRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Game room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game room" });
    }
  });

  // Winners endpoints
  app.get("/api/winners", async (req, res) => {
    try {
      const winners = await storage.getWinners();
      res.json(winners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch winners" });
    }
  });

  // FAQ endpoints
  app.get("/api/faq", async (req, res) => {
    try {
      const faqs = await storage.getFaqItems();
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  // Get deterministic cards for lobby (pre-game visibility)
  app.get('/api/lobbies/:lobbyId/cards', (req, res) => {
    const lobbyId = parseInt(req.params.lobbyId, 10);
    const gameEngine = app.get('gameEngine');
    try {
      const cards = gameEngine.getOrGenerateLobbyCards(lobbyId);
      res.json({ lobbyId, cards });
    } catch (e: any) {
      res.status(500).json({ message: e.message || 'Failed to get lobby cards' });
    }
  });

  // Achievement endpoints
  app.get("/api/achievements", async (req, res) => {
    try {
      // Use JWT auth check like other endpoints
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = parseInt(req.user.id);
      const { achievementStorage } = await import("../achievement-storage");
      const achievements = achievementStorage.getAchievements();
      const userAchievements = achievementStorage.getUserAchievements(userId);
      
      // Check for new achievements based on user data
      const newAchievements = achievementStorage.checkAndUnlockAchievements(userId, req.user.balance || 0);
      
      res.json({
        achievements,
        userAchievements: [...userAchievements, ...newAchievements]
      });
    } catch (error) {
      console.error("Achievement fetch error:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.post("/api/achievements/:achievementId/mark-viewed", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { achievementStorage } = await import("../achievement-storage");
      achievementStorage.markAchievementAsViewed(parseInt(req.user.id), req.params.achievementId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark achievement viewed error:", error);
      res.status(500).json({ message: "Failed to mark achievement as viewed" });
    }
  });

  // Trigger game win achievements (endpoint for game win events)
  app.post("/api/achievements/game-win", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { achievementStorage } = await import("../achievement-storage");
      const newAchievements = achievementStorage.unlockGameWinAchievement(parseInt(req.user.id));
      res.json({ newAchievements });
    } catch (error) {
      console.error("Game win achievement error:", error);
      res.status(500).json({ message: "Failed to process game win achievements" });
    }
  });

  // Routes registered successfully
}