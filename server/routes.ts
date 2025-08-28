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
      // Use JWT auth check like other endpoints
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = parseInt(req.user.id);
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

      achievementStorage.markAchievementAsViewed(parseInt(req.user.id), req.params.achievementId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark achievement viewed error:", error);
      res.status(500).json({ message: "Failed to mark achievement as viewed" });
    }
  });

  // Note: Welcome achievement will be triggered in the existing auth routes

  // Trigger game win achievements (endpoint for game win events)
  app.post("/api/achievements/game-win", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const newAchievements = achievementStorage.unlockGameWinAchievement(parseInt(req.user.id));
      res.json({ newAchievements });
    } catch (error) {
      console.error("Game win achievement error:", error);
      res.status(500).json({ message: "Failed to process game win achievements" });
    }
  });

  // Notification preferences endpoints
  app.get("/api/notification-preferences/:type", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = parseInt(req.user.id);
      const notificationType = req.params.type;
      
      // Import database functions
      const { userNotificationPrefs } = await import("../shared/schema");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");
      
      const [preference] = await db.select().from(userNotificationPrefs).where(eq(userNotificationPrefs.userId, userId));
      
      if (!preference) {
        // Default to showing popup if no preference exists
        return res.json({ shouldShow: true, isDismissed: false });
      }
      
      // Check if 24 hours have passed since dismissal
      const dismissedAt = new Date(preference.dismissedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60);
      
      const shouldShow = hoursDiff >= 24; // Show again after 24 hours
      
      res.json({ 
        shouldShow: shouldShow, 
        isDismissed: !shouldShow,
        dismissedAt: preference.dismissedAt 
      });
    } catch (error) {
      console.error("Notification preference fetch error:", error);
      res.status(500).json({ message: "Failed to fetch notification preference" });
    }
  });

  app.post("/api/notification-preferences/:type/dismiss", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = parseInt(req.user.id);
      const notificationType = req.params.type;
      
      // Import database functions
      const { userNotificationPrefs } = await import("../shared/schema");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");
      
      // Try to update existing record or create new one
      const [existing] = await db.select().from(userNotificationPrefs).where(eq(userNotificationPrefs.userId, userId));
      
      if (existing) {
        // Update existing record
        await db.update(userNotificationPrefs)
          .set({ dismissedAt: new Date().toISOString() })
          .where(eq(userNotificationPrefs.userId, userId));
      } else {
        // Create new record
        await db.insert(userNotificationPrefs).values({
          userId,
          notificationType: notificationType,
          dismissedAt: new Date().toISOString()
        });
      }
      
      res.json({ message: "Notification preference updated" });
    } catch (error) {
      console.error("Notification preference update error:", error);
      res.status(500).json({ message: "Failed to update notification preference" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
