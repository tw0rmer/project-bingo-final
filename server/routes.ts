import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { achievementStorage } from "./achievement-storage";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Achievement endpoints
  app.get("/api/achievements", async (req, res) => {
    try {
      // For now, using session-based auth check
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.session.userId;
      const achievements = achievementStorage.getAchievements();
      const userAchievements = achievementStorage.getUserAchievements(userId);
      
      // Check for new achievements based on user data
      // For demo, we'll check with a default balance
      const newAchievements = achievementStorage.checkAndUnlockAchievements(userId, 2000);
      
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
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      achievementStorage.markAchievementAsViewed(req.session.userId, req.params.achievementId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark achievement viewed error:", error);
      res.status(500).json({ message: "Failed to mark achievement as viewed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
