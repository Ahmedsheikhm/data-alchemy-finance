import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(), // 'uploading' | 'processing' | 'completed' | 'error'
  progress: integer("progress").default(0).notNull(),
  uploadTime: timestamp("upload_time").defaultNow().notNull(),
  processTime: timestamp("process_time"),
  originalData: jsonb("original_data"),
  cleanedData: jsonb("cleaned_data"),
  headers: jsonb("headers"),
  cleaningResults: jsonb("cleaning_results"),
  issues: jsonb("issues"),
  stats: jsonb("stats"),
});

export const feedback = pgTable("feedback", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileId: text("file_id").references(() => files.id).notNull(),
  fieldName: text("field_name").notNull(),
  originalValue: text("original_value").notNull(),
  cleanedValue: text("cleaned_value").notNull(),
  userCorrection: text("user_correction"),
  rating: text("rating").notNull(), // 'correct' | 'incorrect' | 'partial'
  confidence: decimal("confidence").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  uploadTime: true,
  processTime: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
