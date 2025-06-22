import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, projects, files, feedback, type User, type InsertUser, type Project, type InsertProject, type File, type InsertFile, type Feedback, type InsertFeedback } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project management
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // File management
  getFile(id: string): Promise<File | undefined>;
  getFilesByUser(userId: number): Promise<File[]>;
  getFilesByProject(projectId: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, updates: Partial<File>): Promise<File | undefined>;
  deleteFile(id: string): Promise<boolean>;
  
  // Feedback management
  getFeedback(id: string): Promise<Feedback | undefined>;
  getFeedbackByFile(fileId: string): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Stats
  getStats(userId?: number, projectId?: string): Promise<{
    totalFiles: number;
    cleanedRecords: number;
    avgAccuracy: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const result = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getFile(id: string): Promise<File | undefined> {
    const result = await db.select().from(files).where(eq(files.id, id)).limit(1);
    return result[0];
  }

  async getFilesByUser(userId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.userId, userId)).orderBy(desc(files.uploadTime));
  }

  async getFilesByProject(projectId: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.projectId, projectId)).orderBy(desc(files.uploadTime));
  }

  async createFile(file: InsertFile): Promise<File> {
    const result = await db.insert(files).values(file).returning();
    return result[0];
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | undefined> {
    const result = await db.update(files).set(updates).where(eq(files.id, id)).returning();
    return result[0];
  }

  async deleteFile(id: string): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getFeedback(id: string): Promise<Feedback | undefined> {
    const result = await db.select().from(feedback).where(eq(feedback.id, id)).limit(1);
    return result[0];
  }

  async getFeedbackByFile(fileId: string): Promise<Feedback[]> {
    return await db.select().from(feedback).where(eq(feedback.fileId, fileId));
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const result = await db.insert(feedback).values(feedbackData).returning();
    return result[0];
  }

  async getStats(userId?: number, projectId?: string): Promise<{ totalFiles: number; cleanedRecords: number; avgAccuracy: number; }> {
    let allFiles;
    if (projectId) {
      allFiles = await db.select().from(files).where(eq(files.projectId, projectId));
    } else if (userId) {
      allFiles = await db.select().from(files).where(eq(files.userId, userId));
    } else {
      allFiles = await db.select().from(files);
    }
    
    const totalFiles = allFiles.length;
    let cleanedRecords = 0;
    let totalAccuracy = 0;
    let filesWithStats = 0;

    allFiles.forEach(file => {
      if (file.stats && typeof file.stats === 'object' && 'cleanedRecords' in file.stats) {
        cleanedRecords += (file.stats as any).cleanedRecords || 0;
        if ('accuracy' in file.stats && typeof (file.stats as any).accuracy === 'number') {
          totalAccuracy += (file.stats as any).accuracy;
          filesWithStats++;
        }
      }
    });

    const avgAccuracy = filesWithStats > 0 ? totalAccuracy / filesWithStats : 0;

    return {
      totalFiles,
      cleanedRecords,
      avgAccuracy
    };
  }
}

export const storage = new DatabaseStorage();
