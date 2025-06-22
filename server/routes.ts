import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertFileSchema, insertFeedbackSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
      }

      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({ email, name });
      }

      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // File routes
  app.get("/api/files", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const files = await storage.getFilesByUser(userId);
      res.json({ files });
    } catch (error) {
      console.error("Get files error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const fileData = insertFileSchema.parse(req.body);
      const file = await storage.createFile(fileData);
      res.json({ file });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid file data", details: error.errors });
      }
      console.error("Create file error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/files/:id", async (req, res) => {
    try {
      const fileId = req.params.id;
      const updates = req.body;
      
      const file = await storage.updateFile(fileId, updates);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json({ file });
    } catch (error) {
      console.error("Update file error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const fileId = req.params.id;
      const deleted = await storage.deleteFile(fileId);
      
      if (!deleted) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete file error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const fileId = req.params.id;
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json({ file });
    } catch (error) {
      console.error("Get file error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Feedback routes
  app.get("/api/feedback", async (req, res) => {
    try {
      const fileId = req.query.fileId as string;
      
      if (!fileId) {
        return res.status(400).json({ error: "fileId is required" });
      }

      const feedbackList = await storage.getFeedbackByFile(fileId);
      res.json({ feedback: feedbackList });
    } catch (error) {
      console.error("Get feedback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(feedbackData);
      res.json({ feedback });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid feedback data", details: error.errors });
      }
      console.error("Create feedback error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const stats = await storage.getStats(userId);
      res.json({ stats });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
