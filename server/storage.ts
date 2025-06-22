import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, files, feedback, type User, type InsertUser, type File, type InsertFile, type Feedback, type InsertFeedback } from "@shared/schema";
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
  
  // File management
  getFile(id: string): Promise<File | undefined>;
  getFilesByUser(userId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, updates: Partial<File>): Promise<File | undefined>;
  deleteFile(id: string): Promise<boolean>;
  
  // Feedback management
  getFeedback(id: string): Promise<Feedback | undefined>;
  getFeedbackByFile(fileId: string): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Stats
  getStats(userId?: number): Promise<{
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

  async getFile(id: string): Promise<File | undefined> {
    const result = await db.select().from(files).where(eq(files.id, id)).limit(1);
    return result[0];
  }

  async getFilesByUser(userId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.userId, userId)).orderBy(desc(files.uploadTime));
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

  async getStats(userId?: number): Promise<{ totalFiles: number; cleanedRecords: number; avgAccuracy: number; }> {
    const allFiles = userId 
      ? await db.select().from(files).where(eq(files.userId, userId))
      : await db.select().from(files);
    
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
