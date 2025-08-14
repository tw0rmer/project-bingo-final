import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);
  return httpServer;
}
