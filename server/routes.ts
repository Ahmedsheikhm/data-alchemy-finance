import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertProjectSchema, insertFileSchema, insertFeedbackSchema } from "@shared/schema";
import { agentManager } from "./ai-agents/AgentManager";

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

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const projects = await storage.getProjectsByUser(userId);
      res.json({ projects });
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json({ project });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      console.error("Create project error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const projectId = req.params.id;
      const updates = req.body;
      
      const project = await storage.updateProject(projectId, updates);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({ project });
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const projectId = req.params.id;
      const deleted = await storage.deleteProject(projectId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({ project });
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/projects/:id/files", async (req, res) => {
    try {
      const projectId = req.params.id;
      const files = await storage.getFilesByProject(projectId);
      res.json({ files });
    } catch (error) {
      console.error("Get project files error:", error);
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
      const projectId = req.query.projectId as string;
      const stats = await storage.getStats(userId, projectId);
      res.json({ stats });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Agent routes
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = agentManager.getAllAgentsStatus();
      res.json({ agents });
    } catch (error) {
      console.error("Get agents error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/agents/:agentName/status", async (req, res) => {
    try {
      const { agentName } = req.params;
      const status = agentManager.getAgentStatus(agentName);
      
      if (!status) {
        return res.status(404).json({ error: "Agent not found" });
      }

      res.json({ status });
    } catch (error) {
      console.error("Get agent status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/agents/:agentName/logs", async (req, res) => {
    try {
      const { agentName } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = agentManager.getAgentLogs(agentName, limit);
      res.json({ logs });
    } catch (error) {
      console.error("Get agent logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/agents/:agentName/config", async (req, res) => {
    try {
      const { agentName } = req.params;
      const config = agentManager.getAgentConfiguration(agentName);
      
      if (!config) {
        return res.status(404).json({ error: "Agent not found" });
      }

      res.json({ config });
    } catch (error) {
      console.error("Get agent config error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/agents/:agentName/config", async (req, res) => {
    try {
      const { agentName } = req.params;
      const config = req.body;
      
      await agentManager.updateAgentConfiguration(agentName, config);
      res.json({ success: true });
    } catch (error) {
      console.error("Update agent config error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/agents/:agentName/tasks", async (req, res) => {
    try {
      const { agentName } = req.params;
      const { taskType, data } = req.body;
      
      const taskId = await agentManager.submitTask(agentName, taskType, data);
      res.json({ taskId });
    } catch (error) {
      console.error("Submit task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // File processing route
  app.post("/api/files/:id/process", async (req, res) => {
    try {
      const fileId = req.params.id;
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Submit parsing task
      const taskId = await agentManager.submitTask('parser', 'parse_csv', {
        content: file.originalData,
        filename: file.name
      });

      // Update file status
      await storage.updateFile(fileId, { 
        status: 'processing',
        progress: 25 
      });

      res.json({ taskId, message: "Processing started" });
    } catch (error) {
      console.error("Process file error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
